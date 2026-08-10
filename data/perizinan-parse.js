/* Pengurai Database Perizinan PT Astra International Tbk → PERMITS (modul HSE)
   Dijalankan DI PERAMBAN (xlsx.full.min.js sudah termuat di AGAVA):
     fetch("data/perizinan-sumber.xlsx") → agavaParseIzin(arrayBuffer)

   ══ SHEET YANG DIPAKAI: "Rekap" — BUKAN sheet per lokasi ══════════════════════
   Berkas ini punya 4 sheet: Rekap, "Izin AI - Sunter", "Izin BSD", "Izin Bandung".
   Percobaan pertama (6 Agu 2026) membaca tiga sheet per lokasi dan hasilnya
   MENYESATKAN. Sheet "Rekap" adalah tabel induk yang diperbarui, tiga sheet
   lainnya tertinggal. Bedanya bukan kosmetik:

   · Rekap memuat 80 izin, sheet per lokasi cuma 66. Yang hilang: seluruh
     Cibitung (3), Cibinong (1), Ex Pako (2), Karawang (1), Masjid (1), dan
     6 izin BSD baru (SLO IPAL STP, IUPTLS Genset, 4 SLO Genset).
   · Tanggal Uji Kembali 2025 di Rekap sudah dimutakhirkan. Contoh: lift ABC BSD
     tertulis "November 2025" di sheet per lokasi, tapi "25 September 2026" di
     Rekap; reklame Astra Biz Center tertulis "Desember 2020", di Rekap
     "Oktober 2026". Membaca sheet lama membuat 28 izin tampak LEWAT TEMPO
     padahal sebenarnya aman — persis yang dilaporkan Sudana 6 Agu 2026:
     "tidak ada Izin yang terlewat".
   · Rekap punya kolom yang tidak ada di sheet lain: STATUS per tahun
     (Done / On Progress / SO Pembuatan Izin Baru) dan rencana SO.

   Kalau sheet-nya berubah bentuk, perbaiki PETA di bawah — jangan menebak.

   ══ TATA KOLOM SHEET "Rekap" (0-indeks) ══════════════════════════════════════
     0 No · 1 AREA · 2 NAMA · 3 NO IZIN · 4 BERLAKU
     2025:  5 Ijin Terbit · 6 Status · 7 Uji Kembali · 8 Periode · 9 Harga
     2026: 10 SO · 11 Ijin Terbit · 12 Status · 13 Uji Kembali · 14 Periode · 15 Harga
     16 Status Aktif/Kedaluarsa · 17 Keterangan

   ══ ATURAN TURUNAN (keputusan Sudana, 6 Agu 2026) ════════════════════════════
   · Uji Kembali yang cuma bertuliskan bulan ("Mei 2026") = AWAL bulan (1 Mei).
     Izin harus sudah beres saat bulan itu dimulai, dan pengingatnya menyala
     2 bulan sebelumnya.
   · Jatuh tempo memakai kolom 2026; bila kolom itu kosong dipakai kolom 2025
     sebagai jatuh tempo terakhir yang diketahui (ditandai thn:2025). */
function agavaParseIzin(ab){
  var BLN={januari:1,februari:2,maret:3,april:4,mei:5,juni:6,juli:7,
           agustus:8,september:9,oktober:10,november:11,desember:12};
  function due(s){                    // "Mei 2026" / "2 Oktober 2026" → ISO
    s=String(s||"").replace(/\s+/g," ").trim();
    if(!s||/selamanya|perundangan/i.test(s)) return null;
    var m=s.match(/(\d{1,2})?\s*([A-Za-z]+)\s*(\d{4})/); if(!m) return null;
    var b=BLN[String(m[2]).toLowerCase()]; if(!b) return null;
    var y=+m[3], d=m[1]?+m[1]:1;       // tanpa tanggal → AWAL bulan
    return y+"-"+("0"+b).slice(-2)+"-"+("0"+d).slice(-2);
  }
  var rp=function(s){ return Math.round(parseFloat(String(s||"").replace(/[^0-9.]/g,""))||0); };
  var T =function(s){ return String(s||"").replace(/\s+/g," ").trim(); };
  /* "BDG" di sheet = Bandung. Sisanya ditulis apa adanya. */
  var AREA={BDG:"Bandung"};
  var C={area:1,nama:2,no:3,berlaku:4,
         t25:5,st25:6,uji25:7,p25:8,h25:9,
         so:10,t26:11,st26:12,uji26:13,p26:14,h26:15,
         aktif:16,ket:17};
  var wb=XLSX.read(new Uint8Array(ab),{type:"array"}), sh=wb.Sheets["Rekap"], out=[];
  if(!sh) return out;
  XLSX.utils.sheet_to_json(sh,{header:1,defval:"",raw:false}).forEach(function(r){
    if(!/^\d+$/.test(T(r[0]))) return;                 // hanya baris bernomor
    var nama=T(r[C.nama]); if(!nama) return;           // baris nomor kosong di ekor tabel
    var uji=T(r[C.uji26])||T(r[C.uji25]);
    var d26=due(r[C.uji26]), d25=due(r[C.uji25]);
    var d=d26||d25;
    var area=T(r[C.area]);
    out.push({
      s: AREA[area]||area||"(tanpa area)",
      n: nama,
      i: T(r[C.no]),
      b: T(r[C.berlaku]),
      t: T(r[C.t26])||T(r[C.t25]),                     // pengurusan terakhir
      u: uji,
      d: d,
      thn: d26?2026:(d25?2025:0),
      p: T(r[C.p26])||T(r[C.p25]),
      h: rp(r[C.h26])||rp(r[C.h25]),
      st: T(r[C.st26])||T(r[C.st25]),                  // Done / On Progress / SO Pembuatan Izin Baru
      so: T(r[C.so]),                                  // rencana SO perpanjangan
      k: T(r[C.ket])
    });
  });
  return out;
}
