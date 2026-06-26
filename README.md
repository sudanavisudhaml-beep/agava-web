# AGAVA — Astra General Affairs Virtual Assistant

Web app (single-file) untuk operasional GA Dept Astra International: Overview, Procurement (SO → UPR → SPK → BAST → Payment), Service Desk (tiket), Vendor Management (kontrak + SLA), Payment Tracker (4-status + aging vs SLA), HSE & Sustainability (perizinan), Energy/ESG, Reminder.

## Cara membuka
Buka **`index.html`** di **Chrome / Edge** (desktop). `index.html` adalah aplikasi lengkapnya (self-contained).

- **Live Data** (jadwal ruangan) butuh `xlsx.full.min.js` (sudah ada di repo) dan dibuka via **http** (mis. server lokal), bukan `file://`, agar File System Access API & koneksi flow tidak diblok.
- Jalankan server lokal cepat: `npx -y serve -l 8080 .` lalu buka `http://localhost:8080/`.

## Struktur
- `index.html` — aplikasi AGAVA (canonical, edit di sini).
- `xlsx.full.min.js` — SheetJS (baca .xlsx untuk Live Data).
- `assets/` — logo & ikon.
- `index-prototype.html` — prototipe lama (arsip).
- `PRODUCTION-BLUEPRINT.md` — catatan rancangan.

## Status
Mockup/blueprint interaktif (data client-side). Backend produksi = Power Apps + SharePoint + Power Automate (lihat design docs).

## Login (demo)
Halaman login menampilkan daftar akun demo — klik untuk masuk sebagai peran tertentu (Administrator, Chief, Dept Head, PIC Budget, Staff Procurement, dll).
