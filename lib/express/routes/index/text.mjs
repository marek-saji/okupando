import { getStatus } from '../../../status';
import { getSubscriptionQueueLength } from '../../../subscriptions';
import statusLabels from '../../../../static/lib/statusLabels';

export default async res => {
    const status = await getStatus();
    const queueLength = getSubscriptionQueueLength();
    res.set('Content-Type', 'text/plan');
    res.send([
        statusLabels[status],
        queueLength ? `Queue length: ${queueLength}` : null,
        '',
    ].filter(line => line !== null).join('\n'));
};
