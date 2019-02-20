import {
    HTTP_STATUS_NOT_ACCEPTABLE,
} from '../../../static/lib/http-status-codes';
import text from './index/text';
import json from './index/json';
import html from './index/html';


export default app => {
    app.get('/index.html', (req, res) => res.redirect('/'));

    app.get('/', async (req, res) => {
        const handlers = {
            text,
            html,
            json,
        };
        const type =
            /lynx/i.test((req.headers || {})['user-agent'] || '')
                ? 'text' : req.accepts(Object.keys(handlers));

        if (type === false)
        {
            return res.sendStatus(HTTP_STATUS_NOT_ACCEPTABLE);
        }

        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');

        return handlers[type](req, res);
    });
};
