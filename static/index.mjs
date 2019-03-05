/* eslint-disable no-console */
/* global ga */

import * as statuses from './lib/statuses.mjs';
import statusLabels from './lib/statusLabels.mjs';
import freeNotification from './lib/freeNotification.mjs';
import WEB_PUSH_PUBLIC_KEY from './web-push-public-key.mjs';
import { HTTP_STATUS_OK } from './lib/http-status-codes.mjs';

const SEC_MS = 1000; // miliseconds in a second

const INTERVAL = 3000;
const NOTIFICATICATION_PERMISSION_TIMEOUT = 10000;

const TITLE = document.title;

const WEB_PUSH_SUPPORTED =
    typeof navigator.serviceWorker === 'object'
    && typeof window.PushManager === 'function'
    && typeof window.PushManager.prototype.subscribe === 'function';
const PUSH_SUPPORTED = WEB_PUSH_SUPPORTED;

const statusBgMetas = document.querySelectorAll('meta[data-status-bg]');
const main = document.getElementsByTagName('main')[0];
const output = document.getElementsByTagName('output')[0];
const subscribe = document.getElementById('subscribe');

const checkAbortController = AbortController && new AbortController();

let version;
let subscribed = false;
let showNotificationsHere = !PUSH_SUPPORTED;


// Decide whether browser has enough cool features to enhance
// with JavaScript. Without it we are left off with simple
// HTML page that refreshes every few seconds, which is also fine
function isShinyEnough ()
{
    const body = document.body;
    return (
        typeof body.addEventListener === 'function'
        && typeof body.hidden === 'boolean'
        && typeof encodeURIComponent === 'function'
        && typeof fetch === 'function'
        && typeof window.AbortController === 'function'
        && typeof window.getComputedStyle === 'function'
        && typeof Uint8Array === 'function'
        && typeof window.atob
        && typeof window.localStorage === 'object'
        && typeof window.localStorage.getItem === 'function'
        && typeof window.localStorage.setItem === 'function'
    );
}

function start ()
{
    setup();
    registerServiceWorker();
    monitor();
}

function setup ()
{
    if (document.querySelector('meta[http-equiv="refresh"]'))
    {
        document.cookie = [
            'JS=1',
            'path=/',
        ].join(';');
        window.location.reload(true);
        return;
    }

    subscribed = subscribe.disabled;

    const status = main.getAttribute('data-status');
    reflectStatus(status);
    subscribe.addEventListener('click', handleSubscribe);
}

function isOnLocalhost ()
{
    return /^(localhost|127\.0\.0\.1|::1|)$/
        .test(location.hostname.toLowerCase());
}

function registerServiceWorker ()
{
    if (
        'serviceWorker' in navigator
        && (
            location.protocol === 'https:'
            || isOnLocalhost
        )
    )
    {
        navigator.serviceWorker.register('/serviceWorker.js');
        window.addEventListener('beforeinstallprompt', async (event) => {
            const result = await event.userChoice;
            trackEvent('ServiceWorker', 'installation', result.outcome);
        });

        navigator.serviceWorker.addEventListener('message', handleSwMessage);
    }
}

function handleSwMessage ({ data })
{
    const { status } = data;

    if (status)
    {
        checkAbortController.abort();
        reflectStatus(status);
    }
}

function reloadOnVersionChange (newVersion)
{
    if (!newVersion)
    {
        return;
    }

    if (version && newVersion !== version)
    {
        console.log('New version detected — reloading');
        window.location.reload();
    }

    version = newVersion;
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
        const response = await fetch(url, {
            headers: { 'Content-Type': 'application/json' },
            signal: checkAbortController.signal,
        });
        const data = await response.json();
        reloadOnVersionChange(data.version);
        return data.status;
    }
    catch (error)
    {
        if (error.name === 'AbortError')
        {
            // Fetch aborted using checkAbortController, ignore
            return null;
        }

        console.error('Checking status failed:', error);
        return statuses.ERROR;
    }
}

async function monitor ()
{
    const prevStatus = main.getAttribute('data-status');
    const status = await checkStatus(prevStatus);

    if (status !== null)
    {
        reflectStatus(status);

        if (
            status === statuses.FREE
            && subscribed
            && showNotificationsHere
        )
        {
            notify();

            const delta = (new Date() - subscribed) / SEC_MS;
            trackEvent('Notification', 'shown', 'after seconds', delta);
            subscribed = false;
        }
    }

    setTimeout(monitor, INTERVAL);
}

