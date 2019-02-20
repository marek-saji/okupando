import {
    values as args,
    WEB_PUSH_CONFIGURED,
    HTTPS_CONFIGURED,
} from './/args-definitions';
import { printHelp as printArgsHelp } from './args';
import { getEnv } from './utils';

const ENV = getEnv();


function printUsage ()
{
    /* eslint-disable max-len */
    process.stdout.write('Options:\n');
    printArgsHelp();
    process.stdout.write('\n');
    process.stdout.write('To generate web push vapid keys run `npx web-push generate-vapid-keys`.\n');
    process.stdout.write('\n');
    process.stdout.write('You can set an option by:\n');
    process.stdout.write('1. Passing --option-name=VALUE argument\n');
    process.stdout.write('2. Running `npm config set okupando-option-name VALUE`\n');
    process.stdout.write('3. Setting OPTION_NAME=VALUE environment variable.\n');
    /* eslint-enable max-len */
}


// eslint-disable-next-line no-magic-numbers
if (['-h', '--help'].includes(process.argv[2]))
{
    printUsage();
    process.exit(0);
}

if (!args.GPIO_CHANNEL && ENV !== 'development')
{
    printUsage();
    console.error();
    console.error('Required gpio-channel option not specified.');
    process.exit(1);
}

if (!WEB_PUSH_CONFIGURED)
{
    console.log('Web Push not configured, continuing without it. Run with --help to see how to fix that.');

    if (!args.WEB_PUSH_PUBLIC_KEY)
    {
        console.log('Missing web-push-public-key option.');
    }
    if (!args.WEB_PUSH_PRIVATE_KEY)
    {
        console.log('Missing web-push-public-key option.');
    }
    if (!args.WEB_PUSH_PRIVATE_KEY)
    {
        console.log('Missing web-push-email option.');
    }
}

if (!HTTPS_CONFIGURED)
{
    console.log('HTTPS not properly configured, continuing without it. Run with --help to see how to fix that.');

    if (!args.HTTPS_PORT)
    {
        console.log('Missing httpd-port option.');
    }

    if (!args.ACME_EMAIL)
    {
        console.log('Missing acme-email option.');
    }
}
