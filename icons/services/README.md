# Ikon Layanan AGAVA

Set ikon halaman **Layanan GA**. Digambar sendiri — tidak memakai Lucide, Feather, Material, atau Font Awesome.

Gaya: **glif pejal dua warna (duotone solid)**. Bukan ikon garis, bukan ilustrasi, bukan emoji. Menggantikan emoji 🎫 🏢 🚗 ⏱️ 🛒 yang dipakai sampai v167.

## Berkas

| Berkas | Layanan | Massa navy | Bagian biru |
|---|---|---|---|
| `complaint-handling.svg` | Complaint Handling | Balon pesan depan berekor kiri-bawah; tanda seru dilubangi | Balon pesan kedua di belakang kanan-atas |
| `room-reservation.svg` | Room Reservation | Badan kalender + dua pasak; satu slot tanggal & dua baris dilubangi | Pita kepala kalender |
| `transport-booking.svg` | Transport Booking | Siluet kendaraan tampak samping; kaca depan dilubangi | Dua roda lingkaran penuh |
| `overtime.svg` | Overtime | Piringan jam pejal; jarum dilubangi | Lencana tambah kanan-bawah |
| `supply-order.svg` | Create Supply Order | Peti bertutup; celah tutup dilubangi | Lencana tambah kanan-bawah |

## Palet — hanya empat warna di seluruh set

| Warna | Peran |
|---|---|
| `#0B2447` navy | Massa utama ikon |
| `#2563EB` electric blue | **Tepat satu bagian** per ikon — bagian yang menjelaskan aksinya |
| `#EEF4FF` | Warna **lubang**. Nilainya sama persis dengan warna ubin, itulah yang membuatnya terbaca sebagai lubang dan bukan sebagai bercak |
| `#FFFFFF` | Hanya untuk tanda tambah di dalam lencana |

> ⚠ **Warna lubang terikat pada warna ubin.** Kalau ubin diberi warna lain, seluruh lubang di kelima ikon harus ikut berubah — kalau tidak, lubangnya berhenti terbaca sebagai lubang. Inilah sebabnya ubin Layanan GA disamakan menjadi `#EEF4FF` pada v168; sebelumnya tiap layanan punya ubin berwarna sendiri (hijau, amber, ungu).

## Aturan ubin

- Ubin **44 × 44 px**, `border-radius: 12px`, latar `#EEF4FF`
- Glif **26 × 26 px** di tengah ubin
- Lembar spesifikasi ukuran besar: glif 34 px di ubin 56 px radius 14
- Ikon **tidak pernah** dipakai tanpa ubin, tidak pernah di atas foto, tidak pernah diwarnai ulang di luar empat warna di atas

## Geometri

- Kanvas `viewBox="0 0 24 24"`, semua bentuk di dalam kotak aman **1.6 → 22.4** pada kedua sumbu
- Radius `rx` 1–2.6 pada persegi; hanya roda dan lencana yang lingkaran penuh
- Detail minimum 2.5 unit; garis lubang `stroke-width="2.1"` `stroke-linecap="square"`
- `opacity=".55"` hanya untuk bidang lubang besar yang perlu terasa lebih tenang (celah tutup peti)
- Tanpa `class`, `style`, `transform`, atau `<g>` yang tidak perlu

## Menambah layanan baru

Ikuti urutan yang sama: **tentukan massa navy dulu → pilih satu bagian biru → baru lubangi detail dalamnya.** Pola lencana tambah (lingkaran biru `r≈4.6` kanan-bawah berisi tanda tambah putih) **hanya** untuk aksi yang berarti membuat atau memperpanjang sesuatu.

## Di mana ikon ini hidup

Berkas SVG di folder ini adalah **sumber desain**. Yang dipakai aplikasi adalah **salinan sebaris (inline)** di dalam `index.html`, pada konstanta `M_LAYANAN` dan tombol Create Supply Order.

Alasannya: AGAVA satu berkas HTML dan bekerja luring lewat service worker. Memuat lima SVG lewat `<img src>` berarti lima permintaan jaringan tambahan yang harus ikut didaftarkan di `sw.js`, dan ikonnya akan berkedip kosong sesaat pada muat pertama.

**Kalau berkas di sini diubah, salinan sebaris di `index.html` harus ikut diubah.** Keduanya tidak tersambung otomatis.

## Uji terima

Buka `preview.html` — menampilkan kelima ikon pada 16 / 26 / 34 px di atas ubin, plus versi grayscale, sehingga seluruh uji terima terlihat sekali jalan.
