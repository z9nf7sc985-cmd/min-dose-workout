const CACHE = 'mindose-v2';
const ASSETS = ['./', './index.html', './styles.css', './app.js', './program.js', './manifest.json', './icons/apple-touch-icon.png', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Network-first (always fresh when online), cache fallback when offline.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    try {
      const r = await fetch(req, { cache: 'no-cache' });
      if (r && r.ok) c.put(req, r.clone());
      return r;
    } catch (err) {
      return (await c.match(req, { ignoreSearch: true })) || (req.mode === 'navigate' ? c.match('./index.html') : Response.error());
    }
  })());
});
