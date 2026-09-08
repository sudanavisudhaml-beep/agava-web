/* AGAVA — penyelaras stempel versi.
 *
 * Nomor build AGAVA hidup di TIGA tempat yang harus selalu sama:
 *   · index.html   → const AGAVA_BUILD   (yang dilihat pengguna di pojok layar)
 *   · version.json → {"build": ...}      (yang ditanya aplikasi tiap beberapa menit)
 *   · sw.js        → const BUILD         (mengikat nama CACHE service worker)
 *
 * Kenapa ini bukan sekadar kerapian — pelajaran 26 Agu 2026:
 *   v247 dideploy dengan index.html saja. Akibatnya dua hal sekaligus:
 *     1. version.json tertinggal di 246, jadi SETIAP pengguna melihat pita
 *        "versi baru tersedia — terbaru v246" alias diajak TURUN versi.
 *     2. sw.js tertinggal, sehingga CACHE = 'agava-v246' tidak berubah nama.
 *        Service worker tidak membuang cache lama dan perangkat bisa terus
 *        menyajikan index.html versi kemarin dari cache. Deploy-nya "berhasil"
 *        di server tapi tidak mendarat di perangkat.
 *   Yang kedua jauh lebih berbahaya, dan diam-diam.
 *
 * Pakai:
 *   node cek-versi.js          → periksa saja; keluar dengan kode 1 bila beda
 *   node cek-versi.js --sync   → samakan version.json & sw.js mengikuti index.html
 *   node cek-versi.js --naik   → naikkan nomor build di index.html, lalu samakan
 *   node cek-versi.js --pasang → aktifkan hook pre-commit (git config core.hooksPath)
 *
 * PAKAI --naik, JANGAN menyunting index.html lewat PowerShell.
 * 26 Agu 2026, dua kali dalam satu hari: menaikkan nomor versi dengan
 *   $h = Get-Content -Raw index.html ; ... ; WriteAllText(...)
 * merusak SELURUH karakter non-ASCII berkas (20.000+ karakter). PowerShell 5.1
 * membaca UTF-8 tanpa BOM sebagai codepage ANSI, lalu menulisnya balik sebagai
 * UTF-8 — double-encoding. Em-dash jadi "â€”", emoji hancur. Node membaca dan
 * menulis UTF-8 apa adanya, jadi jalur ini aman.
 *
 * Tiga lapis penegak, supaya tidak ada yang bergantung pada ingatan:
 *   1. hooks/pre-commit  → commit DITOLAK bila tidak selaras (POSIX sh, tanpa Node)
 *   2. firebase.json     → "predeploy": ["node cek-versi.js"], deploy dibatalkan
 *   3. skrip ini         → dipanggil keduanya, dan bisa dijalankan sendiri
 *
 * Kenapa --pasang perlu: core.hooksPath adalah konfigurasi git LOKAL dan tidak
 * ikut ter-commit. Repo yang di-clone ulang akan kehilangan penegaknya tanpa
 * suara — jadi cara memasangnya ikut disimpan di dalam repo.
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const dir = __dirname;
const F = {
  index: path.join(dir, "index.html"),
  versi: path.join(dir, "version.json"),
  sw:    path.join(dir, "sw.js")
};

const baca = (p) => fs.readFileSync(p, "utf8");
const POLA = {
  index: /const AGAVA_BUILD="([^"]+)"/,
  versi: /"build"\s*:\s*"([^"]+)"/,
  sw:    /const BUILD\s*=\s*'([^']+)'/
};

function ambil(k) {
  const m = baca(F[k]).match(POLA[k]);
  return m ? m[1] : null;
}

if (process.argv.includes("--pasang")) {
  try {
    execFileSync("git", ["config", "core.hooksPath", "hooks"], { cwd: dir });
    const aktif = execFileSync("git", ["config", "--get", "core.hooksPath"], {
      cwd: dir, encoding: "utf8"
    }).trim();
    console.log(`✓ hook aktif — core.hooksPath = ${aktif}`);
    console.log("  Mulai sekarang commit dengan stempel tidak selaras akan DITOLAK.");
  } catch (e) {
    console.error("✖ gagal memasang hook: " + e.message);
    process.exit(2);
  }
  process.exit(0);
}

if (process.argv.includes("--naik")) {
  const kini = ambil("index");
  const m = String(kini || "").match(/^v(\d{4})\.(\d{2})\.(\d{2})-(\d+)$/);
  if (!m) { console.error("✖ bentuk AGAVA_BUILD tidak dikenali: " + kini); process.exit(2); }
  /* ── TANGGAL DIBANGUN ULANG SELURUHNYA (8 Sep 2026) ────────────────────────
     Versi lama menangkap "v2026.08." sebagai satu potongan yang DIPERTAHANKAN,
     lalu hanya menimpa harinya. Tahun dan bulan ikut terbawa dari stempel
     sebelumnya dan tidak pernah maju.

     Cacat ini tidur selama seluruh Agustus — setiap bump terjadi di bulan yang
     sama, jadi hasilnya kebetulan benar. Ia menggigit pada bump PERTAMA di
     bulan baru: 31 Agustus → 8 September menghasilkan "v2026.08.08", yaitu
     stempel yang MUNDUR 23 hari dari versi sebelumnya.

     Stempel yang mundur bukan cuma jelek dipandang: ia bahan bakar bug v247 —
     perangkat membandingkan versi dan menyimpulkan dirinya lebih baru daripada
     yang di server, lalu menyuruh orang "memperbarui" ke versi yang lebih lama.

     Sekarang tanggalnya dibangun ulang dari jam hari ini, bukan disalin.
     getMonth() berbasis nol — +1 wajib, dan itulah yang dulu tidak pernah
     terlihat karena bulannya memang tidak pernah dihitung. */
  const d = new Date();
  const tgl = d.getFullYear() + "." +
              String(d.getMonth() + 1).padStart(2, "0") + "." +
              String(d.getDate()).padStart(2, "0");
  const baru = "v" + tgl + "-" + (parseInt(m[4], 10) + 1);
  /* Pagar terakhir: stempel baru tidak boleh lebih kecil dari yang lama.
     Jam sistem bisa salah, dan satu stempel mundur menular ke semua perangkat. */
  const urut = (v) => { const p = String(v).replace(/^v/, "").split(/[.\-]/).map(Number);
                        return p[0]*1e10 + p[1]*1e8 + p[2]*1e6 + p[3]; };
  if (urut(baru) <= urut(kini)) {
    console.error("✖ stempel baru (" + baru + ") tidak lebih besar dari yang lama (" + kini + ").");
    console.error("  Periksa tanggal & jam sistem — stempel yang mundur membuat perangkat");
    console.error("  menyuruh penggunanya memperbarui ke versi yang lebih lama.");
    process.exit(2);
  }
  const isi = baca(F.index).replace(POLA.index, 'const AGAVA_BUILD="' + baru + '"');
  fs.writeFileSync(F.index, isi, "utf8");
  fs.writeFileSync(F.versi, JSON.stringify({ build: baru }) + "\n", "utf8");
  fs.writeFileSync(F.sw, baca(F.sw).replace(POLA.sw, "const BUILD = '" + baru + "'"), "utf8");
  console.log("✓ " + kini + "  →  " + baru);
  console.log("  ketiga berkas disamakan. Silakan commit, push, lalu deploy.");
  process.exit(0);
}

