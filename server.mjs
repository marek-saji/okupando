import { getEnv } from './lib/utils';
import createHttpsApp from './lib/express/greenlock';
import './lib/cli-env';
import { values as args } from './lib/args-definitions';
import app from './lib/express';
import { setStatus, getLastStatusChange, getStatus } from './lib/status';
import queue from './lib/queue';
import { notifyAboutFree } from './lib/push';
import {
    createStatusObserver as createGpioStatusObserver,
} from './lib/status/observer/gpio';
import {
    createStatusObserver as createDebugStatusObserver,
} from './lib/status/observer/debug';
import {
    createStatusIndicator as createGpioStatusIndicator,
} from './lib/status/indicator/gpio';
import ws from 'ws';

const ENV = getEnv();

async function startStatusIndicator ()
{
    if (!args.LIGHT_GPIO_CHANNEL)
    {
        return;
    }

    const indicator = await createGpioStatusIndicator({
        channel: args.LIGHT_GPIO_CHANNEL,
    });

    queue.on('status-change', () => {
        indicator.set(queue.getStatusForClient());
    });
}

async function startStatusObserver ()
{
    let statusObserver;

    if (args.BUTTON_GPIO_CHANNEL)
    {
        statusObserver = await createGpioStatusObserver({
            channel: args.BUTTON_GPIO_CHANNEL,
        });
    }
    else if (ENV === 'development')
    {
        console.info('Using debug development status change observer.');
        statusObserver = await createDebugStatusObserver();
    }
    else
    {
        throw new Error('BUTTON_GPIO_CHANNEL not configured');
    }

    statusObserver.on('change', ({ status }) => {
        setStatus(status);
        queue.emit('status-change', { status, lastChange: getLastStatusChange() });
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
        return createHttpsApp(app).listen(
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

    return app.listen(args.HTTP_PORT, args.HOST, () => {
        console.log(
            'HTTP',
            'Listening on',
            `http://${args.HOST}:${args.HTTP_PORT}`
        );
    });
}

function startWsServer (server)
{
    const wss = new ws.Server({
        server,
    });

    queue.on('status-change', ({ lastChange }) => {
        wss.clients.forEach(client => {
            if (client.readyState === ws.OPEN)
            {
                client.send(JSON.stringify({
                    status: getStatus(),
                    lastChange,
                }));
            }
        });
    });

    wss.on('connection', client => {
        client.send(JSON.stringify({
            status: getStatus(),
            lastChange: getLastStatusChange(),
        }));
    });
}

startStatusIndicator();
startStatusObserver();
const server = startHttpServer();
startWsServer(server);
