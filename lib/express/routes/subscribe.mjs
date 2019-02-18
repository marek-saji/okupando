import { WEB_PUSH_CONFIGURED } from '../../args-definitions';
import {
    addSubscription,
    getSubscriptionQueueLength,
} from '../../subscriptions';
import {
    HTTP_STATUS_OK,
    HTTP_STATUS_BAD_REQUEST,
} from '../../../static/lib/http-status-codes';


export default app => app.put('/subscribe', (req, res) => {
    if (!WEB_PUSH_CONFIGURED)
    {
        console.error('Requested PUT /subscribe, but Web Push is not configured.');
        res.sendStatus(HTTP_STATUS_BAD_REQUEST);
        return;
    }

    const subscription = req.body;
    if (!subscription.endpoint || !subscription.keys)
    {
        console.error('Invalid subscription passed:', subscription);
        res.sendStatus(HTTP_STATUS_BAD_REQUEST);
        return;
    }

    console.log('SUBSCRIPTION', 'New subscription');
    addSubscription(subscription);
    console.log(
        'SUBSCRIPTION',
        'New queue length:',
        getSubscriptionQueueLength()
    );

    res.sendStatus(HTTP_STATUS_OK);
});
