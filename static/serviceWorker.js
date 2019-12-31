/* eslint-env serviceworker */

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
        return await fetch(
            isRequestHtml(request) ? injectJsHeader(request) : request
        );
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

async function handlePush (jsonData)
{
    const {
        status,
        notification: { title, ...options },
    } = JSON.parse(jsonData);
    self.registration.showNotification(title, options);

    await self.clients.claim();
    (await self.clients.matchAll({ type: 'window' })).forEach(client => {
        client.postMessage({
            status,
        });
    });
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

function isRequestHtml (request)
{
    return (
        request.url === '/'
        // eslint-disable-next-line no-magic-numbers
        || request.url.indexOf('.html') !== -1
    );
}

function injectJsHeader (request)
{
    // New request with additional header
    return new Request(
        request.url,
        {
            method: request.method,
            headers: {
                ...Array.from(request.headers.entries())
                    .reduce(
                        (h, [name, value]) => ({ ...h, [name]: value }),
                        {}
                    ),
                'X-JS': '1',
            },
            // request.mode may be 'navigation' which we cannot use
            mode: 'same-origin',
            credentials: request.credentials,
            // Let browser handle redirects
            redirect: 'manual',
        }
    );
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
