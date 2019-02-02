import path from 'path';
import fs from 'fs';
import express from 'express';
import * as statuses from './static/lib/statuses';
import statusLabels from './static/lib/statusLabels';
import pkg from './package.json';

const CHECK_INTERVAL = 5000;
const LONG_POLL_TRY_INTERVAL = 5000;
const LONG_POLL_TRY_COUNT = 30000 / LONG_POLL_TRY_INTERVAL;
const PUBLIC_DIR = path.resolve('./static');

const PORT =
    process.env.PORT
    || process.env.npm_config_okupando_port
    || process.env.npm_config_port
    || 3000;

const app = express();
const index = fs.readFileSync(path.join(PUBLIC_DIR, 'index.html')).toString();


function printUsage ()
{
    console.log('Options:');
    console.log();
    console.log(' port  Port to run HTTP daemon on. Defaults to 3000');
    console.log();
    console.log('You can set an option by:');
    console.log(`1. Passing --option-name=VALUE argument`);
    console.log(`2. Running \`npm config set okupando-option-name VALUE\``);
    console.log(`3. Setting OPTION_NAME=VALUE environment variable.`);
}


let free = false;
setInterval (() => { free = !free; }, 10000);
function checkStatus () // TODO Implement me
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
        const status = checkStatus();
        if (prevStatus !== status)
        {
            res.json(status);
            return;
        }
        await wait(LONG_POLL_TRY_INTERVAL);
    }
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

app.get('/index.html', (req, res) => res.redirect('/'));

app.get('/', (req, res) => {
    const free = checkStatus();
    const status = free ? statuses.FREE : statuses.OCCUPIED;
    const thisIndex = index
        .replace('data-status=""', `data-status="${status}"`)
        .replace('<!-- STATE_LABEL -->', statusLabels[status]);
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

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
