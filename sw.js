const CACHE = 'wombat-v1';
const STATIC = ['./index.html','./manifest.json'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if(new URL(e.request.url).hostname !== location.hostname){ e.respondWith(fetch(e.request).catch(()=>new Response('{"error":"offline"}'))); return; }
  e.respondWith(caches.match(e.request).then(c => c || fetch(e.request).then(r => { caches.open(CACHE).then(c=>c.put(e.request,r.clone())); return r; })));
});
