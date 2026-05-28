// Kniha Jazd — Service Worker v0.8.9 (build 5)
const CACHE_NAME = 'knjazd-v5';

const STATIC_ASSETS = [
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './manifest.json',
];

// Hostnames that must NEVER be intercepted — always go straight to network
const NETWORK_ONLY_HOSTS = [
  'api.github.com',
  'raw.githubusercontent.com',
  'www.googleapis.com',
  'accounts.google.com',
  'oauth2.googleapis.com',
  'nominatim.openstreetmap.org',
  'router.project-osrm.org',
  'date.nager.at',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'api.allorigins.win',
  'corsproxy.io',
  'calendarmcp.googleapis.com',
  'gmailmcp.googleapis.com',
  'drivemcp.googleapis.com',
];

self.addEventListener('install', e => {
  // Skip waiting immediately — don't hold back on old clients
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .catch(err => console.warn('[SW] Install cache warn:', err))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[SW] Removing old cache:', k);
          return caches.delete(k);
        })
      ))
      .then(() => self.clients.claim())  // take over ALL open tabs immediately
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // 1. External / API hosts — pass straight through, never touch cache
  if (NETWORK_ONLY_HOSTS.some(h => url.hostname === h || url.hostname.endsWith('.'+h))) {
    return; // let browser handle it natively — no respondWith = default fetch
  }

  // 2. data.json — network only, no caching
  if (url.pathname.endsWith('/data.json') || url.pathname.endsWith('/data.json?')) {
    return; // pass through
  }

  // 3. index.html / app root — network-first, cache as offline fallback
  const isAppShell = url.pathname === '/' ||
                     url.pathname.endsWith('/') ||
                     url.pathname.endsWith('/index.html');
  if (isAppShell) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res.ok) caches.open(CACHE_NAME).then(c => c.put(e.request, res.clone()));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // 4. Static assets (icons etc.) — cache-first
  if (STATIC_ASSETS.some(s => url.pathname.endsWith(s.replace('./', '')))) {
    e.respondWith(
      caches.match(e.request).then(hit => hit || fetch(e.request))
    );
    return;
  }

  // 5. All other same-origin requests — network with offline cache fallback
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
