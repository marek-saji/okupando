import gpio from 'gpio';
import EventEmitter from 'events';
import child_process from 'child_process';
import util from 'util';
import * as statuses from '../../../static/lib/statuses';

const exec = util.promisify(child_process.exec);

const DIRECTION_IN = gpio.DIRECTION.IN;
const PULL_UP = 'pu';
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

async function exportButton (channel, options) {
    const { pull, ...otherOptions } = options;

    if (pull)
    {
        const dir = otherOptions.direction === DIRECTION_IN ? 'ip' : 'op';
        const { stdout, stderr } = await exec(`raspi-gpio set ${channel} ${dir} ${pull}`);
        if (stdout)
        {
            console.log(stdout);
        }
        if (stderr)
        {
            console.log(stderr);
        }
    }

    return new Promise((resolve, reject) => {
        const button = gpio.export(channel, {
            ...otherOptions,
            ready: error => {
                if (error)
                {
                    reject(error);
                }
                else
                {
                    resolve(button);
                }
            },
        });
    });
}


async function createStatusObserver ({ channel })
{
    const button = await exportButton(channel, {
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
