const CACHE_NAME = 'sgl-planning-board-v1';
const ASSETS = [
  './SGL_PlanningBoard_Viewer.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

// Install — cache core assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — serve from cache, fallback to network
// For GitHub API calls (production data) — always try network first
self.addEventListener('fetch', e => {
  const url = e.request.url;

  // GitHub API — network first, no cache (always get latest plan)
  if (url.includes('api.github.com')) {
    e.respondWith(
      fetch(e.request).catch(() =>
        caches.match(e.request)
      )
    );
    return;
  }

  // App assets — cache first, fallback to network
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Cache new assets dynamically
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback — return cached viewer
        return caches.match('./SGL_PlanningBoard_Viewer.html');
      });
    })
  );
});
