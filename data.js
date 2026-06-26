// ============================================================
// AGAVA seed data — diturunkan dari Master Excel Anda yang asli
// (Service Catalog, Master Team, Master GA Executor)
// Di produksi, data ini diganti pembacaan dari SharePoint List.
// ============================================================

// Layanan + kata kunci intensi (dari kolom User_Intent_Example & Common_Problem_or_Request)
const SERVICES = [
  { id:"GA-MEC-001", name:"AC Complaint Handling",        cat:"ENGINEERING",  sub:"HVAC",                 sla:4,  kw:["ac","panas","dingin","airflow","bocor ac","ac mati","ac berisik","suhu"] },
  { id:"GA-MEC-002", name:"Electrical Complaint Handling", cat:"ENGINEERING",  sub:"Electrical",           sla:4,  kw:["lampu mati","stop kontak","outlet","kabel","hdmi","listrik kecil","colokan"] },
  { id:"GA-MEC-003", name:"Power Outage Handling",         cat:"ENGINEERING",  sub:"Power System",         sla:2,  kw:["listrik padam","padam","berkedip","panel","supply listrik","mati lampu total"] },
  { id:"GA-MEC-004", name:"Lighting Request",              cat:"ENGINEERING",  sub:"Lighting",             sla:8,  kw:["lampu redup","ganti lampu","tambah lampu","lampu kedip"] },
  { id:"GA-MEC-005", name:"Power Outlet & Socket Repair",  cat:"ENGINEERING",  sub:"Electrical",           sla:6,  kw:["stop kontak rusak","colokan longgar","outlet panas","tidak ada arus"] },
  { id:"GA-MEC-006", name:"TV & Audio Visual Support",     cat:"ENGINEERING",  sub:"Audio Visual",         sla:4,  kw:["tv","hdmi","display","mic","audio","proyektor","connect"] },
  { id:"GA-MEC-007", name:"Utility Monitoring Support",    cat:"ENGINEERING",  sub:"Utility",              sla:24, kw:["data listrik","data air","konsumsi energi","anomali"] },
  { id:"GA-MEC-008", name:"Water Supply Complaint",        cat:"ENGINEERING",  sub:"Plumbing / Water",     sla:4,  kw:["air mati","air kecil","air kotor","tekanan air","air tidak mengalir"] },
  { id:"GA-MEC-009", name:"Pump & Plumbing System Issue",  cat:"ENGINEERING",  sub:"Plumbing System",      sla:4,  kw:["pipa bocor","pompa","valve","floor drain","mampet","bocor ceiling"] },
  { id:"GA-MEC-010", name:"Elevator Complaint Handling",   cat:"ENGINEERING",  sub:"Elevator",             sla:2,  kw:["lift","lift error","lift lambat","lift trapped","elevator"] },
  { id:"GA-HSK-001", name:"Cleaning Request",              cat:"HOUSEKEEPING", sub:"Cleaning",             sla:2,  kw:["kotor","meja kotor","lantai kotor","pantry berantakan","bersihkan"] },
  { id:"GA-HSK-002", name:"Toilet Complaint Handling",     cat:"HOUSEKEEPING", sub:"Toilet / Sanitary",    sla:2,  kw:["toilet bau","toilet kotor","tissue habis","sabun habis","flush rusak"] },
  { id:"GA-HSK-003", name:"Pest Control Request",          cat:"HOUSEKEEPING", sub:"Pest Control",         sla:6,  kw:["kecoa","semut","tikus","nyamuk","lalat","serangga"] },
];

// PIC / owner per kategori (dari Master_Team) — yang memantau & escalation
const TEAM = [
  { name:"Sudana Visudha",               cat:"GENERAL INQUIRY", role:"Tier 3 Section Head", site:"All Sites" },
  { name:"Alma Tasya Fiandara",          cat:"GENERAL INQUIRY", role:"Tier 2 Supervisor",   site:"All Sites" },
  { name:"Sunaryo",                      cat:"ENGINEERING",     role:"Tier 2 Supervisor",   site:"AMDI" },
  { name:"Irfan Fadila",                 cat:"ENGINEERING",     role:"Tier 1 Executor",     site:"AMDI" },
  { name:"Sandya Syahboeding",           cat:"ENGINEERING",     role:"Tier 1 Executor",     site:"Menara Astra" },
  { name:"Rachmat S",                    cat:"ENGINEERING",     role:"Tier 2 Supervisor",   site:"ABC BSD" },
];

