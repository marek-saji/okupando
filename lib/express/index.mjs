import path from 'path';
import express from 'express';
import addSubscribeRoute from './routes/subscribe';
import addCheckRoute from './routes/check';
import addManifestRoute from './routes/manifest';
import addWebPushPublicKeyRoute from './routes/web-push-public-key';
import addIndexRoute from './routes/index';

const app = express();
const PUBLIC_DIR = path.resolve('./static');

app.use(express.json());
app.use((req, _, next) => {
    console.log(
        req.method,
        req.originalUrl
    );
    next();
});

addSubscribeRoute(app);
addCheckRoute(app);
addManifestRoute(app);
addWebPushPublicKeyRoute(app);
addIndexRoute(app);

app.get('/*', (req, res) => {
    const file = req.params[0].trim('/');
    res.sendFile(
        file,
        { root: PUBLIC_DIR }
    );
});


export default app;
