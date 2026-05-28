// Kniha Jazd — Service Worker v0.8.9
// Strategy: network-first for HTML + data, cache-only fallback for offline

const CACHE_NAME = 'knjazd-v4';

// Only cache truly static assets — NOT data.json, NOT index.html (changes with releases)
const STATIC = [
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './manifest.json',
];

// ── Install: pre-cache only icons + manifest
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('[SW] Install cache error:', err))
  );
});

// ── Activate: wipe ALL old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => {
        console.log('[SW] Deleting old cache:', k);
        return caches.delete(k);
      })))
      .then(() => self.clients.claim())
  );
});

// ── Fetch strategy
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // 1. API calls — always network only, never cache
  const isAPI = [
    'api.github.com', 'www.googleapis.com', 'accounts.google.com',
    'nominatim.openstreetmap.org', 'router.project-osrm.org',
    'date.nager.at', 'oauth2.googleapis.com', 'api.allorigins.win'
  ].some(h => url.hostname.includes(h));
  if (isAPI) { e.respondWith(fetch(e.request)); return; }

  // 2. data.json — always network, never cache (it changes constantly)
  if (url.pathname.endsWith('data.json')) {
    e.respondWith(
      fetch(e.request).catch(() => {
        // Only fall back to cache if completely offline
        return caches.match(e.request);
      })
    );
    return;
  }

  // 3. index.html — network-first (get latest), fall back to cache if offline
  if (url.pathname.endsWith('/') || url.pathname.endsWith('index.html') || url.pathname === url.origin + '/') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          // Cache the fresh copy for offline fallback
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // 4. Google Fonts — stale-while-revalidate
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(e.request).then(cached => {
          const fetchPromise = fetch(e.request).then(res => {
            cache.put(e.request, res.clone()); return res;
          });
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // 5. Static assets (icons, manifest) — cache-first
  if (STATIC.some(s => url.pathname.endsWith(s.replace('./', '')))) {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request))
    );
    return;
  }

  // 6. Everything else — network with cache fallback
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
