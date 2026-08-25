/* AGAVA Service Worker — installable PWA + offline shell + notification.

   ══ PELAJARAN 30 Jul 2026 — "di iPad kok masih versi lama?" ══════════════════
   Nama cache dulu dipatok 'agava-v3' dan TIDAK PERNAH dinaikkan. Akibatnya:
     · handler `activate` tidak pernah membuang cache lama (namanya sama), dan
     · handler `install` tidak pernah jalan lagi (isi sw.js tidak berubah),
   sehingga salinan offline ./index.html di perangkat membeku di tanggal ia
   pertama kali dipasang. Begitu satu permintaan jaringan gagal — hal biasa di
   iPad yang berpindah wifi — jalur cadangan menyajikan index.html tanggal 27
   Juli, LENGKAP dengan panel Quick Access yang sudah dibuang di v114.

   Tiga hal yang mencegahnya terulang:
     1. CACHE diikat ke nomor build → tiap deploy otomatis membuang cache lama.
     2. Permintaan navigasi/HTML diambil dengan cache:'reload' → melewati cache
        HTTP browser, bukan cuma cache service worker.
     3. Ada pintu PURGE lewat postMessage, dipakai tombol "Perbarui sekarang"
        di aplikasi untuk membersihkan semuanya tanpa menunggu iOS berbaik hati.
   ══════════════════════════════════════════════════════════════════════════ */
const BUILD = 'v2026.08.25-242';
const CACHE = 'agava-' + BUILD;          /* WAJIB ikut naik tiap deploy */
const ASSETS = [
  './', './index.html',
  './icon-192.png', './icon-512.png', './icon-180.png',
  /* lockup resmi halaman login — ikut di-cache supaya login tetap berlogo saat offline */
  /* SVG induk — dipakai halaman Login & bumper. PNG lama tetap di-cache
     sementara supaya perangkat yang masih memegang HTML lawas tidak kehilangan
     logonya di tengah peralihan build. */
  './logo/AGAVA-Logo-white.svg', './logo/AGAVA-Mark.svg',
  './assets/agava-lockup-g2-white.png', './agava-logo.svg',
  './glass.mp3', './xlsx.full.min.js', './html2canvas.min.js', './jspdf.umd.min.js',
  /* pdf.js — dipakai pratinjau halaman lampiran PDF di Dokumen SO (dimuat saat dibutuhkan) */
  './pdf.min.js', './pdf.worker.min.js'
];
self.addEventListener('install', e => {
  /* cache:'reload' → isi ASSETS diambil segar dari jaringan, bukan dari cache
     HTTP browser yang bisa saja masih memegang berkas lama. */
  e.waitUntil(caches.open(CACHE).then(c =>
    Promise.all(ASSETS.map(u =>
      fetch(new Request(u, { cache: 'reload' })).then(r => r.ok ? c.put(u, r) : null).catch(() => {})
    ))
  ));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
/* Pintu perintah dari aplikasi: PURGE (bersihkan semua cache) & VERSI (tanya build) */
self.addEventListener('message', e => {
  const d = e.data || {};
  if (d.type === 'PURGE') {
    e.waitUntil(caches.keys().then(ks => Promise.all(ks.map(k => caches.delete(k)))).then(() => {
      if (e.source && e.source.postMessage) e.source.postMessage({ type: 'PURGED' });
    }));
  } else if (d.type === 'VERSI') {
    if (e.source && e.source.postMessage) e.source.postMessage({ type: 'VERSI', build: BUILD });
  }
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

  /* Halaman & skrip aplikasi: PAKSA ambil dari jaringan, lewati cache HTTP.
     Inilah bedanya dengan sebelumnya — dulu fetch biasa masih boleh dilayani
     salinan lama Safari, lalu salinan itu ikut disimpan ke cache. */
  const isShell = e.request.mode === 'navigate' ||
                  /\.html$/i.test(url.pathname) || url.pathname.endsWith('/') ||
                  /\/(sw|version)\.(js|json)$/i.test(url.pathname);

  e.respondWith(
    fetch(isShell ? new Request(e.request, { cache: 'reload' }) : e.request).then(r => {
      if (r && r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)).catch(() => {}); }
      return r;
    }).catch(() => caches.match(e.request).then(m => m || caches.match('./index.html')))
  );
});
