import { getStatus } from '../../../status';
import { getQueueSize } from '../../../queue';
import statusLabels from '../../../../static/lib/statusLabels';

export default async (req, res) => {
    const status = await getStatus();
    const queueLength = getQueueSize();
    res.set('Content-Type', 'text/plan');
    res.send([
        statusLabels[status],
        queueLength ? `Queue length: ${queueLength}` : null,
        '',
    ].filter(line => line !== null).join('\n'));
};
