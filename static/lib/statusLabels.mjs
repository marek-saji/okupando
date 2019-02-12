import * as statuses from './statuses.mjs';

export default {
    [statuses.CHECKING]: 'Sprawdzam…',
    [statuses.OCCUPIED]: 'Zajęte 😨',
    [statuses.FREE]: 'Wolne 💩',
    [statuses.ERROR]: 'Błąd 🤷',
    [statuses.OFFLINE]: 'Offline 🚫',
};
