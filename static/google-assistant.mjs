import WEB_PUSH_PUBLIC_KEY from '/web-push-public-key.mjs';
const JSON_INDENT = 2;

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

async function copyQueueData (event)
{
    const [swRegistration] = await navigator.serviceWorker.getRegistrations();
    if (!swRegistration)
    {
        alert(document.body.getAttribute('data-msg-no-service-worker'));
        return;
    }
    let subscription = await swRegistration.pushManager.getSubscription();
    if (!subscription)
    {
        subscription = await swRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: WEB_PUSH_PUBLIC_KEY,
        });
    }
    const queueData = {
        clientId: getClientId(),
        data: { subscription },
    };
    navigator.clipboard.writeText(JSON.stringify(queueData, null, JSON_INDENT));
    event.target.textContent = event.target.getAttribute('data-msg-copied');
}

document.getElementById('origin').textContent = window.location.origin;
document.getElementById('queueDataCopier').addEventListener('click', copyQueueData);
