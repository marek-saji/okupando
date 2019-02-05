import path from 'path';
import fs from 'fs';
import express from 'express';
import webPush from 'web-push';
import * as statuses from './static/lib/statuses';
import statusLabels from './static/lib/statusLabels';
import freeNotification from './static/lib/freeNotification';
import pkg from './package.json';

const CHECK_INTERVAL = 5000;
const CHECK_INTERVAL_S = ~~(CHECK_INTERVAL / 1000);
const LONG_POLL_TRY_INTERVAL = 5000;
const LONG_POLL_TRY_COUNT = 30000 / LONG_POLL_TRY_INTERVAL;
const PUBLIC_DIR = path.resolve('./static');

const PORT =
    process.env.PORT
    || process.env.npm_config_okupando_port
    || process.env.npm_config_port
    || 3000;
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

// TODO Dump to file on exit and load on start
const subscriptions = [];


function printUsage ()
{
    console.log('Options:');
    console.log();
    console.log(' web-push-public-key   Web Push VAPID public key');
    console.log(' web-push-private-key  Web Push VAPID public key');
    console.log(' web-push-email        Web Push e-mail address');
    console.log(' port                  Port to run HTTP daemon on. Defaults to 3000');
    console.log();
    console.log('To generate web push vapid keys run `npx web-push generate-vapid-keys`.');
    console.log();
    console.log('You can set an option by:');
    console.log(`1. Passing --option-name=VALUE argument`);
    console.log(`2. Running \`npm config set okupando-option-name VALUE\``);
    console.log(`3. Setting OPTION_NAME=VALUE environment variable.`);
}


let free = false;
setInterval (() => { free = !free; }, 10000);
async function checkStatus () // TODO Implement me
{
    return free ? statuses.FREE : statuses.OCCUPIED;
}

function wait (ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}


if (['-h', '--help'].includes(process.argv[2]))
{
    printUsage();
    process.exit(0);
}

// TODO Make this the only place checkStatus is called,
//      others should use cached value
async function monitorStatus () {
    const status = await checkStatus();
    if (
        WEB_PUSH_CONFIGURED
        && status === statuses.FREE
        && subscriptions.length !== 0
    )
    {
        pushNotifications();
    }

    setTimeout(monitorStatus, CHECK_INTERVAL);
}

function pushNotifications ()
{
    if (! WEB_PUSH_CONFIGURED)
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
        }
    };

    const subs = [ ...subscriptions ];
    subscriptions.length = 0;
    console.log(`Sending ${subs.length} notifications`);
    for (const subscription of subs)
    {
        webPush.sendNotification(
            subscription,
            payload,
            options
        );
    }
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
        const status = await checkStatus();
        if (prevStatus !== status)
        {
            res.json(status);
            return;
        }
        await wait(LONG_POLL_TRY_INTERVAL);
    }
});

app.put('/subscribe', (req, res) => {
    if (! WEB_PUSH_CONFIGURED)
    {
        console.error('Requested PUT /subscribe, but Web Push is not configured.');
        res.sendStatus(400);
        return;
    }

    const subscription = req.body;
    if (! subscription.endpoint || ! subscription.keys)
    {
        console.error('Invalid subscription passed:', subscription);
        res.sendStatus(400);
        return;
    }

    console.log('New subscription');
    subscriptions.push(subscription);
    res.sendStatus(200);
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
    const free = await checkStatus();
    const status = free ? statuses.FREE : statuses.OCCUPIED;
    const thisIndex = index
        .replace('data-status=""', `data-status="${status}"`)
        .replace('<!-- STATE_LABEL -->', statusLabels[status])
        .replace('<!-- CHECK_INTERVAL -->', CHECK_INTERVAL_S);
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


if (! WEB_PUSH_CONFIGURED)
{
    console.log('Web Push not configured, continuing without it. Run with --help to see how to fix that.');

    if (! WEB_PUSH_PUBLIC_KEY)
    {
        console.log('Missing web-push-public-key option.');
    }
    if (! WEB_PUSH_PRIVATE_KEY)
    {
        console.log('Missing web-push-public-key option.');
    }
    if (! WEB_PUSH_PRIVATE_KEY)
    {
        console.log('Missing web-push-email option.');
    }
}

monitorStatus();
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
