import path from 'path';
import fs from 'fs';
import { getEnv } from '../../../utils';
import { getAppName, getAppDescription } from '../../../metadata';
import { getStatus } from '../../../status';
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


export default async (req, res) => {
    const status = await getStatus();

    let thisIndex = INDEX_HTML
        .replace('data-status=""', `data-status="${status}"`)
        .replace('<!-- STATE_LABEL -->', statusLabels[status])
        .replace('<!-- STATUS_BG -->', statusColours[status].bg)
        .replace('<!-- CHECK_INTERVAL -->', CHECK_INTERVAL_S)
        .replace('<!-- APP_NAME -->', getAppName())
        .replace('<!-- APP_DESCRIPTION -->', getAppDescription())
        .replace('<body', `<body style="${renderColoursCssVars()}"`);

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
    res.send(thisIndex);
};
