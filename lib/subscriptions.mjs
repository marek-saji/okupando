/* eslint-disable no-sync,no-console */

import fs from 'fs';
import path from 'path';
import { PUSH_CONFIGURED } from './args-definitions';


const SUBSCRIPTIONS_DUMP_FILE = path.resolve('./subscriptions-dump.json');

const subscriptions = [];

if (PUSH_CONFIGURED)
{
    subscriptions.unshift(...loadSubscriptions());
}

function addSubscription (subscription)
{
    subscriptions.push(subscription);
    storeSubscriptions();
}

function popAllSubscriptions ()
{
    const subs = [...subscriptions];
    subscriptions.length = 0;
    storeSubscriptions();
    return subs;
}

function storeSubscriptions ()
{
    // eslint-disable-next-line no-sync
    fs.writeFileSync(
        SUBSCRIPTIONS_DUMP_FILE,
        JSON.stringify(subscriptions)
    );
}

function loadSubscriptions ()
{
    // eslint-disable-next-line no-sync
    if (!fs.existsSync(SUBSCRIPTIONS_DUMP_FILE))
    {
        return [];
    }

    // eslint-disable-next-line no-sync
    const subscriptionsJson = fs.readFileSync(SUBSCRIPTIONS_DUMP_FILE);
    try
    {
        const subs = JSON.parse(subscriptionsJson);
        console.log(
            'SUBSCRIPTION',
            'Loaded',
            subs.length,
            'subscriptions from a dump file.'
        );
        return subs;
    }
    catch (error)
    {
        console.error(
            'SUBSCRIPTION',
            'Failed to unserialize subscriptions cache file, ignoring.'
        );
    }

    return [];
}

function getSubscriptionQueueLength ()
{
    return subscriptions.length;
}

export {
    addSubscription,
    popAllSubscriptions,
    getSubscriptionQueueLength,
};
