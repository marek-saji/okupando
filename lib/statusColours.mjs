import * as statuses from '../static/lib/statuses.mjs';

export default {
    [statuses.CHECKING]: {
        bg: 'silver',
        fg: 'black',
    },
    [statuses.OCCUPIED]: {
        bg: 'hsl(359, 72%, 89%)',
        fg: 'hsl(355, 82%, 21%)',
    },
    [statuses.FREE]: {
        bg: 'hsl(79, 70%, 74%)',
        fg: 'hsl(148, 100%, 29%)',
    },
    [statuses.ERROR]: {
        bg: 'black',
        fg: 'orangered',
    },
    [statuses.OFFLINE]: {
        bg: 'silver',
        fg: 'black',
    },
};
