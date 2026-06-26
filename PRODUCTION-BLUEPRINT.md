# AGAVA — Blueprint Produksi (Self-Service, Tanpa Tim IT)

Panduan membangun AGAVA produksi **sendiri** dengan tool Microsoft 365 yang sudah Anda miliki
(Teams, SharePoint, Power Automate, Copilot Studio). Semua low-code/no-code. Flow Anda yang
sudah ada tetap dipakai sebagai mesin di background — dokumen ini merangkainya jadi satu sistem
dengan **SharePoint List** sebagai sumber kebenaran dan web app sebagai "tempat mendarat".

---

## 0. Gambaran rangkaian

```
Karyawan (Teams)
   │  ketik keluhan: "AC ruangan saya panas lantai 12"
   ▼
Copilot Studio agent  ── kenali intensi → petakan ke Service_Name
   │
   ▼
Power Automate Flow (yang sudah Anda buat)
   │  • auto-assign PIC + Eksekutor (logika AI_Matching_Logic)
   │  • hitung target SLA
   │  • notif ke PIC via Teams
   ▼
SharePoint List "AGAVA_Tickets"  ◄── SUMBER KEBENARAN
   ▲
   │ baca
Web App (dashboard)  ── KPI, PIC, status penyelesaian
```

---

## 1. SharePoint List — sumber kebenaran tiket

Buat satu List bernama **`AGAVA_Tickets`** (Site GA Anda → New → List).
Kolom (semua bisa dibuat lewat UI, klik "Add column"):

| Kolom | Tipe | Catatan |
|---|---|---|
| `TicketID` | Single line | mis. `TKT-1043` (atau pakai ID bawaan) |
| `RequestText` | Multiple lines | teks asli dari karyawan |
| `ServiceID` | Single line | mis. `GA-MEC-001` (hasil klasifikasi Copilot) |
| `ServiceName` | Single line | mis. "AC Complaint Handling" |
| `Category` | Choice | ENGINEERING / HOUSEKEEPING / SECURITY / … |
| `Site` | Choice | Menara Astra / AMDI / ABC BSD |
| `PIC` | Person | owner yang memantau |
| `Executor` | Person atau Single line | eksekutor lapangan |
| `Status` | Choice | Baru / Assigned / In Progress / Selesai / SLA Breach |
| `Requester` | Person | karyawan pengirim |
| `SLATargetHours` | Number | dari Service Catalog |
| `CreatedAt` | Date & Time | otomatis |
| `ResolvedAt` | Date & Time | diisi saat selesai |

> **Tip:** upload `Master_Service_Catalog`, `Master_Team`, `Master GA Executor` sebagai 3 List
> referensi terpisah (mis. `Ref_ServiceCatalog`, `Ref_Team`, `Ref_Executor`). Flow membacanya
> untuk matching. Mengubah data tim cukup edit List — tidak perlu sentuh kode.

---

## 2. Copilot Studio — "telinga" AGAVA (intent recognition)

1. Buka **copilotstudio.microsoft.com** → Create → New agent → beri nama **AGAVA**.
2. **Knowledge:** tambahkan List `Ref_ServiceCatalog`. Kolom `User_Intent_Example` dan
   `Common_Problem_or_Request` jadi bahan agar Copilot mengenali maksud karyawan.
3. **Topic "Submit Tiket GA":**
   - Trigger: frasa seperti "lapor", "keluhan", "rusak", "minta tolong", atau biarkan generative.
   - Tanya balik bila kurang: *lokasi (gedung/lantai)*, *deskripsi*, *foto (opsional)*.
   - Gunakan Copilot untuk memetakan keluhan → `ServiceID` + `ServiceName` + `Category`
     (prompt: "Berdasarkan katalog, layanan mana yang paling cocok dengan keluhan ini?").
4. **Aksi akhir topic:** panggil **Power Automate Flow** (langkah 3), kirim: RequestText, ServiceID,
   ServiceName, Category, Site, Requester.
5. **Publish → Channels → Microsoft Teams.** Sekarang AGAVA hidup di Teams.

---

## 3. Power Automate Flow — auto-assign & monitor (mesin Anda)

