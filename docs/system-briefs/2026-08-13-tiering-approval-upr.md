# System Brief — Tiering Approval UPR

**Klasifikasi:** INTERNAL · **Tier analisis:** 2 (§3.3 kriteria 2 — mengubah matriks kewenangan)
**Tanggal:** 13 Agustus 2026 · **Modul:** AGAVA / Procurement / UPR

---

## Boundary

**In-scope**
Penentuan *siapa saja* yang harus menyetujui satu UPR, berdasarkan nilai yang akan dikomitkan.
Pembekuan rantai persetujuan pada dokumen saat diajukan. Pembatasan metode Penunjukan Langsung.

**Out-of-scope**
Rantai approval SO (Section → Budget → Proc → Dept) — dokumen berbeda, wewenang berbeda.
Nilai final hasil negosiasi belum punya tempat input tersendiri (menunggu pekerjaan SPH 1 / SPH 2 / harga final). Tiering sudah membaca kolomnya, jadi begitu kolom itu terisi, wewenangnya ikut menyesuaikan tanpa perubahan kode.

**Aktor**
Staff Procurement (pengaju) · PIC Procurement · GA Dept Head · Division Head · Chief.

**Terdampak tapi tidak punya suara**
Pemohon SO di lapangan — merekalah yang menanggung waktu tunggu rantai yang terlalu panjang.
Rekanan — penawarannya menganggur selama UPR bergerak, dan harga penawaran punya masa berlaku.

---

## Iceberg

**Event** — UPR bernilai kecil menunggu tanda tangan Chief, sama seperti UPR bernilai besar.

**Pattern** — berlaku untuk *setiap* UPR tanpa kecuali sejak modul ini hidup. Bukan insiden, tapi perilaku baku sistem.

**Structure** — `UPR_GATES` ditulis sebagai satu larik tetap berisi empat gerbang, dan seluruh fungsi (`uprGate`, `uprSelesai`, `uprDitolak`, blok tanda tangan dokumen) membacanya langsung. Tidak ada satu pun tempat di mana nilai UPR ikut menentukan rantainya. Wewenang finansial — yang di dunia nyata berjenjang menurut nominal — dikodekan sebagai konstanta tunggal.

**Mental Model** — "lebih banyak yang menyetujui = lebih aman". Asumsi ini keliru dalam dua arah sekaligus: ia membebani pejabat tertinggi dengan keputusan receh sehingga perhatiannya terhadap yang besar menipis, dan ia membuat approval berubah menjadi ritual — orang menandatangani karena antreannya panjang, bukan karena ia memeriksa.

---

## Loop utama

**R1 — Rantai panjang → approval jadi ritual (reinforcing, merusak)**
Rantai seragam → volume approval di pejabat atas tinggi → waktu baca per dokumen turun → persetujuan makin otomatis → kepercayaan pada kontrol menurun → ditambal dengan menambah lapisan approval → kembali memperpanjang rantai.

**B1 — Kontrol berjenjang (balancing, yang kita inginkan)**
Nilai naik → jumlah pemeriksa naik → ketelitian naik → risiko nilai besar tertahan.
Loop ini **belum pernah aktif** karena jumlah pemeriksa tidak pernah menjadi fungsi dari nilai.

**Delay** — inilah yang paling mahal dan paling tidak terlihat. Jeda antara "UPR diajukan" dan "SPK terbit" ditanggung oleh pemohon di lapangan, sementara yang merasakan beban rantai adalah pejabat penyetuju. Dua pihak yang berbeda; yang menanggung biaya tidak berada di ruangan saat rantai dirancang. Masa berlaku harga penawaran rekanan ikut termakan delay ini.

---

## Stock & Flow

**Stock yang menumpuk** — UPR menunggu tanda tangan di inbox Division Head dan Chief.
**Flow masuk** — seluruh UPR, tanpa penyaringan nilai.
**Flow keluar** — dibatasi ketersediaan waktu dua orang pejabat.

Salah sasaran yang harus dihindari: mempercepat *flow* (mengejar approver, menambah pengingat) padahal masalahnya ada di **komposisi flow masuk** — dokumen yang secara wewenang tidak perlu sampai ke sana. Menambah pengingat pada rantai yang salah hanya mempercepat ritual.

---

## Leverage point yang dipilih

**Level: aturan sistem** (Meadows — tinggi), diikuti **aliran informasi**.

Yang diubah bukan parameter dan bukan tampilan, melainkan *aturan siapa yang berwenang memutuskan apa*. Ambang nominalnya sendiri diletakkan sebagai **data** (`UPR_AMBANG`), bukan percabangan `if` — sehingga perubahan SK berikutnya, atau BU lain dengan SK berbeda, cukup mengubah data, tidak menyentuh logika (§5 Config over code).

**Kenapa tidak berhenti di level bawah:**
- *Parameter* (menambah pengingat / SLA per gerbang) — mempercepat rantai yang secara wewenang memang tidak seharusnya ada. Ini persis Fixes that Fail.
- *Struktur fisik* (memindahkan tombol, meringkas tampilan) — tidak menyentuh siapa yang berwenang.

