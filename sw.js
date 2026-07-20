/* AGAVA Service Worker — installable PWA + offline shell.
   Network-first: selalu ambil versi terbaru saat online (hindari "kok belum berubah"),
   pakai cache hanya saat offline. */
const CACHE = 'agava-v1';
const ASSETS = [
  './', './index.html',
  './icon-192.png', './icon-512.png', './icon-180.png',
  './glass.mp3', './xlsx.full.min.js', './html2canvas.min.js', './jspdf.umd.min.js'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;                      // biarkan Firebase POST dll lewat
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;             // jangan cache lintas-origin (Firebase/CDN)
  e.respondWith(
    fetch(e.request).then(r => {
      const cp = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, cp)).catch(() => {});
      return r;
    }).catch(() => caches.match(e.request).then(m => m || caches.match('./index.html')))
  );
});
