import { getStatus, getQueueSize } from '../../../queue';
import statusLabels from '../../../../static/lib/statusLabels';
import statusEmojis from '../../../../static/lib/statusEmojis';

export default async (clientId, req, res) => {
    const status = getStatus(clientId);
    const queueLength = getQueueSize();
    res.set('Content-Type', 'text/plan');
    res.send([
        `${statusLabels[status]} ${statusEmojis[status]}`,
        queueLength ? `Queue length: ${queueLength}` : null,
        '',
    ].filter(line => line !== null).join('\n'));
};
