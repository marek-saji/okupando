import {
    HTTP_STATUS_NOT_ACCEPTABLE,
} from '../../../static/lib/http-status-codes';
import text from './index/text';
import json from './index/json';
import html from './index/html';

const lynxUserAgentRegExp = /lynx/i;
const fbUserAgentRegExp = /facebook/i;


export default app => {
    app.get('/index.html', (req, res) => res.redirect('/'));

    app.get('/', async (req, res) => {
        const handlers = {
            text,
            html,
            json,
        };
        const userAgent = (req.headers || {})['user-agent'] || '';
        let type;
        if (lynxUserAgentRegExp.test(userAgent))
        {
            type = 'text';
        }
        else if (fbUserAgentRegExp.test(userAgent))
        {
            type = 'html';
        }
        else
        {
            type = req.accepts(Object.keys(handlers));
        }

        if (type === false)
        {
            return res.sendStatus(HTTP_STATUS_NOT_ACCEPTABLE);
        }

        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.set('Vary', 'Accept');

        return handlers[type](req, res);
    });
};
