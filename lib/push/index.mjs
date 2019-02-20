import webPush from 'web-push';
import {
    values as args,
    WEB_PUSH_CONFIGURED,
} from '../args-definitions';
import freeNotification from '../../static/lib/freeNotification';
import { popAllSubscriptions } from '../subscriptions';

function notifyAboutFree ()
{
    if (!WEB_PUSH_CONFIGURED)
    {
        console.error('Called pushNotifications, but Web Push is not configured.');
        return;
    }

    const payload = JSON.stringify({
        ...freeNotification,
        timestamp: new Date(),
    });
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
    notifyAboutFree,
};
