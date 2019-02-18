import { register, getAllValues } from './args';

register(
    'host',
    'Host to run HTTP daemon on',
    '0.0.0.0'
);

register(
    'port',
    'Port to run HTTP daemon on',
    // eslint-disable-next-line no-magic-numbers
    3000
);

register(
    'status-file',
    'Path to file with occupation status (1 = free, 0 = occupied)'
);

register(
    'web-push-email',
    'E-mail address for Web Push'
);
register(
    'web-push-public-key',
    'Web Push VAPID public key'
);
register(
    'web-push-private-key',
    'Web Push VAPID private key'
);


export const values = getAllValues();
export const WEB_PUSH_CONFIGURED =
    values.WEB_PUSH_EMAIL
    && values.WEB_PUSH_PUBLIC_KEY
    && values.WEB_PUSH_PRIVATE_KEY;
