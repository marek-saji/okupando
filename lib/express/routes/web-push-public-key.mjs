import { values as args } from '../../args-definitions';

// TODO Is it possible to run this function on the server?
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

export default app => app.get('/web-push-public-key.mjs', (req, res) => {
    res.set('Content-Type', 'application/javascript; charset=UTF-8');
    res.send(`
        ${urlB64ToUint8Array.toString()}
        export default urlB64ToUint8Array(${JSON.stringify(args.WEB_PUSH_PUBLIC_KEY)});
    `);
});
