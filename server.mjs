import express from 'express';
import path from 'path';
import pkg from './package.json';

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.resolve('./static');

const app = express();


app.get('/manifest.json', (req, res) => {
    res.set('Content-Type', 'application/manifest+json');
    res.send({
        lang: 'pl-PL',
        name: pkg.name,
        short_name: pkg.name,
        icons: [
            {
                src: '/icon.svg',
                sizes: 'any',
                type: 'image/svg+xml',
            },
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
        start_url: '/?utm_source=webmanifest',
        display: 'standalone',
        theme_color: 'black',
        background_color: 'black',
        categories: pkg.keywords,
    });
});

app.get('/index.html', (req, res) => res.redirect('/'));

app.get('/*', (req, res) => {
    let file = req.params[0].trim('/');
    if (file === '')
    {
        file = 'index.html';
    }
    res.sendFile(
        file,
        { root: PUBLIC_DIR }
    );
});

app.listen(PORT, () => console.log(`Listening on http://0.0.0.0:${PORT}`));
