import EventEmitter from 'events';
import * as statuses from '../../static/lib/statuses';
import { loadCacheSync, writeCache } from './cache';

const theQueue = loadCacheSync();
const queue = new EventEmitter();

function push (clientId, data)
{
    theQueue.push({ clientId, data });
    writeCache(theQueue);
}

function shift ()
{
    const element = theQueue.shift();
    writeCache(theQueue);
    return element;
}

function getSize ()
{
    return theQueue.length;
}

queue.on('status-change', ({ status }) => {
    if (status !== statuses.FREE)
    {
        return;
    }

    const data = shift();
    if (!data)
    {
        return;
    }

    queue.emit('shift', data);
});

queue.push = push;
Object.defineProperty(queue, 'size', { get: getSize });

export {
    push as addToQueue,
    getSize as getQueueSize,
};
export default queue;
