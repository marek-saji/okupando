import { WEB_PUSH_CONFIGURED } from '../../args-definitions';
import {
    HTTP_STATUS_OK,
    HTTP_STATUS_BAD_REQUEST,
} from '../../../static/lib/http-status-codes';
import queue from '../../queue';


export default app => app.put('/queue', (req, res) => {
    if (!WEB_PUSH_CONFIGURED)
    {
        console.error('Requested PUT /queue, but Web Push is not configured.');
        res.sendStatus(HTTP_STATUS_BAD_REQUEST);
        return;
    }

    const { clientId, data: { subscription } } = req.body;
    if (!subscription.endpoint || !subscription.keys)
    {
        console.error('Invalid subscription passed:', subscription);
        res.sendStatus(HTTP_STATUS_BAD_REQUEST);
        return;
    }
    if (!clientId)
    {
        console.error('No client id passed');
        res.sendStatus(HTTP_STATUS_BAD_REQUEST);
        return;
    }

    console.log('SUBSCRIPTION', 'New subscription from client', clientId);
    queue.push(clientId, { subscription });
    console.log(
        'SUBSCRIPTION',
        'New queue length:',
        queue.size
    );

    res.sendStatus(HTTP_STATUS_OK);
});
