import * as statuses from '../static/lib/statuses.mjs';

export default {
    [statuses.CHECKING]: {
        bg: 'silver',
        fg: 'black',
    },
    [statuses.OCCUPIED]: {
        bg: 'orangered',
        fg: 'black',
    },
    [statuses.FREE]: {
        bg: 'green',
        fg: 'white',
    },
    [statuses.ERROR]: {
        bg: 'black',
        fg: 'white',
    },
    [statuses.OFFLINE]: {
        bg: 'black',
        fg: 'white',
    },
};
