# Spesifikasi — SPK, BAST, dan pintu masuk Payment Tracker

**Status: DRAFT — belum System Brief.** Ia baru jadi System Brief setelah pertanyaan di §4 terjawab.
**Tier: 2** (§3.3 kriteria 2 & 3 — mengubah alur approval, dan memperkenalkan aktor eksternal yang menulis)
**Sumber:** arahan Sudana, 21 Agustus 2026 · **Modul:** Procurement → Payment

---

## 1. Yang diminta

### SPK

| | |
|---|---|
| **Nilai** | **Tidak lagi diketik.** Diturunkan dari UPR — vendor pemenang dan harga finalnya |
| **Nomor** | **Tetap diketik manual.** Penomoran internal sudah berjalan di luar AGAVA; AGAVA tidak boleh mengarang nomor tandingan |
| **Isi dokumen** | Wajib memunculkan **No SO**, **No UPR**, dan **No Tiket bila ada** — sebagai jejak audit menyeluruh |

### BAST

1. BAST **wajib melampirkan dokumen manualnya**
2. **Vendor mengajukan BAST-nya sendiri**, meminta persetujuan kepada kita sebagai user
3. Alur persetujuannya dua tahap: **PIC Project / PIC Requester memaraf** lebih dulu, lalu **Dept Head menandatangani**
4. Setelah ditandatangani, **BAST harus bisa kembali ke vendor**

### Payment Tracker

5. Invoice masuk lewat **kasir Astra — jalur di luar AGAVA**, dan itu tidak akan berubah
6. Tugas AGAVA: **memindahkan SPK yang BAST-nya sudah disetujui penuh** ke modul Payment Tracker
7. Tujuannya agar **PIC Invoice bisa memantau** apakah invoice vendor sudah masuk atau belum
8. Selebihnya **diperbarui manual** di Payment Tracker

> Catatan bacaan: kalimat aslinya berbunyi "agar pic invoice ga bisa memantau". Dari konteksnya saya baca sebagai **"bisa memantau"**. Kalau justru sebaliknya, ini harus dikoreksi sebelum dibangun — artinya terbalik total.

---

## 2. Keadaan kode hari ini

| | Sekarang | Selisih terhadap yang diminta |
|---|---|---|
| Nilai SPK | Diketik lewat kotak isian di `soStep` | Harus diturunkan dari UPR |
| Nomor SPK | **Dikarang** `"SPK-" + nomor SO` | Harus diketik manual |
| Dokumen SPK | Memuat No SO + pemenang + nilai | Belum memuat **No UPR** dan **No Tiket** |
| BAST | **Satu klik**, tanpa lampiran, tanpa paraf, tanpa tanda tangan | Butuh lampiran + 2 tahap persetujuan |
| Pengajuan vendor | Tidak ada | Butuh jalur eksternal |
| Masuk Payment Tracker | Dipicu **klik BAST** | Harus dipicu **BAST disetujui penuh** |

**Yang sudah tersedia dan tidak perlu dibangun:** `s.fromTicket` menyimpan nomor tiket asal, dan `uprNo(s)` menurunkan nomor UPR dari nomor SO. Jejak audit tiga nomor itu **tidak menuntut perubahan model data** — hanya perubahan tampilan dokumen.

---

## 3. Bagian yang paling berisiko: vendor menulis dari luar

Butir 2 memperkenalkan **jalur tulis eksternal kedua**, setelah pengajuan Izin Kerja lewat QR. Bedanya tajam, dan harus disebut terus terang:

> Izin Kerja yang palsu menghasilkan pekerjaan yang tertahan.
> **BAST yang palsu menghasilkan tagihan.**

BAST adalah dokumen yang membuka pintu pembayaran. Jalur masuknya tidak boleh dirancang dengan kelonggaran yang sama seperti Izin Kerja.

Ada juga ketegangan struktural yang harus dipecahkan, bukan ditambal:

- Untuk mengajukan BAST, vendor **harus bisa melihat SPK mana** yang ia BAST-kan
- Tetapi sejak 20 Agu 2026, membaca apa pun menuntut login — dan vendor tidak punya akun

Menyelesaikannya dengan membuka baca untuk vendor akan **membatalkan pekerjaan penutupan tadi malam.** Arah yang benar: vendor tidak "membaca database", melainkan membuka **satu tautan berisi token untuk satu SPK tertentu**, dan aturan hanya mengizinkan menyentuh dokumen yang cocok dengan token itu. Persis pola signed URL, dan itu juga jawaban untuk butir 4 (BAST kembali ke vendor).

