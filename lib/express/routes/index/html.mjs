import path from 'path';
import fs from 'fs';
import { getEnv } from '../../../utils';
import {
    getAppName,
    getAppDescription,
    getBaseUrl,
} from '../../../metadata';
import { getStatus, isClientInQueue } from '../../../queue';
import statusLabels from '../../../../static/lib/statusLabels';
import statusColours from '../../../statusColours';

const ENV = getEnv();
const PUBLIC_DIR = path.resolve('./static');
/* eslint-disable no-magic-numbers */
const CHECK_INTERVAL = 5000;
const CHECK_INTERVAL_S = ~~(CHECK_INTERVAL / 1000);
/* eslint-enable no-magic-numbers */
const INDEX_HTML = fs.readFileSync(path.join(PUBLIC_DIR, 'index.html')).toString();


function renderEnvIndicator (env)
{
    return `
        <aside class="env-indicator">
            ${env}
        </aside>
    `;
}

function renderColoursCssVars ()
{
    return Object.getOwnPropertyNames(statusColours).reduce(
        (css, name) => {
            const { bg, fg } = statusColours[name];
            css.push(`--${name}-bg:${bg}`);
            css.push(`--${name}-fg:${fg}`);
            return css;
        },
        []
    )
        .join(';');
}


// eslint-disable-next-line max-lines-per-function
export default async (req, res) => {
    const clientId = req.cookies.ClientId;
    const status = getStatus(clientId);

    let thisIndex = INDEX_HTML
        .replace(/<!-- STATUS -->/g, status)
        .replace(/<!-- STATUS_LABEL -->/g, statusLabels[status])
        .replace(/<!-- STATUS_BG -->/g, statusColours[status].bg)
        .replace(/<!-- CHECK_INTERVAL -->/g, CHECK_INTERVAL_S)
        .replace(/<!-- APP_NAME -->/g, getAppName())
        .replace(/<!-- APP_DESCRIPTION -->/g, getAppDescription())
        .replace(/<!-- BASE_URL -->/g, getBaseUrl())
        .replace('<body', `<body style="${renderColoursCssVars()}"`);

    if (isClientInQueue(clientId))
    {
        thisIndex = thisIndex.replace(
            '<button id=subscribe',
            '<button id=subscribe disabled',
        );
    }

    if (req.headers.dnt === '1')
    {
        thisIndex = thisIndex.replace(
            /var DNT = [^\n;]*;/,
            'var DNT = true;'
        );
    }

    if ((req.cookies.JS || req.headers['x-js']) === '1')
    {
        thisIndex = thisIndex.replace(
            /<meta http-equiv="refresh" [^>]*>/,
            ''
        );
    }

    if (ENV !== 'production')
    {
        thisIndex = thisIndex.replace(
            '</body>',
            `${renderEnvIndicator(ENV)}</body>`
        );
    }

    res.set('Content-Type', 'text/html');
    res.set('Vary', [
        res.get('Vary'),
        'DNT',
        'X-JS',
    ].filter(a => a).join(', '));
    res.send(thisIndex);
};
