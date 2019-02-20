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

async function getStatus ()
{
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
