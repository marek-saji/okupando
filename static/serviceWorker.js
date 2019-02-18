'use strict';

function handleInstall ()
{
    self.skipWaiting();
}

function handleActivate ()
{
    return self.clients.claim();
}

async function handleFetch (request)
{
    try
    {
        return await fetch(request);
    }
    catch (error)
    {
        if (request.destination === 'document')
        {
            return createDocumentErrorResponse(request);
        }

        if (request.headers.get('Content-Type') === 'application/json')
        {
            return createJsonErrorResponse(request);
        }

        throw error;
    }
}

function handlePush (jsonData)
{
    const { title, ...options } = JSON.parse(jsonData);
    return self.registration.showNotification(title, options);
}


function createDocumentErrorResponse ()
{
    let html;
    if (navigator.onLine === false)
    {
        html = 'You are offline, yo.';
    }
    else
    {
        html = 'Not available.';
    }

    return new Response(html, {
        status: 200,
        statusText: 'Service Unavailable',
        headers: new Headers({
            'Content-Type': 'text/html',
        }),
    });
}

function createJsonErrorResponse ()
{
    let json;
    if (navigator.onLine === false)
    {
        json = {
            status: 'offline',
        };
    }
    else
    {
        json = {
            status: 'error',
        };
    }

    return new Response(JSON.stringify(json), {
        status: 200,
        headers: new Headers({
            'Content-Type': 'application/json',
        }),
    });
}


self.addEventListener('install', event => {
    event.waitUntil(handleInstall());
});
self.addEventListener('activate', event => {
    event.waitUntil(handleActivate());
});
self.addEventListener('fetch', event => {
    return event.respondWith(handleFetch(event.request));
});
self.addEventListener('push', event => {
    event.waitUntil(handlePush(event.data.text()));
});
