const CACHE = 'wombat-v2';
const STATIC = ['./index.html','./manifest.json'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Always pass through API calls — never cache or intercept these
  const apiHosts = ['api.anthropic.com','corsproxy.io','api.allorigins.win','api.frankfurter.app','api.coingecko.com','api.alternative.me','query1.finance.yahoo.com','query2.finance.yahoo.com'];
  if(apiHosts.some(h => url.hostname.includes(h))) {
    e.respondWith(fetch(e.request));
    return;
  }
  // For external non-API requests, try network then silent fail
  if(url.hostname !== location.hostname) {
    e.respondWith(fetch(e.request).catch(()=>new Response('', {status:503})));
    return;
  }
  // For local app files, cache first
  e.respondWith(caches.match(e.request).then(c => c || fetch(e.request).then(r => { caches.open(CACHE).then(c=>c.put(e.request,r.clone())); return r; })));
});
