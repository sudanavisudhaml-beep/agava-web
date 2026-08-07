/* Pengurai Database Perizinan → data/perizinan.json
   Dijalankan DI PERAMBAN (xlsx.full.min.js sudah termuat di AGAVA):
     fetch("data/perizinan-sumber.xlsx") → agavaParseIzin(arrayBuffer)
   Sudah divalidasi 6 Agu 2026: 66 izin (AMDI 31 · BSD 20 · Bandung 15).

   PENTING — tiap sheet punya TATA KOLOM BERBEDA:
   · "Izin AI - Sunter" punya kolom AREA, jadi semuanya bergeser satu ke kanan
   · "Izin BSD" & "Izin Bandung" TIDAK punya AREA
   Salah memetakan ini membuat kolom Periode terisi angka Rupiah dan seluruh
   tanggal jatuh tempo hilang — itulah yang terjadi pada percobaan pertama. */
function agavaParseIzin(ab){
  var BLN={januari:1,februari:2,maret:3,april:4,mei:5,juni:6,juli:7,
           agustus:8,september:9,oktober:10,november:11,desember:12};
  function due(s){                    // "Mei 2026" / "10 Juli 2026" → ISO
    s=String(s||"").replace(/\s+/g," ").trim();
    if(!s||/selamanya/i.test(s)) return null;
    var m=s.match(/(\d{1,2})?\s*([A-Za-z]+)\s*(\d{4})/); if(!m) return null;
    var b=BLN[String(m[2]).toLowerCase()]; if(!b) return null;
    /* Tanpa tanggal → AWAL bulan (keputusan Sudana, 6 Agu 2026). "Mei 2026"
       berarti izinnya harus sudah beres saat Mei dimulai, bukan saat Mei habis;
       memakai akhir bulan membuat pengingatnya telat sebulan. */
    var y=+m[3], d=m[1]?+m[1]:1;
    return y+"-"+("0"+b).slice(-2)+"-"+("0"+d).slice(-2);
  }
  var rp=function(s){ return Math.round(parseFloat(String(s||"").replace(/[^0-9.]/g,""))||0); };
  var T =function(s){ return String(s||"").replace(/\s+/g," ").trim(); };
  var MAP={ "Izin AI - Sunter":{site:"AMDI",   nama:2,no:3,berlaku:4,a:5,b:9,ket:13},
            "Izin BSD":        {site:"BSD",    nama:1,no:2,berlaku:3,a:4,b:9,ket:13},
            "Izin Bandung":    {site:"Bandung",nama:1,no:2,berlaku:3,a:4,b:9,ket:13} };
  var wb=XLSX.read(new Uint8Array(ab),{type:"array"}), out=[];
  Object.keys(MAP).forEach(function(nm){
    var M=MAP[nm], sh=wb.Sheets[nm]; if(!sh) return;
    XLSX.utils.sheet_to_json(sh,{header:1,defval:"",raw:false}).forEach(function(r){
      if(!/^\d+$/.test(T(r[0]))) return;              // hanya baris bernomor
      var nama=T(r[M.nama]); if(!nama) return;
      out.push({ s:M.site, n:nama, i:T(r[M.no]), b:T(r[M.berlaku]),
        y25:{t:T(r[M.a]),  u:T(r[M.a+1]), d:due(r[M.a+1]), p:T(r[M.a+2]), h:rp(r[M.a+3])},
        y26:{t:T(r[M.b]),  u:T(r[M.b+1]), d:due(r[M.b+1]), p:T(r[M.b+2]), h:rp(r[M.b+3])},
        k:T(r[M.ket]) });
    });
  });
  return out;
}
