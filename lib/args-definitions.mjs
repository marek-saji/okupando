import { looksLikeIp } from './utils';
import { register, getAllValues } from './args';

register(
    'gpio-channel',
    'Reference to Raspberry Pi pin in RPI (not BCM) mode.'
);

register(
    'host',
    'Host to run HTTP daemon on',
    '0.0.0.0'
);

register(
    'http-port',
    'Port to run HTTP daemon on',
    // eslint-disable-next-line no-magic-numbers
    3000
);

register(
    'https-port',
    'Port to run HTTPS daemon on. When specified, you may not specify IP as a host.'
);

register(
    'acme-email',
    'E-mail address to use for Let’s Encrypt'
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
export const PUSH_CONFIGURED =
    WEB_PUSH_CONFIGURED;
export const HTTPS_CONFIGURED =
    values.HTTPS_PORT
    && values.ACME_EMAIL
    && values.HOST !== 'localhost'
    && !looksLikeIp(values.HOST);
