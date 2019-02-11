/* eslint-disable no-console */

import path from 'path';
import fs from 'fs';
import express from 'express';
import webPush from 'web-push';
import pkg from './package.json';
import * as statuses from './static/lib/statuses';
import statusLabels from './static/lib/statusLabels';
import freeNotification from './static/lib/freeNotification';
import {
    addSubscription,
    popAllSubscriptions,
} from './lib/subscriptions';
import {
    HTTP_STATUS_OK,
    HTTP_STATUS_BAD_REQUEST,
    HTTP_STATUS_SERVER_ERROR,
} from './static/lib/http-status-codes';

const SEC_MS = 1000; // miliseconds in a second

const CHECK_INTERVAL = 5000;
const CHECK_INTERVAL_S = ~~(CHECK_INTERVAL / SEC_MS);
const LONG_POLL_TRY_INTERVAL = 5000;
const HTTP_TIMEOUT = 30000;
const LONG_POLL_TRY_COUNT = HTTP_TIMEOUT / LONG_POLL_TRY_INTERVAL;
const PUBLIC_DIR = path.resolve('./static');

const DEFAULT_HOST = '0.0.0.0';
const DEFAULT_PORT = 3000;
const ENV = process.env.NODE_ENV || 'development';
const HOST =
    process.env.HOST
    || process.env.npm_config_okupando_host
    || process.env.npm_config_host
    || DEFAULT_HOST;
const PORT =
    process.env.PORT
    || process.env.npm_config_okupando_port
    || process.env.npm_config_port
    || DEFAULT_PORT;
const STATUS_FILE_PATH =
    process.env.STATUS_FILE
    || process.env.npm_config_okupando_status_file
    || process.env.npm_config_status_file;
const WEB_PUSH_EMAIL =
    process.env.WEB_PUSH_EMAIL
    || process.env.npm_config_okupando_web_push_email
    || process.env.npm_config_web_push_email;
const WEB_PUSH_PUBLIC_KEY =
    process.env.WEB_PUSH_PUBLIC_KEY
    || process.env.npm_config_okupando_web_push_public_key
    || process.env.npm_config_web_push_public_key;
const WEB_PUSH_PRIVATE_KEY =
    process.env.WEB_PUSH_PRIVATE_KEY
    || process.env.npm_config_okupando_web_push_private_key
    || process.env.npm_config_web_push_private_key;
const WEB_PUSH_CONFIGURED =
    WEB_PUSH_EMAIL
    && WEB_PUSH_PUBLIC_KEY
    && WEB_PUSH_PRIVATE_KEY;

const app = express();
const index = fs.readFileSync(path.join(PUBLIC_DIR, 'index.html')).toString();

let status;


function printUsage ()
{
    /* eslint-disable max-len */
    console.log('Options:');
    console.log();
    console.log(' web-push-public-key   Web Push VAPID public key');
    console.log(' web-push-private-key  Web Push VAPID public key');
    console.log(' web-push-email        Web Push e-mail address');
    console.log(' port                  Port to run HTTP daemon on. Defaults to 3000');
    console.log(' status-file           Path to file with occupation status (0|1)');
    console.log();
    console.log('To generate web push vapid keys run `npx web-push generate-vapid-keys`.');
    console.log();
    console.log('You can set an option by:');
    console.log('1. Passing --option-name=VALUE argument');
    console.log('2. Running `npm config set okupando-option-name VALUE`');
    console.log('3. Setting OPTION_NAME=VALUE environment variable.');
    /* eslint-enable max-len */
}


