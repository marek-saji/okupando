import gpio from 'gpio';
import child_process from 'child_process';
import util from 'util';

const exec = util.promisify(child_process.exec);

const DIRECTION_IN = gpio.DIRECTION.IN;
const DIRECTION_OUT = gpio.DIRECTION.OUT;
const PULL_UP = 'pu';

async function exportPin (channel, options) {
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
        const pin = gpio.export(channel, {
            ...otherOptions,
            ready: error => {
                if (error)
                {
                    reject(error);
                }
                else
                {
                    resolve(pin);
                }
            },
        });
    });
}


export {
    exportPin,
    DIRECTION_IN,
    DIRECTION_OUT,
    PULL_UP,
};
