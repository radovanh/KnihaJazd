// Kniha Jazd — Service Worker v0.8.6
// Caches the app shell for offline use and fast loading

const CACHE_NAME = 'knjazd-v3';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  'https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap'
];

// ── Install: cache app shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL.map(url => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('SW install cache error (non-fatal):', err))
  );
});

// ── Activate: remove old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── Fetch strategy:
//   - Same-origin HTML/JS/CSS → cache-first (app shell)
//   - API calls (GitHub, GDrive, Nominatim, OSRM, Nager) → network-only
//   - Google Fonts → stale-while-revalidate
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Always network-only for API calls
  const isAPI = [
    'api.github.com', 'www.googleapis.com', 'accounts.google.com',
    'nominatim.openstreetmap.org', 'router.project-osrm.org',
    'date.nager.at', 'oauth2.googleapis.com'
  ].some(h => url.hostname.includes(h));

  if (isAPI) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Google Fonts — stale-while-revalidate
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(e.request).then(cached => {
          const fetchPromise = fetch(e.request).then(res => { cache.put(e.request, res.clone()); return res; });
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // App shell (same origin) — cache-first, fallback to network
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(e.request).then(cached =>
        cached || fetch(e.request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          }
          return res;
        })
      )
    );
    return;
  }
});
