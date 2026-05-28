// Kniha Jazd — Service Worker v0.8.9 (disabled)
// This SW immediately unregisters itself to prevent any network interference.
// PWA installability is maintained via manifest.json + HTTPS.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(
    self.registration.unregister()
      .then(() => self.clients.matchAll())
      .then(clients => clients.forEach(c => c.navigate(c.url)))
  );
});