// Eksekutor lapangan (dari Master_Executor) dengan area spesialisasi
const EXECUTORS = [
  { id:"EX-001", name:"Naryo Sutarno",   job:"Teknisi Elektrikal Senior",  areas:["electrical","power system","lighting"] },
  { id:"EX-002", name:"Budi Hartono",    job:"Teknisi HVAC",               areas:["hvac"] },
  { id:"EX-003", name:"Andi Wijaya",     job:"AC Technician",              areas:["hvac"] },
  { id:"EX-004", name:"Eko Prasetyo",    job:"Teknisi Plumbing",           areas:["plumbing","plumbing system","plumbing / water"] },
  { id:"EX-005", name:"Hadi Susanto",    job:"AV Technician",              areas:["audio visual"] },
  { id:"EX-006", name:"Siti Nurhayati",  job:"HK Officer",                 areas:["housekeeping","cleaning"] },
  { id:"EX-007", name:"Wati Susilawati", job:"HK Officer",                 areas:["housekeeping","cleaning","toilet / sanitary"] },
  { id:"EX-008", name:"Yono Suyanto",    job:"Pest Control Specialist",    areas:["pest control"] },
  { id:"EX-019", name:"Bambang Sutopo",  job:"Teknisi ME AMDI",            areas:["electrical","hvac","plumbing","utility","elevator","power system"] },
];

// Tiket awal (mensimulasikan yang sudah ditulis Flow ke SharePoint List)
const SEED_TICKETS = [
  { id:"TKT-1042", text:"AC ruang meeting lantai 12 tidak dingin sejak pagi", svc:"GA-MEC-001", site:"Menara Astra", pic:"Sandya Syahboeding", exec:"Budi Hartono",  status:"In Progress", by:"Dewi (Finance)",   hoursAgo:3 },
  { id:"TKT-1041", text:"Lampu koridor lantai 8 mati semua",                  svc:"GA-MEC-002", site:"Menara Astra", pic:"Sandya Syahboeding", exec:"Naryo Sutarno", status:"In Progress", by:"Rian (IT)",        hoursAgo:5 },
  { id:"TKT-1040", text:"Toilet pria lantai 3 bau dan tissue habis",          svc:"GA-HSK-002", site:"Menara Astra", pic:"Sudana Visudha",     exec:"Wati Susilawati",status:"Selesai",     by:"Andi (HR)",        hoursAgo:7 },
  { id:"TKT-1039", text:"Ada kecoa di pantry lantai 15",                      svc:"GA-HSK-003", site:"Menara Astra", pic:"Sudana Visudha",     exec:"Yono Suyanto",  status:"Assigned",    by:"Maya (Legal)",     hoursAgo:1 },
  { id:"TKT-1038", text:"Listrik padam di area workstation lantai 20",        svc:"GA-MEC-003", site:"AMDI",         pic:"Sunaryo",            exec:"Bambang Sutopo",status:"Selesai",     by:"Joko (Procurement)",hoursAgo:9 },
  { id:"TKT-1037", text:"Pipa bocor di ceiling ruang arsip",                  svc:"GA-MEC-009", site:"AMDI",         pic:"Sunaryo",            exec:"Eko Prasetyo",  status:"In Progress", by:"Sari (GA)",        hoursAgo:4 },
  { id:"TKT-1036", text:"TV ruang rapat tidak bisa connect HDMI",             svc:"GA-MEC-006", site:"Menara Astra", pic:"Sandya Syahboeding", exec:"Hadi Susanto",  status:"Assigned",    by:"Budi (Sales)",     hoursAgo:2 },
  { id:"TKT-1035", text:"Lift nomor 2 lambat dan suara abnormal",             svc:"GA-MEC-010", site:"AMDI",         pic:"Sunaryo",            exec:"Bambang Sutopo",status:"SLA Breach",  by:"Lina (Ops)",       hoursAgo:6 },
];

