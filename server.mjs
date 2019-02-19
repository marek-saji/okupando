import greenlock from 'greenlock-express';
import './lib/cli-env';
import { values as args } from './lib/args-definitions';
import app from './lib/express';
import { monitorStatus } from './lib/push';


monitorStatus();

if (args.HTTPS_PORT)
{
    greenlock.create({
        server: 'https://acme-v02.api.letsencrypt.org/directory',
        version: 'draft-11',
        email: args.ACME_EMAIL,
        configDir: '~/.config/acme',
        agreeTos: true,
        communityMember: false,
        telemetry: true,
        servername: args.HOST,
        approveDomains: [args.HOST],
        app,
    }).listen(
        args.HTTP_PORT,
        args.HTTPS_PORT,
        () => {
            console.log(
                'HTTP',
                'Listening on',
                `http://${args.HOST}:${args.HTTP_PORT}`,
            );
        },
        () => {
            console.log(
                'HTTP',
                'Listening on',
                `https://${args.HOST}:${args.HTTPS_PORT}`
            );
        },
    );
}
else
{
    app.listen(args.HTTP_PORT, args.HOST, () => {
        console.log(
            'HTTP',
            'Listening on',
            `http://${args.HOST}:${args.HTTP_PORT}`
        );
    });
}
