import { values as args } from '../../args-definitions';

export default app => app.get('/web-push-public-key.mjs', (req, res) => {
    res.set('Content-Type', 'application/javascript; charset=UTF-8');
    res.send(`export default ${JSON.stringify(args.WEB_PUSH_PUBLIC_KEY)};`);
});
