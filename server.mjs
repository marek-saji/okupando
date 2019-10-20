import { getEnv } from './lib/utils';
import createHttpsApp from './lib/express/greenlock';
import './lib/cli-env';
import { values as args } from './lib/args-definitions';
import app from './lib/express';
import * as statuses from './static/lib/statuses';
import { setStatus, getLastStatusChange, getStatus } from './lib/status';
import queue from './lib/queue';
import { notifyAboutFree } from './lib/push';
import {
    createStatusObserver as createGpioStatusObserver,
} from './lib/status/observer/gpio';
import {
    createStatusObserver as createDebugStatusObserver,
} from './lib/status/observer/debug';
import ws from 'ws';
import http from 'http';
import https from 'https';

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
    let server;
    if (args.HTTPS_PORT) {
        const httpsApp = createHttpsApp(app);
        server = https.createServer(httpsApp.tlsOptions)
            .listen(args.HTTPS_PORT);
    } else {
        server = http.createServer().listen(args.HTTP_PORT);
        server.on('request', app);
    }
    return server;
}

function startWsServer (server)
{
    const wss = new ws.Server({
        server,
    });

    queue.on('status-change', ({ status, lastChange }) => {
        wss.clients.forEach(client => {
            if (client.readyState === ws.OPEN) {
                client.send(
                    JSON.stringify(
                        { status, lastChange }
                    )
                );
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

startStatusObserver();
const server = startHttpServer();
startWsServer(server);
