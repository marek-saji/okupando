import path from 'path';
import { setupClientIdCookie } from '../client-id-cookie';

const PUBLIC_DIR = path.resolve('./static');
const HTML_FILES = {
    en: path.join(PUBLIC_DIR, 'google-assistant.en.html'),
    pl: path.join(PUBLIC_DIR, 'google-assistant.pl.html'),
};

export default app => app.get('/google-assistant', (req, res) => {
    const languages = Object.keys(HTML_FILES);
    const lang = req.acceptsLanguages(...languages) || languages[0];

    setupClientIdCookie(req, res);

    res.sendFile(HTML_FILES[lang]);
});