---

## 3b. Jawaban Sudana, 21 Agu 2026 — dan apa yang sudah dikerjakan

| Pertanyaan | Jawaban | Status |
|---|---|---|
| Siapa "PIC Project / Requester"? | **Yang menandatangani Pemohon SO — Section Head.** Sudah ada di kode sebagai `soSectionApprover(s)`, dipetakan dari kategori SO | Tidak butuh model data baru |
| Nilai SPK boleh beda dari UPR? | **Tidak.** SPK = harga nego final di UPR | **Selesai (v232)** — diturunkan dari `uprNilaiKomit()` |
| Ada SPK tanpa UPR? | **Ada** | **Selesai (v232)** — dilayani, nilainya diketik, ditandai `spkTanpaUpr` |
| Bagaimana vendor menerima tautan BAST? | **Otomatis.** Prinsip AGAVA: lepas dari ketergantungan pada ingatan orang, bekerja dengan sistem dan otomasi | Belum dibangun |
| PIC Invoice memantau? | **Ya, bisa memantau** — bacaan saya benar | Menunggu alur BAST |

**Konsekuensi jawaban "SPK tanpa UPR ada":** Juklak CHCD menuntut *"Form UPR wajib dibuat sebelum proses SPK/PKS"*, jadi jalur tanpa UPR berada di luar Juklak. Kalau AGAVA membuatnya mulus dan senyap, ia **mengotomasi jalan pintas** (§8.2 Automating the mess). Karena itu jalur tersebut dilayani tetapi **tidak disembunyikan**: nilainya harus diketik, SO ditandai, dan jejak audit menuliskan "TANPA UPR — nilai diketik manual". Dilayani, tapi terlihat — sama seperti perlakuan Penunjukan Langsung.

**Konsekuensi jawaban "semua otomatis":** ini menutup pilihan "Staff Procurement mengirim tautan manual ke vendor". Tautan BAST harus terbit sendiri saat SPK dikirim, dan pengembalian BAST ber-tanda-tangan ke vendor juga harus otomatis. Menaikkan bobot butir 4 §4 dari kenyamanan menjadi keharusan arsitektur.

---

## 4. Pertanyaan yang wajib terjawab sebelum satu baris pun ditulis

**Tentang vendor**

1. Bagaimana vendor menerima tautannya — dikirim manual oleh Staff Procurement lewat email, atau otomatis saat SPK terbit?
2. Kalau tautannya diteruskan ke orang lain, apakah itu masalah? Ini menentukan token sekali-pakai atau tidak.
3. Apakah vendor boleh melihat riwayat BAST-nya, atau cukup satu kali kirim lalu selesai?

**Tentang persetujuan**

4. **"PIC Project / PIC Requester" itu siapa dalam data?** `s.staffPIC`, pemohon SO, atau pemohon tiket asal? Ketiganya bisa berbeda orang.
5. Kalau BAST ditolak saat paraf atau tanda tangan — vendor mengajukan ulang, atau prosesnya berhenti?
6. Dept Head yang menandatangani: selalu GA Dept Head, atau mengikuti departemen pemohon?

**Tentang nomor & nilai**

7. Nomor SPK manual: perlu diperiksa keunikannya? Ada formatnya?
8. Kalau nilai final UPR **berbeda** dengan nilai yang akhirnya di SPK — mungkin ada negosiasi akhir — apakah itu boleh, dan kalau boleh apakah wajib beralasan?
9. SO lama yang nilainya sudah terlanjur diketik: dibiarkan, atau diselaraskan dengan UPR?

**Tentang Payment Tracker**

10. Konfirmasi butir 7 — PIC Invoice **bisa** memantau (bukan sebaliknya)?
11. Siapa yang berhak memperbarui status di Payment Tracker — peran `finance` saja, atau juga Procurement?

---

## 5. Cacat yang ditemukan sepanjang jalan, belum diperbaiki

- **Modul Payment tidak pernah memanggil `soPersist()`.** `invReceive`, `invProcess`, `invConfirmRelease`, dan `invUndo` mengubah objek di memori lalu merender ulang — tanpa menyimpan. Status invoice **hilang saat halaman dimuat ulang**. Harus dibereskan bersamaan, karena butir 6–8 menaruh beban baru tepat di modul ini.