// ============================================================
// Data CONTOH untuk modul lain (placeholder presentasi)
// Nanti diganti dari SharePoint List masing-masing modul.
// ============================================================
const MODULES = {
  building: {
    title:"Building Management", icon:"02_Building.png",
    desc:"Pengelolaan gedung, kediaman, dan program maintenance preventif lintas site Astra.",
    pill:"4 properti aktif",
    kpis:[["4","Properti dikelola"],["18","Aset maintenance"],["92%","Kepatuhan jadwal PM"],["3","PM jatuh tempo minggu ini"]],
    rows:[
      { main:"Menara Astra", sub:"Jakarta · 56 lantai · PM HVAC & Lift", pg:88 },
      { main:"AMDI", sub:"Sunter · gedung produksi & kantor", pg:74 },
      { main:"ABC BSD", sub:"BSD City · kantor regional", pg:95 },
      { main:"Kediaman Penthouse", sub:"Program maintenance khusus", pg:61 },
    ]
  },
  project: {
    title:"GA Project", icon:"03_Project.png",
    desc:"Monitoring proyek General Affair: renovasi, relokasi, fit-out, dan inisiatif fasilitas.",
    pill:"5 proyek berjalan",
    kpis:[["5","Proyek aktif"],["2","On track"],["2","Perlu perhatian"],["1","Selesai bulan ini"]],
    rows:[
      { main:"Renovasi Pantry Lt.15 Menara Astra", sub:"Target: 30 Jun · Vendor: PT Cipta Ruang", pg:70 },
      { main:"Relokasi tim Finance ke Lt.9", sub:"Target: 12 Jul · Fase: packing", pg:45 },
      { main:"Fit-out ruang meeting AMDI", sub:"Target: 5 Jul · Fase: instalasi AV", pg:80 },
      { main:"Upgrade signage ABC BSD", sub:"Target: 20 Jul · Fase: desain", pg:25 },
    ]
  },
  procurement: {
    title:"Procurement", icon:"05_Procurement.png",
    desc:"Pengadaan barang/jasa GA. Terhubung Flow 5: tiket yang butuh PO otomatis diteruskan ke Procurement.",
    pill:"Flow 5 — PO auto-trigger",
    kpis:[["7","PR menunggu"],["12","PO bulan ini"],["Rp 248jt","Nilai PO bulan ini"],["3","Butuh approval"]],
    rows:[
      { main:"PR-2026-0451 · Sparepart kompresor AC", sub:"Dari TKT-1042 · Rp 8,5jt · menunggu approval Supervisor", pg:40 },
      { main:"PR-2026-0450 · Lampu LED panel 60x60 (40 pcs)", sub:"Dari TKT-1041 · Rp 6,2jt · approved", pg:100 },
      { main:"PR-2026-0449 · Jasa servis lift tahunan", sub:"Rp 95jt · approval Dept Head", pg:60 },
    ]
  },
  payment: {
    title:"Payment", icon:"06_Payment.png",
    desc:"Pemantauan tagihan & pembayaran vendor GA — status invoice dari diterima sampai lunas.",
    pill:"Rp 412jt outstanding",
    kpis:[["9","Invoice masuk"],["4","Menunggu verifikasi"],["3","Dijadwalkan bayar"],["2","Overdue"]],
    rows:[
      { main:"INV-CR-0098 · PT Cipta Ruang", sub:"Renovasi pantry · Rp 42jt · jatuh tempo 25 Jun", pg:50 },
      { main:"INV-LIFT-0231 · PT Lift Sejahtera", sub:"Servis lift · Rp 95jt · terverifikasi", pg:75 },
      { main:"INV-HK-0455 · Vendor Housekeeping", sub:"Bulanan · Rp 38jt · lunas", pg:100 },
    ]
  },
  energy: {
    title:"Energy Monitoring", icon:"07_Energy.png",
    desc:"Pantauan konsumsi listrik & air per gedung. Anomali memicu tiket Utility Monitoring (GA-MEC-007).",
    pill:"Real-time utility",
    kpis:[["1.24 GWh","Listrik bulan ini"],["-6%","vs bulan lalu"],["3.1 ML","Konsumsi air"],["1","Anomali terdeteksi"]],
    bars:[["Menara Astra",82],["AMDI",64],["ABC BSD",38],["Kediaman",21]],
  },
  hse: {
    title:"HSE", icon:"08_HSE.png",
    desc:"Health, Safety & Environment — inspeksi, temuan, dan kepatuhan keselamatan fasilitas.",
    pill:"0 insiden bulan ini",
    kpis:[["0","Insiden (LTI)"],["24","Inspeksi selesai"],["3","Temuan terbuka"],["96%","Skor kepatuhan"]],
    rows:[
      { main:"APAR Lt.12 perlu refill", sub:"Temuan inspeksi 14 Jun · prioritas sedang", pg:30 },
      { main:"Rambu evakuasi koridor AMDI", sub:"Pemasangan ulang · prioritas rendah", pg:55 },
      { main:"Drill kebakaran kuartal", sub:"Terjadwal 28 Jun", pg:10 },
    ]
  },
  reminder: {
    title:"Reminder", icon:"09_Reminder.png",
    desc:"Pengingat tugas & tenggat GA — kontrak, PM, sertifikasi, dan follow-up tiket.",
    pill:"6 pengingat aktif",
    kpis:[["6","Aktif"],["2","Jatuh tempo hari ini"],["3","Minggu ini"],["1","Terlewat"]],
    rows:[
      { main:"Perpanjangan kontrak vendor HK", sub:"Jatuh tempo 30 Jun · 11 hari lagi", pg:20 },
      { main:"PM bulanan genset Menara Astra", sub:"Jatuh tempo hari ini", pg:5 },
      { main:"Sertifikasi SLO gedung AMDI", sub:"Jatuh tempo 15 Jul", pg:60 },
    ]
  },
};
