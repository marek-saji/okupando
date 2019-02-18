import { getStatus } from '../../../status';
import statusLabels from '../../../../static/lib/statusLabels';

export default async res => {
    const status = await getStatus();
    res.set('Content-Type', 'text/plan');
    res.send([
        statusLabels[status],
        '',
    ].filter(line => line !== null).join('\n'));
};
