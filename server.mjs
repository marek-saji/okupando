import { getEnv } from './lib/utils';
import createHttpsApp from './lib/express/greenlock';
import './lib/cli-env';
import { values as args } from './lib/args-definitions';
import app from './lib/express';
import * as statuses from './static/lib/statuses';
import { setStatus } from './lib/status';
import queue from './lib/queue';
import { notifyAboutFree } from './lib/push';
import {
    createStatusObserver as createGpioStatusObserver,
} from './lib/status/observer/gpio';
import {
    createStatusObserver as createDebugStatusObserver,
} from './lib/status/observer/debug';

const ENV = getEnv();


async function startStatusObserver ()
{
    let statusObserver;

    if (args.GPIO_CHANNEL)
    {
        statusObserver = await createGpioStatusObserver({
            channel: args.GPIO_CHANNEL,
        });
    }
    else if (ENV === 'development')
    {
        console.info('Using debug development status change observer.');
        statusObserver = await createDebugStatusObserver();
    }
    else
    {
        throw new Error('GPIO_CHANNEL not configured');
    }

    statusObserver.on('change', ({ status }) => {
        setStatus(status);

        if (status === statuses.FREE)
        {
            queue.emit('status-change', { status });
        }
    });

    queue.on('shift', ({ data: { subscription } }) => {
        if (subscription)
        {
            notifyAboutFree(subscription);
        }
    });
}

function startHttpServer ()
{
    if (args.HTTPS_PORT)
    {
        createHttpsApp(app).listen(
            args.HTTP_PORT,
            args.HTTPS_PORT,
            () => {
                console.log(
                    'HTTP',
                    'Listening on',
                    `http://${args.HOST}:${args.HTTP_PORT}`,
                );
            },
            () => {
                console.log(
                    'HTTP',
                    'Listening on',
                    `https://${args.HOST}:${args.HTTPS_PORT}`
                );
            },
        );
    }
    else
    {
        app.listen(args.HTTP_PORT, args.HOST, () => {
            console.log(
                'HTTP',
                'Listening on',
                `http://${args.HOST}:${args.HTTP_PORT}`
            );
        });
    }
}

startStatusObserver();
startHttpServer();
