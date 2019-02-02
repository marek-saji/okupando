import * as statuses from './lib/statuses.mjs';
import statusLabels from './lib/statusLabels.mjs';

const INTERVAL = 3000;

const html = document.documentElement;
const themeColor = document.querySelector('meta[name="theme-color"]');
const main = document.getElementsByTagName('main')[0];
const output = document.getElementsByTagName('output')[0];
const subscribe = document.getElementById('subscribe');

let subscribed = false;



function start ()
{
    setup();
    registerServiceWorker();
    monitor();
}

function setup ()
{
    main.hidden = false;
    subscribe.addEventListener('click', handleSubscribe);
}

function registerServiceWorker ()
{
    if ('serviceWorker' in navigator)
    {
        navigator.serviceWorker.register('/serviceWorker.js');
        window.addEventListener('beforeinstallprompt', async (event) => {
            const result = await event.userChoice;
            trackEvent('ServiceWorker', 'installation', result.outcome);
        });
    }
}

async function checkStatus (prevStatus)
{
    try
    {
        let url = '/check';
        if (prevStatus)
        {
            url += `?status=${encodeURIComponent(prevStatus)}`;
        }
        const response = await fetch(url);
        return await response.json();
    }
    catch (error)
    {
        console.error('Checking status failed:', error);
        return statuses.ERROR;
    }
}

async function monitor ()
{
    const prevStatus = main.getAttribute('data-status');
    const status = await checkStatus(prevStatus);
    reflectStatus(status);

    if (subscribed)
    {
        notify(); // TODO Do this in SW

        const delta = (Date.now() - subscribed) / 1000;
        trackEvent('Notification', 'shown', 'after seconds', delta);
        subscribed = false;
    }

    setTimeout(monitor, INTERVAL);
}

function reflectStatus (status)
{
    main.setAttribute('data-status', status);
    output.textContent = statusLabels[status];

    // TODO Queue length when occupied

    subscribe.hidden = status !== statuses.OCCUPIED;
    subscribe.disabled = !! subscribed;

    themeColor.content = window.getComputedStyle(main).backgroundColor;
}

async function handleSubscribe (event)
{
    event.preventDefault();

    await askForNotificationPermission();

    subscribe.disabled = true;

    subscribed = Date.now();
    // TODO Send info to server

    trackEvent('Subscription', 'subscription');
}

async function askForNotificationPermission ()
{
    let permission = Notification.permission;

    if (permission === 'default')
    {
        permission = await Notification.requestPermission();

        trackEvent('Notification', 'request', permission);
    }

    if (permission === 'granted')
    {
        return;
    }

    if (permission === 'denied')
    {
        throw new Error('Notification permission denied.');
    }

    throw new Error(`Unknown notification petmission value: ${permission}`);
}

async function notify ()
{
    const swRegistration = await navigator.serviceWorker.ready;

    swRegistration.showNotification('Zwolniło się!', {
        body: '💩',
        icon: '/icon-512.png',
        tag: 'free',
    });
}

function trackEvent (
    category,
    action,
    label = undefined,
    value = undefined
)
{
    if (typeof ga !== 'function')
    {
        return;
    }

    const event = {
        eventCategory: category,
        eventAction: action,
    };
    if (label !== undefined)
    {
        event.eventLabel = label;
    }
    if (value !== undefined)
    {
        event.eventValue = parseInt(value, 10);
    }

    ga('send', { hitType: 'event', ...event });
}

start();
