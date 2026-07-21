# FCM Server Push — Panduan Setup AGAVA

Tujuan: notifikasi tetap masuk ke HP **walaupun aplikasi AGAVA sudah ditutup** (bukan hanya saat app hidup).

Kode sisi aplikasi **sudah siap semua** (build v2026.07.21-20): SDK messaging termuat, service worker sudah punya handler `push`, token perangkat otomatis tersimpan ke Firestore. Anda hanya perlu 2 tahap di bawah.

---

## Tahap 1 — Aktifkan Web Push (10 menit, gratis)

1. Buka [Firebase Console](https://console.firebase.google.com) → project **agava-astra**.
2. Klik ⚙️ **Project settings** → tab **Cloud Messaging**.
3. Di bagian **Web configuration → Web Push certificates**, klik **Generate key pair**.
4. Salin key yang muncul (diawali huruf `B...`, panjang ±88 karakter).
5. Buka file sumber `agava-app.html` (atau `index.html` di repo), cari baris:
   ```js
   const AGAVA_FCM_VAPID="";
   ```
   Tempel key di antara tanda kutip:
   ```js
   const AGAVA_FCM_VAPID="BNx....key-anda....";
   ```
   *(atau kirimkan key itu ke Claude — nanti dipasangkan + di-push sekalian)*
6. Deploy (commit + push ke GitHub Pages).
7. Di HP: buka AGAVA (PWA dari Home Screen) → login → izinkan notifikasi.
   Console browser akan menulis `FCM aktif — token perangkat terdaftar`, dan di
   Firestore muncul koleksi **`agava_fcm_tokens`** berisi 1 dokumen per perangkat
   (lengkap dengan email user, role, dan kategori operatornya).

### Uji coba tanpa server (langsung bisa)
1. Firebase Console → **Run → Messaging** → **New campaign → Notifications**.
2. Isi judul + isi pesan → klik **Send test message**.
3. Tempel token perangkat (salin dari dokumen di `agava_fcm_tokens` → field `token`).
4. **Tutup aplikasi AGAVA di HP sepenuhnya** → kirim → notifikasi tetap masuk ke tray. ✅

Sampai sini push manual sudah jalan. Tahap 2 membuat pengirimannya **otomatis**.

---

## Tahap 2 — Push otomatis saat tiket/SO baru (Cloud Functions)

> Butuh upgrade project ke paket **Blaze** (pay-as-you-go, minta kartu, tapi ada
> kuota gratis 2 juta invocation/bulan — pemakaian AGAVA praktis Rp 0).
> Butuh **Node.js** ter-install di laptop (sekali saja, untuk deploy).

1. Firebase Console → ⚙️ → **Usage and billing** → upgrade ke **Blaze**.
2. Di laptop (PowerShell):
   ```powershell
   npm install -g firebase-tools
   firebase login
   mkdir agava-functions; cd agava-functions
   firebase init functions      # pilih project agava-astra, JavaScript, tanpa ESLint
   ```
3. Ganti isi `functions/index.js` dengan:
   ```js
   const {onDocumentCreated} = require("firebase-functions/v2/firestore");
   const admin = require("firebase-admin");
   admin.initializeApp();

   const APP_URL = "https://sudanavisudhaml-beep.github.io/agava-web/";

   async function pushAll(title, body, filterCat) {
     const snap = await admin.firestore().collection("agava_fcm_tokens").get();
     let docs = snap.docs;
     // operator field ops hanya menerima tiket kategorinya; role lain terima semua
     if (filterCat) docs = docs.filter(d => {
       const x = d.data();
       return x.role !== "fieldops" || !x.cat || x.cat === filterCat;
     });
     const tokens = docs.map(d => d.id);
     if (!tokens.length) return;
     const res = await admin.messaging().sendEachForMulticast({
       tokens,
       notification: { title, body },
       webpush: { fcmOptions: { link: APP_URL }, notification: { icon: APP_URL + "icon-192.png", badge: APP_URL + "icon-192.png" } }
     });
     // token kadaluarsa (app di-uninstall) → bersihkan
     await Promise.all(res.responses.map((r, i) =>
       (!r.success && /registration-token-not-registered/.test(String(r.error)))
         ? admin.firestore().collection("agava_fcm_tokens").doc(tokens[i]).delete() : null));
   }

   exports.notifyNewTicket = onDocumentCreated("agava_tickets/{no}", async ev => {
     const t = ev.data.data();
     await pushAll("🎫 Tiket baru — " + (t.cat || "GA"), (t.judul || "") + " · " + (t.lokasi || ""), t.cat || null);
   });

   exports.notifyNewSO = onDocumentCreated("agava_so/{no}", async ev => {
     const s = ev.data.data();
     await pushAll("📋 SO baru masuk", (s.no || "") + " · " + (s.item || ""));
   });
   ```
4. Deploy:
   ```powershell
   firebase deploy --only functions
   ```
5. Tes: buat tiket dari laptop → HP yang aplikasinya TERTUTUP tetap menerima notifikasi. ✅

---

## Cara kerja (ringkas)

```
Tiket baru → Firestore agava_tickets
                    │  (trigger otomatis)
             Cloud Function ── ambil daftar token dari agava_fcm_tokens
                    │  (kirim via FCM)
             Google Push Service ──► HP (walau app tertutup)
                    │
             sw.js 'push' handler ──► notifikasi tray + icon + getar
             klik notifikasi ──► buka AGAVA
```

Catatan:
- iPhone: perlu iOS 16.4+ **dan** AGAVA di-Add to Home Screen; izinkan notifikasi.
- Tanpa Tahap 2, notifikasi realtime tetap jalan selama app hidup (foreground/background) — yang ditambahkan Tahap 2 hanyalah kondisi *app tertutup penuh*.
- Keamanan: token hanyalah alamat kirim; menghapus dokumennya di `agava_fcm_tokens` menghentikan push ke perangkat itu.
