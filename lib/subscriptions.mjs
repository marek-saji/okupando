/* eslint-disable no-sync,no-console */

import fs from 'fs';
import path from 'path';
import { PUSH_CONFIGURED } from './args-definitions';


const SUBSCRIPTIONS_DUMP_FILE = path.resolve('./subscriptions-dump.json');

const subscriptions = new Map();

if (PUSH_CONFIGURED)
{
    const subscriptionsArray = loadSubscriptions();
    for (const [key, value] of subscriptionsArray)
    {
        subscriptions.set(key, value);
    }
}

function addSubscription (id, subscription)
{
    subscriptions.set(id, subscription);
    storeSubscriptions();
}

function popAllSubscriptions ()
{
    const subs = Array.from(subscriptions.values());
    subscriptions.clear();
    storeSubscriptions();
    return subs;
}

function storeSubscriptions ()
{
    // eslint-disable-next-line no-sync
    fs.writeFileSync(
        SUBSCRIPTIONS_DUMP_FILE,
        JSON.stringify(Array.from(subscriptions.entries()))
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
    return subscriptions.size;
}

export {
    addSubscription,
    popAllSubscriptions,
    getSubscriptionQueueLength,
};
