// sw.js - This is your Service Worker
// It tells the browser this is a Progressive Web App (PWA)

const CACHE_NAME = 'oasis-v1';

// Install event: Cache the essential files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/style.css',
                '/script.js',
                '/logo.png',
                '/manifest.json'
            ]);
        })
    );
});

// Fetch event: Serve files from cache if offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});