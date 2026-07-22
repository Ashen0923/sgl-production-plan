const CACHE='sgl-v3';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{
  const u=e.request.url;
  if(!u.startsWith('http'))return;
  if(u.includes('api.github.com'))return;
  if(e.request.headers.get('accept')||'').includes('text/html'))return;
  if(u.includes('cdnjs.cloudflare.com')||u.includes('cdn.jsdelivr.net')){
    e.respondWith(caches.open(CACHE).then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(res=>{if(res.ok)c.put(e.request,res.clone());return res;}))));
  }
});