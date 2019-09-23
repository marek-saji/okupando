import * as statuses from './statuses.mjs';

export default {
    [statuses.CHECKING]: '🕜',
    [statuses.OCCUPIED]: '😨',
    [statuses.FREE]: '💩',
    [statuses.ERROR]: '🤷',
    [statuses.OFFLINE]: '🚫',
};