const sync = process.argv.includes("--sync");
const acuan = ambil("index");

if (!acuan) {
  console.error("✖ AGAVA_BUILD tidak ditemukan di index.html — pola berubah?");
  process.exit(2);
}

const kini = { index: acuan, versi: ambil("versi"), sw: ambil("sw") };
const beda = Object.keys(kini).filter((k) => kini[k] !== acuan);

for (const k of Object.keys(kini)) {
  const tanda = kini[k] === acuan ? "✓" : "✖";
  console.log(`${tanda} ${k.padEnd(6)} ${kini[k] || "(tidak terbaca)"}`);
}

if (!beda.length) {
  console.log(`\nSelaras di ${acuan}.`);
  process.exit(0);
}

if (!sync) {
  console.error(`\n✖ ${beda.length} berkas tertinggal dari index.html (${acuan}): ${beda.join(", ")}`);
  console.error("  Jalankan: node cek-versi.js --sync");
  console.error("  JANGAN deploy sebelum selaras — sw.js yang tertinggal membuat");
  console.error("  perangkat tetap menyajikan versi lama dari cache.");
  process.exit(1);
}

if (beda.includes("versi")) {
  fs.writeFileSync(F.versi, JSON.stringify({ build: acuan }) + "\n", "utf8");
  console.log(`\n→ version.json disamakan ke ${acuan}`);
}
if (beda.includes("sw")) {
  const isi = baca(F.sw).replace(POLA.sw, `const BUILD = '${acuan}'`);
  fs.writeFileSync(F.sw, isi, "utf8");
  console.log(`→ sw.js disamakan ke ${acuan}`);
}
console.log("\nSelaras. Silakan commit, push, lalu firebase deploy --only hosting.");
