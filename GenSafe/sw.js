const CACHE_NAME = 'GenSafe-v1';
const ASSETS_TO_CACHE = [
    './GenSafe.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// انسٹالیشن کے دوران پرانے کیش کو ہٹانا اور نیا کیش بنانا
self.addEventListener('install', event => {
    self.skipWaiting(); // پرانے ورژن کو فوراً ختم کر کے نئے کو ایکٹیو کرنا
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// سروس ورکر کو کنٹرول میں لانا
self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
});

// نیٹ ورک کی جگہ کیش سے فائلیں فراہم کرنا
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
