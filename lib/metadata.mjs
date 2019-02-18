import pkg from '../package.json';
import { getEnv } from './utils';

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


export {
    getAppName,
    getAppDescription,
    getAppKeywords,
};
