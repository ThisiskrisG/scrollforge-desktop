const CACHE_NAME = 'scrollforge-cache-v1';
const ASSETS_TO_CACHE = [
  // Add any heavy, stable URLs you want cached on first load.
  'https://cdn.jsdelivr.net/pyodide/v0.23.3/full/pyodide.js',
  'https://cdn.jsdelivr.net/pyodide/v0.23.3/full/pyodide.wasm',
  // you can add monaco CDN or local monaco paths
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Basic cache-first for known assets
  if (ASSETS_TO_CACHE.includes(event.request.url)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(event.request).then((resp) => resp || fetch(event.request).then((f) => { cache.put(event.request, f.clone()); return f; }))
      )
    );
  } else {
    // fallback to network for everything else
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
  }
});
