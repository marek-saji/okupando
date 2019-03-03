import greenlock from 'greenlock-express';
import { values as args } from '../args-definitions';

export default app => greenlock.create({
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
});
