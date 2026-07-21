/* AGAVA Service Worker — installable PWA + offline shell + notification.
   Network-first: selalu ambil versi terbaru saat online (hindari "kok belum berubah"),
   pakai cache hanya saat offline. */
const CACHE = 'agava-v2';
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
/* klik notifikasi di tray → fokuskan aplikasi (atau buka baru bila sudah tertutup) */
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) { if ('focus' in c) return c.focus(); }
    return clients.openWindow('./index.html');
  }));
});
/* Web Push / FCM (server-initiated) — dukung payload polos {title,body}
   maupun bentuk FCM {notification:{title,body}, data:{...}} */
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { body: e.data && e.data.text() }; }
  const n = d.notification || d;
  e.waitUntil(self.registration.showNotification(n.title || 'AGAVA', {
    body: n.body || '', icon: './icon-192.png', badge: './icon-192.png', vibrate: [120, 60, 120],
    data: { url: (d.data && d.data.url) || './index.html' }
  }));
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
