import fs from 'fs';
import * as statuses from '../static/lib/statuses';
import { values as args } from './args-definitions';

let status;
let lastChange;

async function getStatus ()
{
    if (![statuses.FREE, status.OCCUPIED].includes(status))
    {
        status = await checkStatus();
    }

    return status;
}

async function checkStatus ()
{
    const statusRaw = (await readFile(args.STATUS_FILE, {
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
        console.log('STATUS', status, '→', newStatus);
        lastChange = new Date();
    }

    status = newStatus;
    return status;
}

function getLastStatusChange ()
{
    return lastChange;
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


export {
    getStatus,
    checkStatus,
    getLastStatusChange,
};
