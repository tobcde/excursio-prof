const CACHE_NAME = 'excursio-prof-v1';
const STATIC_FILES = [
  '/excursio-prof/',
  '/excursio-prof/index.html',
  '/excursio-prof/manifest.json',
  '/excursio-prof/icons/icon-192.png',
  '/excursio-prof/icons/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_FILES).catch(err => console.log('Cache parcial:', err));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.url.includes('script.google.com') ||
      event.request.url.includes('googleusercontent.com')) {
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => {
        return cached || new Response(
          '<h2 style="font-family:sans-serif;text-align:center;margin-top:40px">Sin conexion</h2>',
          { headers: { 'Content-Type': 'text/html' } }
        );
      }))
  );
});
