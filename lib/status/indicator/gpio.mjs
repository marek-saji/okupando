import { exportPin, DIRECTION_OUT, PULL_UP } from '../../gpio-utils';
import * as statuses from '../../../static/lib/statuses';

async function createStatusIndicator ({ channel })
{
    const light = await exportPin(channel, {
        direction: DIRECTION_OUT,
        pull: PULL_UP,
    });

    return {
        set (status) {
            if (status === statuses.OCCUPIED) {
                light.set();
            } else {
                light.reset();
            }
        },
    };
}

export {
    createStatusIndicator,
};