Sambungkan Flow yang sudah ada (atau buat dari template "Instant cloud flow" dipicu Copilot).
Langkah inti:

1. **Trigger:** "When Copilot calls a flow" (input dari langkah 2).
2. **Get items** dari `Ref_Executor`, filter `Specialist_Areas` mengandung subkategori service →
   pilih eksekutor (mirror sheet AI_Matching_Logic: cocokkan area → site → ketersediaan shift).
3. **Get items** dari `Ref_Team`, filter `Service_Category` = Category & Site cocok → pilih **PIC**.
4. **Get item** dari `Ref_ServiceCatalog` untuk ambil `SLATargetHours`.
5. **Create item** di `AGAVA_Tickets` dengan Status = `Assigned`, isi PIC, Executor, SLA, CreatedAt.
6. **Post message in Teams** ke PIC + Eksekutor: "Tiket TKT-xxxx untuk Anda…".
7. **(Monitoring)** buat Flow terjadwal kedua: tiap 30 menit, cek tiket yang belum `Selesai`
   dan `CreatedAt + SLATargetHours < now` → set Status = `SLA Breach` + eskalasi ke supervisor.

PIC/eksekutor meng-update Status lewat List, Teams, atau adaptive card → dashboard ikut berubah.

---

## 4. Web App — "tempat mendarat" (3 opsi, semua bisa Anda sendiri)

| Opsi | Cara | Kapan dipilih |
|---|---|---|
| **A. Power BI** *(paling cepat, no-code)* | Power BI Desktop → Get Data → SharePoint Online List → bikin KPI + tabel → Publish → sematkan tab di Teams | Anda mau cepat, fokus pelaporan/grafik |
| **B. Power Apps** *(interaktif, low-code)* | Canvas app → data source `AGAVA_Tickets` → galeri tiket + form update status → tambahkan ke Teams | Anda mau orang juga *meng-update* tiket dari satu tempat |
| **C. HTML dashboard ini** *(custom)* | Host file ini, ganti seed data dengan baca SharePoint REST | Anda mau tampilan custom branding AGAVA |

### Menyambungkan HTML ini ke SharePoint (Opsi C)
1. Taruh `index.html`, `app.js`, `data.js` di Library SharePoint (atau sebagai web part "Embed").
2. Ganti seed di `data.js` dengan panggilan REST (berjalan dengan sesi login Anda — tanpa app IT):
   ```js
   // contoh: baca tiket dari SharePoint List
   const url = "https://<tenant>.sharepoint.com/sites/GA/_api/web/lists/getbytitle('AGAVA_Tickets')/items";
   const r = await fetch(url, { headers:{ "Accept":"application/json;odata=verbose" }, credentials:"include" });
   const data = (await r.json()).d.results;
   ```
3. Petakan field SharePoint → struktur tiket yang dipakai `app.js` (`id, text, svc, pic, exec, status…`).
4. Karena dibuka dari dalam SharePoint (domain sama, sudah login), tidak perlu setup auth khusus.

> **Rekomendasi:** mulai dari **Opsi A (Power BI)** untuk dashboard manajemen minggu ini, lalu
> kembangkan **Opsi C** sebagai portal AGAVA berbranding bila ingin tampil custom. Keduanya
> membaca List yang sama, jadi tidak ada data ganda.

---

## 5. Urutan pengerjaan yang disarankan

1. **Hari ini:** demokan prototype HTML ini ke stakeholder ("beginilah AGAVA mendarat").
2. **Minggu 1:** buat List `AGAVA_Tickets` + 3 List referensi (upload Excel Anda).
3. **Minggu 1–2:** sambungkan Flow → tulis ke List; uji auto-assign dengan beberapa tiket dummy.
4. **Minggu 2:** publish Copilot Studio ke Teams; uji end-to-end (karyawan ketik → tiket masuk List).
5. **Minggu 2–3:** Power BI dashboard dari List → sematkan di Teams. AGAVA live.
6. **Lanjutan:** Flow monitoring SLA + branding HTML portal (Opsi C).

Setiap langkah bisa Anda kerjakan sendiri — saya bantu detailnya kapan pun Anda mulai.
