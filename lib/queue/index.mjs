import EventEmitter from 'events';
import { getStatus } from '../status';
import * as statuses from '../../static/lib/statuses';
import { loadCacheSync, writeCache } from './cache';

// Time that is required to get to the toilet
// eslint-disable-next-line no-magic-numbers
const TRAVEL_TIME_TO_TOILET_MS = 1 * 60 * 1000;

const theQueue = loadCacheSync();
const queue = new EventEmitter();

let currentClientId = null;
let currentClientIdTimeout;


function push (clientId, data)
{
    theQueue.push({ clientId, data });
    writeCache(theQueue);
}

function unshift (clientId, data)
{
    theQueue.unshift({ clientId, data });
    writeCache(theQueue);
}

function shift ()
{
    const element = theQueue.shift();
    writeCache(theQueue);

    if (element)
    {
        currentClientId = element.clientId;
        clearTimeout(currentClientIdTimeout);
        currentClientIdTimeout = setTimeout(
            () => {
                currentClientId = null;
                handleStatusChange(getStatus());
            },
            TRAVEL_TIME_TO_TOILET_MS
        );
    }

    return element;
}

function includes (cId)
{
    // eslint-disable-next-line no-magic-numbers
    return theQueue.findIndex(({ clientId }) => clientId === cId) !== -1;
}

function getSize ()
{
    return theQueue.length;
}

function getStatusForClient (clientId)
{
    const status = getStatus();

    if (
        currentClientId
        && clientId !== currentClientId
        && status === statuses.FREE
    )
    {
        return statuses.OCCUPIED;
    }

    return status;
}

function handleStatusChange (status)
{
    if (status !== statuses.FREE)
    {
        if (status === status.OCCUPIED)
        {
            clearTimeout(currentClientIdTimeout);
            currentClientId = null;
        }

        return;
    }

    const data = shift();
    if (!data)
    {
        return;
    }

    queue.emit('shift', data);
}


queue.on('status-change', ({ status }) => handleStatusChange(status));

queue.push = push;
queue.unshift = unshift;
queue.includes = includes;
Object.defineProperty(queue, 'size', { get: getSize });
queue.getStatus = getStatusForClient;

export {
    push as addToQueue,
    unshift as insertIntoQueue,
    getSize as getQueueSize,
    getStatusForClient as getStatus,
    includes as isClientInQueue,
};
export default queue;
