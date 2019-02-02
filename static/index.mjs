import * as statuses from './lib/statuses.mjs';
import statusLabels from './lib/statusLabels.mjs';
import freeNotification from './lib/freeNotification.mjs';
import WEB_PUSH_PUBLIC_KEY from './web-push-public-key.mjs';

const INTERVAL = 3000;

const WEB_PUSH_SUPPORTED = (
    typeof window.PushManager === 'function'
    && typeof window.PushManager.prototype.subscribe === 'function'
);
const PUSH_SUPPORTED = WEB_PUSH_SUPPORTED;

const html = document.documentElement;
const themeColor = document.querySelector('meta[name="theme-color"]');
const main = document.getElementsByTagName('main')[0];
const output = document.getElementsByTagName('output')[0];
const subscribe = document.getElementById('subscribe');

let subscribed = false;
let showNotificationsHere = ! WEB_PUSH_SUPPORTED;



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

    if (subscribed && showNotificationsHere)
    {
        notify();

        const delta = (Date.now() - subscribed) / 1000;
        trackEvent('Notification', 'shown', 'after seconds', delta);
    }
    subscribed = false;

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

    showNotificationsHere = true;
    if (WEB_PUSH_SUPPORTED)
    {
        const subscription = await subscribeWebPush();
        try
        {
            await registerSubscribtion(subscription);
            showNotificationsHere = false;
        }
        catch (error)
        {
            console.error('Failed to register web push subscription, falling back to page notifications. Error:', error);
        }
    }

    if (showNotificationsHere)
    {
        alert('Jeśli wyjdziesz stąd, nie dostaniesz powiadomienia.');
    }

    subscribe.disabled = true;

    subscribed = Date.now();
    // TODO Send info to server

    trackEvent('Subscription', 'subscription');
}

// TODO If web-push-public-key.mjs would export Uint8Array(),
//      we could remove this method from client code
function urlB64ToUint8Array (base64String)
{
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
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

async function subscribeWebPush ()
{
    // TODO May be already subscribed
    const swRegistration = await navigator.serviceWorker.ready;
    const subscription = swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(WEB_PUSH_PUBLIC_KEY),
    })
    return subscription;
}

async function registerSubscribtion (subscription)
{
    const response = await fetch('/subscribe', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
    });

    if (response.status !== 200)
    {
        throw new Error(`Unexpected status on PUT /subscribe: ${response.status}`);
    }
}

async function notify ()
{
    const swRegistration = await navigator.serviceWorker.ready;

    const { title, ...options } = freeNotification;
    swRegistration.showNotification(title, options);
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
