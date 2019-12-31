import EventEmitter from 'events';
import * as statuses from '../../../static/lib/statuses';
import { exportPin, DIRECTION_IN, PULL_UP } from '../../gpio-utils';

const CHANGE_INTERVAL = 200;

const eventEmitter = new EventEmitter();


function valueToStatus (value)
{
    if (value === 1)
    {
        return statuses.FREE;
    }

    if (value === 0)
    {
        return statuses.OCCUPIED;
    }

    throw new Error(`Unexpected status value: ${value}`);
}

async function createStatusObserver ({ channel })
{
    const button = await exportPin(channel, {
        direction: DIRECTION_IN,
        pull: PULL_UP,
        interval: CHANGE_INTERVAL,
    });

    let oldStatus = valueToStatus(button.value);

    button.on('change', newValue => {
        const newStatus = valueToStatus(newValue);

        if (newStatus === oldStatus)
        {
            return;
        }

        eventEmitter.emit('change', {
            previousStatus: oldStatus,
            status: newStatus,
        });

        oldStatus = newStatus;
    });

    return {
        on: (event, handler) => {
            eventEmitter.on(event, handler);
            handler({ status: oldStatus });
        },
    };
}

export {
    createStatusObserver,
};
