/* ═══════════════════════════════════════════════════════════════════════════
   SERVICE WORKER PENGHANCUR DIRI — menggantikan sw.js AGAVA di origin lama.

   Mengapa berkas ini perlu ada, padahal halaman pengalih sudah mencabut SW?

   Karena urutannya tidak dijamin. Perangkat yang membuka origin lama akan
   memeriksa sw.js lebih dulu (browser mengecek pembaruan SW pada setiap
   navigasi). Bila yang ditemukan masih sw.js AGAVA yang lama, ia terpasang
   kembali — bahkan pada detik yang sama saat halaman pengalih mencoba
   mencabutnya. Berkas ini memutus lingkaran itu: SW lama digantikan oleh SW
   yang tugas satu-satunya adalah membunuh dirinya sendiri.

   Urutannya:
     install  → skipWaiting, jangan menunggu tab lain ditutup
     activate → hapus SEMUA cache → unregister diri → paksa muat ulang semua
                tab yang dikendalikannya, sehingga mereka mendarat di halaman
                pengalih (yang tidak lagi punya SW) lalu diteruskan ke alamat
                baru.

   TIDAK ADA handler fetch. Itu disengaja: tanpa fetch handler, tidak ada satu
   pun permintaan yang bisa dilayani dari cache. Menambahkannya justru
   menghidupkan kembali masalah yang berkas ini datang untuk membunuh.
   ═══════════════════════════════════════════════════════════════════════════ */

self.addEventListener('install', function(){
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys()
      .then(function(ks){ return Promise.all(ks.map(function(k){ return caches.delete(k); })); })
      .catch(function(){})
      .then(function(){ return self.registration.unregister(); })
      .then(function(){ return self.clients.matchAll({ type: 'window' }); })
      .then(function(cs){
        cs.forEach(function(c){
          try { c.navigate(c.url); } catch (err) {}
        });
      })
      .catch(function(){})
  );
});
