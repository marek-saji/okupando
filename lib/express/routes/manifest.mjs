import {
    getAppName,
    getAppDescription,
    getAppKeywords,
} from '../../metadata';

const favIcon = {
    type: 'image/vnd.microsoft.icon',
    sizes: '32x32 24x24 16x16',
    src: '/favicon.ico',
};

const allPurposeIcons = [
    {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
    },
    {
        src: '/icon-32.png',
        sizes: '32x32',
        type: 'image/png',
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
];

const maskableIcons = [
    {
        src: '/icon-maskable.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
    },
    {
        src: '/icon-32.png',
        sizes: '32x32',
        type: 'image/png',
        purpose: 'maskable',
    },
    {
        src: '/icon-maskable-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
    },
    {
        src: '/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
    },
];

export default app => app.get('/manifest.json', (req, res) => {
    res.set('Content-Type', 'application/manifest+json');
    res.send({
        lang: 'pl-PL',
        name: getAppName(),
        short_name: getAppName(),
        description: getAppDescription(),
        icons: [
            ...allPurposeIcons,
            ...maskableIcons,
            ...[favIcon],
        ],
        start_url: '/?utm_source=webmanifest',
        display: 'standalone',
        theme_color: 'black',
        background_color: 'black',
        categories: getAppKeywords(),
    });
});