Intervensi aliran informasi yang ikut dibawa: rantai yang berlaku **dicetak di dokumen UPR** dan ditampilkan saat pengajuan, jadi pengaju tahu di muka berapa tanda tangan yang ia butuhkan.

---

## Archetype risk

**Shifting the Burden — risiko terbesar, dan disebut terus terang.**
Bahayanya: pemecahan satu kebutuhan besar menjadi beberapa UPR kecil agar cukup berhenti di Dept Head. Tiering *menciptakan* insentif itu; sebelumnya tidak ada gunanya memecah.
Mitigasi yang dipasang sekarang: nilai penentu wewenang dan rantai yang berlaku ditulis permanen di dokumen dan di jejak audit, sehingga pemecahan terbaca sebagai pola.
Mitigasi yang **belum** dipasang dan dicatat sebagai risiko terbuka: deteksi otomatis beberapa UPR sejenis, lokasi sama, rentang waktu berdekatan, masing-masing tepat di bawah ambang. Ini pekerjaan tersendiri dan tidak boleh diklaim sudah tertangani.

**Fixes that Fail** — menurunkan jumlah gerbang menurunkan kontrol bila ambangnya salah. Karena itu ambang harus dikonfirmasi terhadap teks SK, bukan diasumsikan (lihat Asumsi Terbuka).

**Tragedy of the Commons** — waktu pejabat penyetuju adalah sumber daya bersama tanpa aturan alokasi. Tiering adalah aturan alokasinya.

---

## Impact metric

| | |
|---|---|
| **Metrik utama** | Waktu siklus UPR diajukan → disetujui penuh, dipisah per pita nilai |
| **Baseline** | Diambil dari `s.upr.ajukanAt` dan `s.upr.ts[gerbang]` pada UPR yang sudah tuntas sebelum 13 Agu 2026 — data sudah ada, tidak perlu instrumentasi baru |
| **Metrik pendamping** | Jumlah gerbang per UPR (rata-rata) · jumlah UPR yang mencapai Chief per bulan |
| **Cara ukur** | Dari SO/UPR yang tersimpan; tidak ada pencatatan tambahan yang perlu dibangun |
| **Arah yang diharapkan** | Waktu siklus pita terendah turun · jumlah dokumen yang mencapai Chief turun · waktu siklus pita tertinggi **tidak** ikut turun (kalau ikut turun tajam, itu tanda pemeriksaan ikut mengendur — sinyal bahaya, bukan keberhasilan) |

---

## Second-order effects

**1. Pemecahan UPR untuk menghindari ambang.**
Deteksi dini: pantau distribusi nilai UPR. Penumpukan tepat di bawah Rp10 juta dan Rp100 juta adalah tanda paling awal dan paling mudah dibaca — jauh sebelum ada yang melapor.

**2. Division Head dan Chief kehilangan gambaran menyeluruh.**
Dengan berkurangnya dokumen yang lewat, keduanya kehilangan pandangan atas pengadaan bernilai kecil yang jumlahnya banyak — padahal totalnya bisa besar.
Deteksi dini: ini bukan sekadar risiko yang dipantau, melainkan konsekuensi yang pasti terjadi. Kompensasinya harus berupa ringkasan berkala pengadaan di bawah ambang. Sampai ringkasan itu ada, ini **utang yang tercatat**, bukan masalah yang sudah selesai.

**3. Perubahan wewenang secara surut (dicegah dengan desain).**
Bila ambang berubah sementara ada UPR sedang berjalan, dokumen bisa berpindah rantai di tengah jalan — dan yang lebih buruk, UPR yang sudah lewat bisa terbaca "selesai" tanpa pernah melewati langkah penuntasannya.
Dicegah dengan **membekukan rantai pada dokumen saat diajukan** (`s.upr.rantai`). Dokumen diperintah oleh aturan yang berlaku saat ia diajukan — sama seperti berkas persetujuan di dunia nyata. UPR lama yang tidak punya kolom ini tetap memakai rantai penuh empat gerbang, jadi tidak ada satu pun dokumen berjalan yang berubah perilakunya saat versi ini naik.

---

## Asumsi Terbuka — wajib dikonfirmasi ke teks SK

Ketiganya sudah **dikodekan sebagai data di satu tempat** (`UPR_AMBANG`), jadi koreksi apa pun berbiaya satu baris.

1. **Batas pita bersifat inklusif ke bawah** — nilai tepat Rp10.000.000 masuk pita terendah (cukup Dept Head), tepat Rp100.000.000 masuk pita menengah. Mengikuti lazimnya rumusan "s.d." pada SK.
2. **PIC Procurement selalu ikut di semua pita** — perannya verifikasi kelengkapan dokumen, bukan wewenang finansial, jadi tidak ikut disaring nilai.
3. **Nilai penentu wewenang = nilai final hasil negosiasi bila ada, kalau tidak ada memakai nilai penawaran.** Yang mengikat adalah yang akan dikomitkan.

---

## Rollback

Satu versi mundur. Tidak ada perubahan bentuk data yang merusak: kolom `s.upr.rantai` bersifat tambahan dan diabaikan oleh versi lama, yang akan kembali membaca keempat gerbang seperti sebelumnya.
