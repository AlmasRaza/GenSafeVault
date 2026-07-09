const CACHE_NAME = 'GenSafe-v1';
const ASSETS_TO_CACHE = [
    './',
    './GenSafe.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// ایپ کو پہلی بار انسٹال کرتے وقت تمام فائلیں میموری (کیش) میں محفوظ کرنا
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// جب بھی ایپ کھلے گی تو انٹرنیٹ کے بجائے میموری (کیش) سے فائلیں لوڈ کرنا
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
// اس کوڈ سے سروس ورکر فوراً ایکٹیو ہو جائے گا
self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
});
