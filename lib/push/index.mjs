import webPush from 'web-push';
import { checkStatus } from '../status';
import {
    values as args,
    WEB_PUSH_CONFIGURED,
} from '../args-definitions';
import * as statuses from '../../static/lib/statuses';
import freeNotification from '../../static/lib/freeNotification';
import { popAllSubscriptions } from '../subscriptions';

const CHECK_INTERVAL = 5000;

async function monitorStatus () {
    const status = await checkStatus();
    if (
        WEB_PUSH_CONFIGURED
        && status === statuses.FREE
    )
    {
        pushNotifications();
    }

    setTimeout(monitorStatus, CHECK_INTERVAL);
}

function pushNotifications ()
{
    if (!WEB_PUSH_CONFIGURED)
    {
        console.error('Called pushNotifications, but Web Push is not configured.');
        return;
    }

    const payload = {
        ...JSON.stringify(freeNotification),
        timestamp: new Date(),
    };
    const options = {
        TTL: 60,
        vapidDetails: {
            subject: `mailto:${args.WEB_PUSH_EMAIL}`,
            publicKey: args.WEB_PUSH_PUBLIC_KEY,
            privateKey: args.WEB_PUSH_PRIVATE_KEY,
        },
    };

    const subscriptions = popAllSubscriptions();
    if (subscriptions.length)
    {
        console.log(
            'PUSH',
            'Sending',
            subscriptions.length,
            'notifications'
        );
        for (const subscription of subscriptions)
        {
            webPush.sendNotification(
                subscription,
                payload,
                options
            );
        }
    }
}

export {
    monitorStatus,
};
