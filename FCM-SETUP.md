# Push Notification AGAVA — Panduan Aktivasi

**Tujuan:** notifikasi masuk ke HP (suara + banner + getar) untuk **semua layanan GA**, **walaupun aplikasi AGAVA sudah ditutup / HP tidur.**

Kode aplikasi **sudah siap** (service worker `push` handler, pendaftaran token otomatis ke `agava_fcm_tokens`, tampilan foreground). Pengirim otomatis (Cloud Function) **juga sudah dibuatkan** di folder `../agava-functions/` — lengkap untuk semua layanan.

Tinggal **2 langkah** yang hanya bisa dikerjakan dari akun Firebase Anda.

---

## Langkah 1 — Aktifkan Web Push (WAJIB · gratis · ±5 menit)

Tanpa ini, **tidak ada** HP yang bisa menerima push (koleksi `agava_fcm_tokens` akan tetap kosong).

1. Buka [Firebase Console](https://console.firebase.google.com) → project **agava-astra**.
2. ⚙️ **Project settings** → tab **Cloud Messaging**.
3. **Web configuration → Web Push certificates** → **Generate key pair**.
4. Salin key-nya (diawali `B…`, ±88 karakter).
5. **Kirim key itu ke Claude di chat** — nanti dipasang ke `const AGAVA_FCM_VAPID="…"` di `index.html`, lalu di-commit + push sekalian.
   *(atau tempel sendiri di baris `const AGAVA_FCM_VAPID="";`)*
6. Di HP: buka AGAVA **dari Home Screen (PWA)** → login → izinkan notifikasi.
   Cek: di Firestore muncul koleksi **`agava_fcm_tokens`** berisi 1 dokumen per perangkat.

### Uji tanpa server (langsung bisa dipakai demo)
Firebase Console → **Run → Messaging → New campaign → Notifications → Send test message** → tempel `token` dari `agava_fcm_tokens` → **tutup AGAVA di HP sepenuhnya** → kirim → notifikasi tetap masuk ke tray. ✅

---

## Langkah 2 — Push OTOMATIS untuk semua layanan (Cloud Functions)

> Perlu paket **Blaze** (pay-as-you-go). Ada kuota gratis 2 juta invocation/bulan —
> pemakaian AGAVA praktis **Rp 0**. Butuh **Node.js** untuk sekali deploy
> (Node portable sudah tersedia di laptop ini).

Folder `agava-functions/` **sudah jadi** — tidak perlu `firebase init` lagi.

1. Firebase Console → ⚙️ → **Usage and billing** → upgrade ke **Blaze**.
2. Di PowerShell:
   ```powershell
   npm install -g firebase-tools
   firebase login
   cd "C:\Users\sudana061054\OneDrive - Astra International Tbk, PT\GAVA\agava-functions"
   cd functions ; npm install ; cd ..
   firebase deploy --only functions
   ```
3. Selesai. Buat tiket / SO baru dari laptop → HP yang **aplikasinya tertutup** tetap menerima notifikasi. ✅

### Layanan yang sudah dicakup pengirim otomatis
| Kejadian | Penerima |
|---|---|
| Tiket baru — Keluhan · Reservasi Ruang · Transport · Lembur | Operator lapangan kategori terkait (+ admin) |
| Tiket mulai diproses / selesai | Pemohon tiket |
| Tiket dieskalasi | Dept & Section Head |
| SO baru | Section Head (atau Budget bila sudah pra-approve) |
| SO maju tahap (Section→Budget→Proc/Dept) | Approver tahap berikutnya |
| SO ditolak / diproses Procurement | Pemohon SO |
| Work Permit baru | Section & Dept Head |

Mengubah siapa menerima apa: sunting tabel routing di `agava-functions/functions/index.js` (fungsi `roleIn` / `opsForCat` / `isPerson`), lalu deploy ulang.

---

## Cara kerja (ringkas)

```
Ada layanan baru / perubahan → Firestore (agava_tickets · agava_so · agava_workpermits)
        │  (trigger otomatis)
   Cloud Function ── ambil token dari agava_fcm_tokens (filter per role/kategori/pemohon)
        │  (kirim via FCM)
   Google Push Service ──► HP (walau app tertutup / layar mati)
        │
   sw.js 'push' handler ──► banner + ikon + getar   →  klik → buka AGAVA
```

Catatan:
- **iPhone:** perlu iOS 16.4+ **dan** AGAVA di-**Add to Home Screen**; izinkan notifikasi. Tidak jalan di tab Safari biasa.
- Tanpa Langkah 2, notifikasi realtime tetap jalan **selama app hidup**. Yang ditambahkan Langkah 2 adalah kondisi **app tertutup penuh**.
- Anti-spam sudah ditangani: perubahan tanpa arti diabaikan, dan saat sinkronisasi awal tiket/SO lama tidak dikirim ulang.
- Suara: push latar memakai suara notifikasi bawaan OS + getar. Suara khusus (`glass.mp3`) hanya berlaku saat app sedang terbuka.
- Keamanan: token hanyalah alamat kirim; hapus dokumennya di `agava_fcm_tokens` untuk menghentikan push ke perangkat itu.
