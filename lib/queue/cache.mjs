import fs from 'fs';
import path from 'path';
import cachedir from 'cachedir';
import pkg from '../../package.json';

const CACHE_DIR = cachedir(pkg.name);
const CACHE_PATH = path.join(CACHE_DIR, 'queue.json');

function loadCacheSync ()
{
    /* eslint-disable no-sync */

    if (!fs.existsSync(CACHE_PATH))
    {
        return [];
    }

    const json = fs.readFileSync(CACHE_PATH);

    try
    {
        const data = JSON.parse(json);
        console.log('QUEUE', 'Loaded queue of length', data.length);
        return data || [];
    }
    catch (error)
    {
        console.warn('QUEUE', 'Failed to unserialize queue cache file, ignoring.');
    }

    return [];

    /* eslint-enable no-sync */
}

function mkCacheDir ()
{
    return new Promise((resolve, reject) => {
        fs.mkdir(CACHE_DIR, error => {
            if (error && error.code !== 'EEXIST')
            {
                reject(new Error(
                    `Failed to create queue cache directory ${CACHE_DIR}: ${error}`
                ));
            }
            else
            {
                resolve(CACHE_DIR);
            }
        });
    });
}

function writeCacheFile (queue)
{
    return new Promise((resolve, reject) => {
        fs.writeFile(CACHE_PATH, JSON.stringify(queue, null, '  '), error => {
            if (error)
            {
                reject(new Error(
                    `Failed to save queue cache to ${CACHE_PATH}: ${error}`
                ));
            }
            else
            {
                resolve();
            }
        });
    });
}

async function writeCache (queue)
{
    try
    {
        await mkCacheDir();
        await writeCacheFile(queue);
    }
    catch (error)
    {
        console.warn('QUEUE', error);
    }
}


export {
    loadCacheSync,
    writeCache,
};
