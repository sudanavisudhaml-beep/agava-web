# 📁 Folder Data AGAVA — Isi Data Nyata di Sini

Folder ini tempat Anda memasukkan **data nyata** secara manual, supaya AGAVA menampilkan angka sungguhan (Proof of Concept) walaupun flow otomatis belum hidup.

---

## Cara pakai (3 langkah)

1. **Buka file** yang ingin diisi dengan Notepad, VS Code, atau editor teks apa pun.
2. **Ganti angkanya** dengan data nyata. Simpan.
3. **Refresh AGAVA** dengan `Ctrl + Shift + R`. Angka langsung berubah di semua kartu.

> Setiap file punya baris petunjuk yang diawali garis bawah (`_petunjuk`, `_budget`, dst). Itu hanya catatan untuk Anda — AGAVA mengabaikannya. **Jangan dihapus**, biar tetap jadi panduan.

---

## Isi folder

| File | Isinya | Muncul di |
|---|---|---|
| **`codec-config.json`** | Budget OPEX/CAPEX, Asset STO, Procurement Hub, maintenance, work permit overdue, batas energi, nilai HSE (AGC/MKA/SGR), chiller & pompa, **revenue**, **biaya transport**, penilaian vendor, daftar proyek | CODEC (hampir semua kartu), Energy, HSE, Building, Vendor |
| **`energy.json`** | Emisi GRK, intensitas air, bauran terbarukan, sampah — per bulan | Modul Energy + KPI General Facilities Management |
| **`master-data.json`** | STNK, PBB, Perizinan, Izin Operasional, **Jadwal Maintenance**, Repair Works, Kontrak Vendor | Reminder, GA Calendar, Building, Vendor |
| **`kpi-tahunan.json`** | Daftar indikator yang dikontrakkan (CLA): kode, bobot, target. **Capaiannya TIDAK diisi di sini** — selalu ditarik otomatis dari CODEC | Modul KPI Tahunan |

> `codec-config.json` juga berisi dua pengatur khusus: **`today`** (tanggal acuan seluruh aplikasi — kosongkan agar ikut tanggal nyata, isi tanggal untuk mematok saat demo) dan **`impact`** (baseline "sebelum AGAVA" untuk modul Impact — jam rekap manual/bulan, biaya per jam, denda yang pernah terjadi).

---

## Aturan penting

### Siapa yang menang kalau datanya beda?

```
Input Anda DI AGAVA  >  File di folder ini  >  Contoh bawaan aplikasi
   (tombol Tambah Data)      (data/*.json)
```

- **`codec-config.json` & `energy.json`** → **selalu** dibaca setiap kali AGAVA dibuka. Ubah file = ubah angka. Ini file utama Anda.
- **`master-data.json`** → hanya dipakai saat AGAVA **pertama kali** dibuka di sebuah perangkat. Setelah Anda menambah data lewat tombol **＋ Tambah Data** di dalam AGAVA, input Anda yang dipakai.
  - Mau kembali memakai file? Buka **Vendor Management → Power Automate Bridge → "Muat ulang dari file data"**.

### Prinsip yang perlu diingat

Folder ini adalah **jembatan sementara** untuk Proof of Concept. Tujuan akhirnya tetap **Prinsip 8: AGAVA adalah sumber datanya** — data diketik langsung di AGAVA lewat tombol di tiap modul, bukan lewat file.

Gunakan file untuk **memuat data awal yang banyak sekaligus**. Setelah itu, kelola lewat AGAVA.

---

## Format yang wajib dipatuhi

| Hal | Aturan | Contoh benar | Contoh salah |
|---|---|---|---|
| Tanggal | `YYYY-MM-DD` | `"2026-12-31"` | `31/12/2026` |
| Angka | tanpa kutip, titik untuk desimal | `27.5` | `"27,5"` |
| Teks | selalu pakai kutip ganda | `"AMDI"` | `AMDI` |
| Koma | antar-baris ada koma, **baris terakhir tidak** | lihat file | — |
| Persen | tulis angkanya saja (0–100) | `68` | `"68%"` |

### Satuan

- **Revenue** → **miliar** rupiah. `0.62` = Rp 620 juta · `1.8` = Rp 1,8 miliar
- **Transport & nilai kontrak** → **juta** rupiah. `27` = Rp 27 juta
- **Emisi GRK** → kg CO₂e
- **Penilaian vendor** → skala 0–3

### Kalau AGAVA tidak berubah setelah Anda edit

1. Pastikan sudah `Ctrl + Shift + R` (bukan refresh biasa).
2. Buka **Console** browser (F12) — bila ada tulisan `AGAVA data — file tidak terbaca`, berarti format JSON-nya salah (biasanya **koma berlebih** atau **kutip kurang**).
3. Cek ulang file di [jsonlint.com](https://jsonlint.com) — tempel isinya, klik Validate.

---

## Yang TIDAK ada di folder ini

| Data | Di mana |
|---|---|
| **Tiket layanan** | Database Firebase (langsung dari modul Service / Copilot / QR) |
| **Work Permit** | Database Firebase (form internal & QR eksternal) |
| **Timeline proyek** | Diinput di modul Project Development, tersimpan di perangkat |
| **Supply Order & Payment** | Diinput di modul Procurement |

Semuanya diinput **langsung di AGAVA** — memang begitu seharusnya.