function wait (ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

function readFile (filePath, options = {})
{
    if (fs.promises && fs.promises.readFile)
    {
        return fs.promises.readFile(filePath, options);
    }

    return new Promise((resolve, reject) => {
        fs.readFile(filePath, options, (err, data) => {
            if (err)
            {
                reject(err);
            }
            else
            {
                resolve(data);
            }
        });
    });
}


// eslint-disable-next-line no-magic-numbers
if (['-h', '--help'].includes(process.argv[2]))
{
    printUsage();
    process.exit(0);
}

async function checkStatus ()
{
    const statusRaw = (await readFile(STATUS_FILE_PATH, {
        encoding: 'utf-8',
    })).trim();

    let newStatus;
    if (statusRaw === '1')
    {
        newStatus = statuses.FREE;
    }
    else if (statusRaw === '0')
    {
        newStatus = statuses.OCCUPIED;
    }
    else
    {
        newStatus = statuses.ERROR;
    }

    if (status !== newStatus)
    {
        console.log('Status changed from', status, 'to', newStatus);
    }

    status = newStatus;
    return status;
}

async function getStatus ()
{
    if (![statuses.FREE, status.OCCUPIED].includes(status))
    {
        status = await checkStatus();
    }

    return status;
}

async function monitorStatus () {
    checkStatus();
    if (
        WEB_PUSH_CONFIGURED
        && status === statuses.FREE
    )
    {
        pushNotifications();
    }

    setTimeout(monitorStatus, CHECK_INTERVAL);
}

function pushNotifications ()
{
    if (!WEB_PUSH_CONFIGURED)
    {
        console.error('Called pushNotifications, but Web Push is not configured.');
        return;
    }

    const payload = JSON.stringify(freeNotification);
    const options = {
        TTL: 60,
        vapidDetails: {
            subject: `mailto:${WEB_PUSH_EMAIL}`,
            publicKey: WEB_PUSH_PUBLIC_KEY,
            privateKey: WEB_PUSH_PRIVATE_KEY,
        },
    };

    const subscriptions = popAllSubscriptions();
    if (subscriptions.length)
    {
        console.log(`Sending ${subscriptions.length} notifications`);
        for (const subscription of subscriptions)
        {
            webPush.sendNotification(
                subscription,
                payload,
                options
            );
        }
    }
}

function renderEnvIndicator (env)
{
    return `
        <aside class="env-indicator">
            ${env}
        </aside>
    `;
}


app.use(express.json());

app.get('/check', async (req, res) => {
    // TODO Return occupation duration
    // TODO Refactor so that multiple clients don’t multiply
    //      checkStatus calls
    const prevStatus = req.query.status;
    for (
        let tries = prevStatus ? LONG_POLL_TRY_COUNT : 1;
        tries !== 0;
        tries -= 1
    )
    {
        const currentStatus = await getStatus();
        if (prevStatus !== currentStatus)
        {
            if (currentStatus === statuses.ERROR)
            {
                res.status(HTTP_STATUS_SERVER_ERROR);
            }
            res.json(currentStatus);
            return;
        }
        await wait(LONG_POLL_TRY_INTERVAL);
    }
});

app.put('/subscribe', (req, res) => {
    if (!WEB_PUSH_CONFIGURED)
    {
        console.error('Requested PUT /subscribe, but Web Push is not configured.');
        res.sendStatus(HTTP_STATUS_BAD_REQUEST);
        return;
    }

    const subscription = req.body;
    if (!subscription.endpoint || !subscription.keys)
    {
        console.error('Invalid subscription passed:', subscription);
        res.sendStatus(HTTP_STATUS_BAD_REQUEST);
        return;
    }

    console.log('New subscription');
    addSubscription(subscription);

    res.sendStatus(HTTP_STATUS_OK);
});

app.get('/manifest.json', (req, res) => {
    res.set('Content-Type', 'application/manifest+json');
    res.send({
        lang: 'pl-PL',
        name: pkg.name,
        short_name: pkg.name,
        icons: [
            {
                src: '/icon.svg',
                sizes: 'any',
                type: 'image/svg+xml',
            },
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
        start_url: '/?utm_source=webmanifest',
        display: 'standalone',
        theme_color: 'black',
        background_color: 'black',
        categories: pkg.keywords,
    });
});

app.get('/web-push-public-key.mjs', (req, res) => {
    res.set('Content-Type', 'application/javascript; charset=UTF-8');
    res.send(`export default ${JSON.stringify(WEB_PUSH_PUBLIC_KEY)};`);
});

app.get('/index.html', (req, res) => res.redirect('/'));

app.get('/', async (req, res) => {
    const currentStatus = await getStatus();
    let thisIndex = index
        // TODO theme-color
        .replace('data-status=""', `data-status="${currentStatus}"`)
        .replace('<!-- STATE_LABEL -->', statusLabels[currentStatus])
        .replace('<!-- CHECK_INTERVAL -->', CHECK_INTERVAL_S);
    if (ENV !== 'production')
    {
        thisIndex = thisIndex.replace(
            '</body>',
            `${renderEnvIndicator(ENV)}</body>`
        );
    }
    res.set('Content-Type', 'text/html');
    res.send(thisIndex);
});

app.get('/*', (req, res) => {
    let file = req.params[0].trim('/');
    if (file === '')
    {
        file = 'index.html';
    }
    res.sendFile(
        file,
        { root: PUBLIC_DIR }
    );
});


if (!STATUS_FILE_PATH)
{
    printUsage();
    console.error();
    console.error('Required status-file option not specified.');
    process.exit(1);
}

if (!WEB_PUSH_CONFIGURED)
{
    console.log('Web Push not configured, continuing without it. Run with --help to see how to fix that.');

    if (!WEB_PUSH_PUBLIC_KEY)
    {
        console.log('Missing web-push-public-key option.');
    }
    if (!WEB_PUSH_PRIVATE_KEY)
    {
        console.log('Missing web-push-public-key option.');
    }
    if (!WEB_PUSH_PRIVATE_KEY)
    {
        console.log('Missing web-push-email option.');
    }
}


monitorStatus();
app.listen(PORT, HOST, () => console.log(`Listening on http://${HOST}:${PORT}`));
