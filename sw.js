const CACHE = 'mindose-v3';
const ASSETS = ['./', './index.html', './styles.css', './app.js', './program.js', './guide.js', './meals.js', './manifest.json', './icons/apple-touch-icon.png', './icons/icon-192.png', './icons/icon-512.png',
  './ex/archer.svg', './ex/c_abduct.svg', './ex/c_ankles.svg', './ex/c_brace.svg', './ex/c_calf.svg', './ex/c_elbowdrive.svg', './ex/c_glute.svg', './ex/c_heeldig.svg', './ex/c_kneeext.svg', './ex/c_kneelift.svg', './ex/c_neck.svg', './ex/c_ohp.svg', './ex/c_seatpush.svg', './ex/c_vacuum.svg', './ex/calfraise.svg', './ex/couchsquat.svg', './ex/deadbug.svg', './ex/declinepush.svg', './ex/diamond.svg', './ex/elevpike.svg', './ex/fingerplank.svg', './ex/fistsqueeze.svg', './ex/floorpull.svg', './ex/glutebridge.svg', './ex/hollow.svg', './ex/inclinepush.svg', './ex/legcurl.svg', './ex/nordic.svg', './ex/palmpress.svg', './ex/pikepush.svg', './ex/pushup.svg', './ex/revcrunch.svg', './ex/revlunge.svg', './ex/shrimp.svg', './ex/slhipthrust.svg', './ex/slidecurl.svg', './ex/snowangel.svg', './ex/sphinx.svg', './ex/splitsquat.svg', './ex/srcurl.svg', './ex/srlat.svg', './ex/srpullapart.svg', './ex/srrow.svg', './ex/supermanpull.svg', './ex/tempsquat.svg', './ex/walkout.svg', './ex/walllat.svg', './ex/wallsit.svg', './ex/ytw.svg'];
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
