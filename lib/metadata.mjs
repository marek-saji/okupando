import pkg from '../package.json';
import { getEnv } from './utils';
import { values as args, HTTPS_CONFIGURED } from './args-definitions';
import whatwgURL from 'whatwg-url';

const { URL } = whatwgURL;
const ENV = getEnv();


function getAppName ()
{
    let name = pkg.name;
    if (ENV !== 'production')
    {
        name = `${name} (${ENV})`;
    }
    return name;
}

function getAppDescription ()
{
    return pkg.description;
}

function getAppKeywords ()
{
    return pkg.keywords;
}

function getBaseUrl ()
{
    const scheme = HTTPS_CONFIGURED ? 'https' : 'http';
    const host = args.HOST;
    const port = HTTPS_CONFIGURED ? args.HTTPS_PORT : args.HTTP_PORT;
    return new URL(`${scheme}://${host}:${port}`).toString();
}


export {
    getAppName,
    getAppDescription,
    getAppKeywords,
    getBaseUrl,
};