function reflectStatus (status)
{
    const name = statusLabels[status];

    main.setAttribute('data-status', status);
    output.textContent = name;
    document.title = `${name} ✦ ${TITLE}`;

    subscribe.hidden = status !== statuses.OCCUPIED;
    subscribe.disabled = !!subscribed;

    const statusBgColour = window.getComputedStyle(main).backgroundColor;
    for (const meta of statusBgMetas)
    {
        meta.content = statusBgColour;
    }
}

function getClientId ()
{
    const clientId = getCookies().get('ClientId');
    if (!clientId)
    {
        throw Error('Failed to get client id. It should be set in the cookie.');
    }
    return clientId;
}

function getCookies ()
{
    return new Map(
        document.cookie
            .split(';')
            .map(
                c => c
                    .trim()
                    .split('=')
                    .map(decodeURIComponent)
            )
    );
}

async function handleSubscribe (event)
{
    event.preventDefault();

    try
    {
        await askForNotificationPermission();
        showNotificationsHere = false;
    }
    catch (error)
    {
        console.error(
            'Failed to get notifications permission, falling back to page notifications. Error:',
            error
        );
        showNotificationsHere = true;
    }

    if (!showNotificationsHere && WEB_PUSH_SUPPORTED)
    {
        const subscription = await subscribeWebPush();
        try
        {
            await registerSubscription(subscription);
            showNotificationsHere = false;
        }
        catch (error)
        {
            console.error(
                'Failed to register web push subscription, falling back to page notifications. Error:',
                error
            );
        }
    }

    if (showNotificationsHere)
    {
        alert('Jeśli wyjdziesz stąd, nie dostaniesz powiadomienia.');
    }

    subscribe.disabled = true;

    subscribed = new Date();
    // TODO Send info to server

    trackEvent('Subscription', 'subscription');
}

// TODO If web-push-public-key.mjs would export Uint8Array(),
//      we could remove this method from client code
function urlB64ToUint8Array (base64String)
{
    // eslint-disable-next-line
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
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
    if (
        typeof Notification !== 'function'
        || typeof Notification.permission !== 'string'
        || typeof Notification.requestPermission !== 'function'
    )
    {
        return;
    }

    let permission = Notification.permission;

    if (permission === 'default')
    {
        permission = await new Promise(resolve => {
            Notification.requestPermission().then(r => resolve(r));
            setTimeout(
                () => {
                    console.error('Timed out while waiting for notification permission.');
                    resolve('denied');
                },
                NOTIFICATICATION_PERMISSION_TIMEOUT
            );
        });

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

    throw new Error(`Unknown notification permission value: ${permission}`);
}

async function getWebPushSubscription ()
{
    const swRegistration = await navigator.serviceWorker.ready;
    const subscription = await swRegistration.pushManager.getSubscription();
    return subscription;
}

async function createWebPushSubscription ()
{
    const swRegistration = await navigator.serviceWorker.ready;
    const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(WEB_PUSH_PUBLIC_KEY),
    });
    return subscription;
}

async function subscribeWebPush ()
{
    let subscription = await getWebPushSubscription();
    if (!subscription)
    {
        subscription = await createWebPushSubscription();
    }
    return subscription;
}

async function registerSubscription (subscription)
{
    const clientId = getClientId();
    const response = await fetch('/queue', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            clientId,
            data: {
                subscription,
            },
        }),
    });

    if (response.status !== HTTP_STATUS_OK)
    {
        throw new Error(`Unexpected status on PUT /subscribe: ${response.status}`);
    }
}

async function notify ()
{
    const { title, ...options } = freeNotification;
    let fallbackToAlert;

    try
    {
        const swRegistration = await navigator.serviceWorker.ready;

        if (Notification.permission !== 'granted')
        {
            throw new Error('Notification permission not granted.');
        }

        swRegistration.showNotification(title, options);
        fallbackToAlert = false;
    }
    catch (error)
    {
        fallbackToAlert = true;
    }

    if (fallbackToAlert)
    {
        alert(title);
    }
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


if (isShinyEnough())
{
    start();
}
