import webPush from 'web-push';
import {
    values as args,
    WEB_PUSH_CONFIGURED,
} from '../args-definitions';
import * as statuses from '../../static/lib/statuses';
import freeNotification from '../../static/lib/freeNotification';

function notifyAboutFree (subscription)
{
    if (!WEB_PUSH_CONFIGURED)
    {
        console.error('Called pushNotifications, but Web Push is not configured.');
        return;
    }

    const payload = JSON.stringify({
        status: statuses.FREE,
        notification: {
            ...freeNotification,
            timestamp: new Date(),
        },
    });
    const options = {
        TTL: 60,
        vapidDetails: {
            subject: `mailto:${args.WEB_PUSH_EMAIL}`,
            publicKey: args.WEB_PUSH_PUBLIC_KEY,
            privateKey: args.WEB_PUSH_PRIVATE_KEY,
        },
    };

    console.log(
        'PUSH',
        'Sending notification'
    );
    webPush.sendNotification(
        subscription,
        payload,
        options
    );
}

export {
    notifyAboutFree,
};
