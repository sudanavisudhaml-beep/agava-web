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
 *
 * Jalankan SEBELUM `git push` dan `firebase deploy`.
 */
const fs = require("fs");
const path = require("path");

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
