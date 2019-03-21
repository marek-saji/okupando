import { ERROR } from '../static/lib/statuses';

let status;
let lastChange;

async function setStatus (newStatus)
{
    if (newStatus !== status)
    {
        lastChange = new Date();
    }

    console.log('STATUS', status, '→', newStatus);

    status = newStatus;
}

function getStatus ()
{
    if (status === undefined)
    {
        console.warn('Tried to get status while it’s undefined.');
        return ERROR;
    }

    return status;
}

function getLastStatusChange ()
{
    return lastChange;
}


export {
    setStatus,
    getStatus,
    getLastStatusChange,
};
