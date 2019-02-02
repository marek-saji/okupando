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
       if (request.mode === 'navigate')
       {
           return createErrorResponse(request);
       }

       throw error;
   }
}

function handlePush (jsonData)
{
    const { title, ...options } = JSON.parse(jsonData);
    return self.registration.showNotification(title, options);
}


function createErrorResponse (request)
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


self.addEventListener('install', event => {
   event.waitUntil(handleInstall());
});
self.addEventListener('activate', event => {
    event.waitUntil(handleActivate());
});
self.addEventListener('fetch', event => {
    return event.respondWith(handleFetch(event.request))
});
