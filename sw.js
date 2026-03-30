const CACHE_NAME = 'boss-block-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/game.js',
    '/ui.js',
    '/firebase-config.js',
    '/icon.svg',
    '/background.svg',
    '/bg1.svg',
    '/bg2.svg',
    '/bg3.svg',
    '/bg4.svg',
    '/bg5.svg',
    '/bg6.svg',
    '/bg7.svg',
    '/bg8.svg',
    '/bg9.svg',
    '/bg10.svg'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (e) => {
    // Only intercept same-origin requests to allow Firebase calls to pass unharmed
    if (e.request.url.startsWith(self.location.origin)) {
        e.respondWith(
            caches.match(e.request).then(response => {
                // Return cached version or fetch from network (stale-while-revalidate pattern or standard fallback)
                return response || fetch(e.request).catch(() => caches.match('/index.html'));
            })
        );
    }
});

self.addEventListener('activate', (e) => {
    // Cleanup old caches if any
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== CACHE_NAME)
                .map(key => caches.delete(key))
            );
        })
    );
});

// Notifications
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            if (clientList.length > 0) {
                let client = clientList[0];
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].focused) {
                        client = clientList[i];
                    }
                }
                return client.focus();
            }
            return clients.openWindow('/');
        })
    );
});

