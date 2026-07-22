const CACHE_NAME = 'sgl-planning-v2';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Only cache static assets — never intercept HTML or API calls
  if (
    e.request.method !== 'GET' ||
    url.hostname.includes('github') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('netlify') ||
    e.request.headers.get('accept')?.includes('text/html')
  ) {
    return; // Let browser handle normally
  }

  // For CDN assets (React, XLSX etc) — cache them
  if (url.hostname.includes('cdnjs') || url.hostname.includes('jsdelivr')) {
    e.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(e.request).then(cached => {
          if (cached) return cached;
          return fetch(e.request).then(response => {
            if (response.ok) cache.put(e.request, response.clone());
            return response;
          });
        })
      )
    );
  }
});
