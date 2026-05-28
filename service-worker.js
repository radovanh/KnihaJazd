// Kniha Jazd — Service Worker v0.9.0
// Strategy: cache ONLY static assets (icons, manifest)
// index.html is always fetched fresh — no cache bumping needed on app updates

const CACHE_NAME = 'knjazd-static-v1';  // only changes if icons/manifest change

const STATIC = [
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './manifest.json',
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(STATIC))
      .catch(err => console.warn('[SW] install cache warn:', err))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Never intercept external requests — pass straight through
  if (url.origin !== self.location.origin) return;

  // Never cache index.html or data.json — always network
  const path = url.pathname;
  if (path.endsWith('/') || path.endsWith('/index.html') || path.endsWith('.json')) return;

  // Static assets — cache first
  if (STATIC.some(s => path.endsWith(s.replace('./', '')))) {
    e.respondWith(
      caches.match(e.request).then(hit => hit || fetch(e.request))
    );
    return;
  }

  // Everything else — network only
});
