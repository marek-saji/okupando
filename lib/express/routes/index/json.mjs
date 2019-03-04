import { getEnv } from '../../../utils';
import { getLastStatusChange } from '../../../status';
import { getStatus, getQueueSize } from '../../../queue';
import statusLabels from '../../../../static/lib/statusLabels';
import pkg from '../../../../package';

const ENV = getEnv();


export default async (req, res) => {
    const clientId = req.cookies.ClientId;
    const status = getStatus(clientId);
    res.json({
        status,
        label: statusLabels[status],
        lastChange: getLastStatusChange(),
        queueLength: getQueueSize(),
        version: pkg.version,
        environment: ENV === 'production' ? undefined : ENV,
    });
};
