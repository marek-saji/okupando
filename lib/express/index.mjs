import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import addQueueRoute from './routes/queue';
import addCheckRoute from './routes/check';
import addManifestRoute from './routes/manifest';
import addWebPushPublicKeyRoute from './routes/web-push-public-key';
import addGoogleAssistantRoute from './routes/google-assistant';
import addIndexRoute from './routes/index';

const app = express();
const PUBLIC_DIR = path.resolve('./static');
const JSON_SPACES = 2;

app.use(express.json());
app.use(cookieParser());
app.use((req, _, next) => {
    console.log(
        req.method,
        req.originalUrl,
        'from client',
        req.headers['x-clientid'] || req.cookies.ClientId
    );
    next();
});

app.set('json spaces', JSON_SPACES);

addQueueRoute(app);
addCheckRoute(app);
addManifestRoute(app);
addWebPushPublicKeyRoute(app);
addGoogleAssistantRoute(app);
addIndexRoute(app);

app.get('/*', (req, res) => {
    const file = req.params[0].trim('/');
    res.sendFile(
        file,
        { root: PUBLIC_DIR }
    );
});


export default app;
