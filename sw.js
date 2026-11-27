const CACHE = 'tt-gps-preview-v15';
const CACHE_PREFIX = 'tt-gps-preview-';
const ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  // The worker controls only this preview path. External production assets are not cached here.
  if (url.origin !== self.location.origin || !url.pathname.startsWith(self.registration.scope.replace(self.location.origin, ''))) return;

  const isHtml = request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/');
  if (isHtml) {
    event.respondWith(
      fetch(request, { cache: 'no-store' }).then((response) => {
        if (response && response.ok) {
          caches.open(CACHE).then((cache) => cache.put(request, response.clone()));
        }
        return response;
      }).catch(() => caches.open(CACHE).then((cache) => cache.match(request)))
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE).then((cache) => cache.match(request).then((cached) => cached || fetch(request)))
  );
});
