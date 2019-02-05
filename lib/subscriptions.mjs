/* eslint-disable no-sync,no-console */

import fs from 'fs';
import path from 'path';


const SUBSCRIPTIONS_DUMP_FILE = path.resolve('../subscriptions-dump.json');

const subscriptions = loadSubscriptions();


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
        return JSON.parse(subscriptionsJson);
    }
    catch (error)
    {
        console.error('Failed to unserialize subscriptions cache file, ignoring.');
    }

    return [];
}

export {
    addSubscription,
    popAllSubscriptions,
};
