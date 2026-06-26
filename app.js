// ============================================================
// AGAVA — portal app shell + engine (simulasi Copilot intent + auto-assign)
// Mencerminkan sheet AI_Matching_Logic Anda:
//   1. kenali intensi -> petakan ke Service
//   2. cocokkan Service.subcategory -> Executor (Specialist_Areas)
//   3. tetapkan PIC owner per kategori + site
//   4. set SLA, masuk ke daftar tiket, monitor status
// ============================================================

let tickets = [];
let counter = 1043;

// ---------- ENGINE: intent recognition ----------
function detectService(text) {
  const t = text.toLowerCase();
  let best = null, bestScore = 0;
  for (const s of SERVICES) {
    let score = 0;
    for (const k of s.kw) {
      if (t.includes(k)) score += k.split(" ").length; // frasa lebih spesifik = bobot lebih tinggi
    }
    if (t.includes(s.sub.toLowerCase().split(" ")[0])) score += 1;
    if (score > bestScore) { bestScore = score; best = s; }
  }
  return bestScore > 0 ? best : null;
}

function detectSite(text) {
  const t = text.toLowerCase();
  if (t.includes("amdi")) return "AMDI";
  if (t.includes("abc") || t.includes("bsd")) return "ABC BSD";
  return "Menara Astra";
}

function matchExecutor(svc) {
  const sub = svc.sub.toLowerCase();
  const cat = svc.cat.toLowerCase();
  let cands = EXECUTORS.filter(e => e.areas.some(a => sub.includes(a) || a.includes(sub.split(" ")[0])));
  if (!cands.length) cands = EXECUTORS.filter(e => e.areas.some(a => a.includes(cat) || cat.includes(a)));
  if (!cands.length) cands = EXECUTORS.filter(e => e.areas.some(a => a.includes("housekeeping")) === (cat==="housekeeping"));
  return cands.length ? cands[0] : EXECUTORS[EXECUTORS.length-1];
}

function matchPIC(svc, site) {
  let cands = TEAM.filter(p => p.cat === svc.cat && (p.site === site || p.site === "All Sites"));
  if (!cands.length) cands = TEAM.filter(p => p.cat === svc.cat);
  if (!cands.length) cands = TEAM.filter(p => p.cat === "GENERAL INQUIRY");
  cands.sort((a,b) => (a.site===site?-1:1));
  return cands[0];
}

function classifyAndAssign(text, by) {
  const svc = detectService(text);
  if (!svc) return { ok:false };
  const site = detectSite(text);
  const exec = matchExecutor(svc);
  const pic = matchPIC(svc, site);
  const t = {
    id:`TKT-${counter++}`, text, svc:svc.id, site,
    pic: pic.name, exec: exec.name, status:"Assigned",
    by: by || "Karyawan (Teams)", hoursAgo:0, justNow:true
  };
  return { ok:true, ticket:t, svc, exec, pic, site };
}

// ---------- util ----------
const svcById = id => SERVICES.find(s => s.id===id) || {name:id,cat:"-",sub:"-",sla:8};
const fmtAgo = h => h===0 ? "baru saja" : (h<24 ? `${h} jam lalu` : `${Math.floor(h/24)} hari lalu`);
function statusClass(s){
  return { "Assigned":"st-assigned", "In Progress":"st-progress",
           "Selesai":"st-done", "SLA Breach":"st-breach" }[s] || "st-assigned";
}
// progres SLA per tiket (visual)
function slaInfo(t){
  const sla = svcById(t.svc).sla;
  if (t.status==="Selesai") return { pct:100, color:"var(--green)", label:`Selesai dalam SLA ${sla}j` };
  if (t.status==="SLA Breach") return { pct:100, color:"var(--red)", label:`SLA ${sla}j terlewati` };
  const pct = Math.min(100, Math.round(t.hoursAgo / sla * 100));
  const color = pct>=90 ? "var(--red)" : pct>=60 ? "var(--amber)" : "var(--teal)";
  return { pct, color, label:`${t.hoursAgo}j / target ${sla}j` };
}

// ============================================================
// SERVICE DESK view (engine tiket)
// ============================================================
function buildServiceView(){
  document.getElementById("view-service").innerHTML = `
    <div class="cols">
      <div>
        <div class="panel" style="margin-bottom:0">
          <div class="panel-hd">
            <h2>📋 Monitor Tiket</h2>
            <span class="sub">PIC ter-assign & progres SLA</span>
          </div>
          <div class="toolbar">
            <label>Filter status:</label>
            <select id="filter">
              <option value="ALL">Semua</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Selesai">Selesai</option>
              <option value="SLA Breach">SLA Breach</option>
            </select>
            <button id="advance" class="btn ghost" style="margin-left:auto" title="Simulasi AGAVA memantau & memajukan status">▶ Majukan status</button>
          </div>
          <div id="tickets" class="ticket-list"></div>
        </div>
      </div>
      <div class="panel" style="margin-bottom:0">
        <div class="panel-hd">
          <h2>💬 AGAVA Assistant</h2>
          <span class="sub">simulasi intake via Teams</span>
        </div>
        <div class="chat">
          <div id="chatlog" class="chatlog"></div>
          <div class="examples">
            <button class="example">AC ruangan saya panas di lantai 12</button>
            <button class="example">Lampu koridor mati di AMDI</button>
            <button class="example">Ada kecoa di pantry</button>
            <button class="example">Lift lambat dan bunyi aneh</button>
          </div>
          <div class="chatbar">
            <input id="chatinput" placeholder="Ketik keluhan seperti karyawan di Teams…" autocomplete="off">
            <button id="send" class="btn">Kirim</button>
          </div>
        </div>
      </div>
    </div>`;

  document.getElementById("send").onclick = submitTicket;
  document.getElementById("chatinput").addEventListener("keydown", e => { if(e.key==="Enter") submitTicket(); });
  document.getElementById("filter").addEventListener("change", renderTickets);
  document.getElementById("advance").onclick = tickProgress;
  document.querySelectorAll("#view-service .example").forEach(b =>
    b.onclick = () => { document.getElementById("chatinput").value = b.textContent; submitTicket(); });

  agavaSay(`Halo 👋 Saya <b>AGAVA</b>, asisten virtual GA Astra. Coba ketik keluhan seperti yang dikirim karyawan di Teams — mis. <i>"AC ruangan saya panas di lantai 12"</i> — dan lihat saya kenali intensinya lalu auto-assign PIC.`);
  renderTickets();
}

function renderTickets() {
  const sel = document.getElementById("filter");
  if (!sel) return;
  const filter = sel.value;
  const rows = tickets
    .filter(t => filter==="ALL" || t.status===filter)
    .map(t => {
      const s = svcById(t.svc); const sla = slaInfo(t);
      return `<div class="ticket ${t.justNow?'flash':''}">
        <div class="t-top">
          <span class="t-id">${t.id}</span>
          <span class="badge ${statusClass(t.status)}">${t.status}</span>
        </div>
        <div class="t-text">${t.text}</div>
        <div class="t-meta">
          <span class="chip">${s.name}</span>
          <span class="chip ghost">${s.cat}</span>
          <span class="chip ghost">${t.site}</span>
        </div>
        <div class="sla-wrap">
          <div class="sla-bar"><div class="sla-fill" style="width:${sla.pct}%;background:${sla.color}"></div></div>
          <div class="sla-txt"><span>SLA</span><span>${sla.label}</span></div>
        </div>
        <div class="t-foot">
          <span title="PIC owner / monitor">👤 PIC: <b>${t.pic}</b></span>
          <span title="Eksekutor lapangan">🔧 Eksekutor: <b>${t.exec}</b></span>
          <span class="t-ago">${fmtAgo(t.hoursAgo)} · dari ${t.by}</span>
        </div>
      </div>`;
    }).join("");
  document.getElementById("tickets").innerHTML = rows || `<div class="empty">Tidak ada tiket pada filter ini.</div>`;
  tickets.forEach(t => t.justNow=false);
}

// ---------- chat ----------
function agavaSay(html, who="agava"){
  const log = document.getElementById("chatlog");
  if (!log) return;
  const div = document.createElement("div");
  div.className = `msg ${who}`;
  div.innerHTML = html;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}
function showTyping(){
  const log = document.getElementById("chatlog");
  if (!log) return null;
  const d = document.createElement("div");
  d.className = "typing"; d.innerHTML = "<span></span><span></span><span></span>";
  log.appendChild(d); log.scrollTop = log.scrollHeight;
  return d;
}
function submitTicket(){
  const input = document.getElementById("chatinput");
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  agavaSay(text, "user");

  const typing = showTyping();
  setTimeout(() => {
    if (typing) typing.remove();
    const res = classifyAndAssign(text);
    if (!res.ok) {
      agavaSay(`Maaf, saya belum yakin ini masuk layanan GA yang mana. Bisa sebutkan masalahnya lebih spesifik? (mis. AC, lampu, toilet, lift, kebersihan)`);
      return;
    }
    const s = res.svc;
    agavaSay(`🧠 <b>Intensi dikenali:</b> "${text}"<br>→ Layanan: <b>${s.name}</b> <span class="mini">(${s.id} · ${s.cat}/${s.sub})</span>`);
    const t2 = showTyping();
    setTimeout(() => {
      if (t2) t2.remove();
      agavaSay(`📍 Lokasi terdeteksi: <b>${res.site}</b><br>🎯 Auto-assign sesuai AI Matching Logic:<br>&nbsp;&nbsp;• PIC monitor: <b>${res.pic.name}</b> <span class="mini">(${res.pic.role})</span><br>&nbsp;&nbsp;• Eksekutor: <b>${res.exec.name}</b> <span class="mini">(${res.exec.job})</span>`);
      const t3 = showTyping();
      setTimeout(() => {
        if (t3) t3.remove();
        tickets.unshift(res.ticket);
        agavaSay(`✅ Tiket <b>${res.ticket.id}</b> dibuat & di-assign. Target SLA <b>${s.sla} jam</b>. Saya akan pantau sampai selesai. 👀`);
        toast(`Tiket <b>${res.ticket.id}</b> di-assign ke ${res.pic.name}`);
        document.getElementById("filter").value = "ALL";
        renderTickets(); refreshDashboard(); updateBadges();
      }, 750);
    }, 800);
  }, 650);
}

function tickProgress(){
  const movable = tickets.filter(t => t.status==="Assigned" || t.status==="In Progress");
  if (!movable.length) { toast("Tidak ada tiket aktif untuk dimajukan."); return; }
  const t = movable[0];
  if (t.status==="Assigned") t.status="In Progress";
  else if (t.status==="In Progress") { t.status="Selesai"; toast(`Tiket <b>${t.id}</b> selesai ✓`); }
  renderTickets(); refreshDashboard(); updateBadges();
}

// ============================================================
// DASHBOARD view
// ============================================================
function buildDashboardView(){
  document.getElementById("view-dashboard").innerHTML = `
    <div id="kpi" class="kpi-grid"></div>
    <div class="cols">
      <div>
        <div class="panel"><div class="panel-hd"><h2>📊 Tiket per Kategori Layanan</h2></div>
          <div id="catchart" class="chart-box"></div></div>
        <div class="panel" style="margin-bottom:0"><div class="panel-hd"><h2>🏢 Distribusi per Site</h2></div>
          <div id="sitechart" class="chart-box"></div></div>
      </div>
      <div>
        <div class="panel"><div class="panel-hd"><h2>👥 Beban PIC</h2><span class="sub">tiket aktif</span></div>
          <div id="workload" class="chart-box"></div></div>
        <div class="panel" style="margin-bottom:0"><div class="panel-hd"><h2>🕑 Aktivitas Terbaru</h2></div>
          <div id="activity" style="padding:6px 18px 14px"></div></div>
      </div>
    </div>`;
  refreshDashboard();
}

function refreshDashboard(){
  const kpi = document.getElementById("kpi");
  if (!kpi) return;
  const total = tickets.length;
  const open = tickets.filter(t => t.status==="Assigned" || t.status==="In Progress").length;
  const done = tickets.filter(t => t.status==="Selesai").length;
  const breach = tickets.filter(t => t.status==="SLA Breach").length;
  const rate = total ? Math.round(done/total*100) : 0;
  kpi.innerHTML = `
    ${kpiCard("Tiket Masuk", total, "Hari ini", "📥", "ic-inbox", "")}
    ${kpiCard("Sedang Dikerjakan", open, "Assigned + In Progress", "🛠️", "ic-work", "kpi-work")}
    ${kpiCard("Selesai", done, rate+"% resolution rate", "✅", "ic-done", "kpi-done")}
    ${kpiCard("Butuh Perhatian", breach, "SLA terlewati", "⚠️", "ic-alert", breach>0?"kpi-alert":"")}`;

  // chart kategori
  const cc = {}; tickets.forEach(t => { const c = svcById(t.svc).cat; cc[c]=(cc[c]||0)+1; });
  document.getElementById("catchart").innerHTML = barRows(cc);
  // chart site
  const sc = {}; tickets.forEach(t => { sc[t.site]=(sc[t.site]||0)+1; });
  document.getElementById("sitechart").innerHTML = barRows(sc);
  // workload PIC (tiket aktif)
  const wl = {}; tickets.filter(t=>t.status!=="Selesai").forEach(t => { wl[t.pic]=(wl[t.pic]||0)+1; });
  document.getElementById("workload").innerHTML = barRows(wl) || `<div class="empty">Semua tiket selesai 🎉</div>`;
  // aktivitas
  document.getElementById("activity").innerHTML = tickets.slice(0,6).map(t => {
    const s = svcById(t.svc);
    return `<div class="list-row"><div class="lr-main"><b>${t.id}</b> · ${s.name}
      <div class="lr-sub">${t.site} · ${fmtAgo(t.hoursAgo)}</div></div>
      <span class="badge ${statusClass(t.status)}">${t.status}</span></div>`;
  }).join("");
}
function kpiCard(label, val, sub, emoji, ic, cls){
  return `<div class="kpi-card ${cls}">
    <div class="kpi-icon ${ic}">${emoji}</div>
    <div class="kpi-val">${val}</div>
    <div class="kpi-label">${label}</div>
    <div class="kpi-sub">${sub}</div></div>`;
}
function barRows(counts){
  const entries = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
  if (!entries.length) return "";
  const max = Math.max(1, ...entries.map(e=>e[1]));
  return entries.map(([k,n]) => `<div class="bar-row">
    <span class="bar-label" title="${k}">${k}</span>
    <div class="bar-track"><div class="bar-fill" style="width:${n/max*100}%"></div></div>
    <span class="bar-val">${n}</span></div>`).join("");
}

// ============================================================
// MODULE views (placeholder presentasi)
// ============================================================
function buildModuleView(key){
  const m = MODULES[key];
  const el = document.getElementById("view-"+key);
  if (!m || !el) return;
  const kpis = (m.kpis||[]).map(([v,l]) => `<div class="mcard"><div class="num">${v}</div><p>${l}</p></div>`).join("");
  let body = "";
  if (m.rows){
    body = `<div class="panel" style="margin-bottom:0"><div class="panel-hd"><h2>Ringkasan</h2><span class="sub">data contoh</span></div>
      <div style="padding:6px 18px 14px">${m.rows.map(r => `<div class="list-row">
        <div class="lr-main"><b>${r.main}</b><div class="lr-sub">${r.sub}</div></div>
        <div class="pgbar"><i style="width:${r.pg}%"></i></div></div>`).join("")}</div></div>`;
  } else if (m.bars){
    body = `<div class="panel" style="margin-bottom:0"><div class="panel-hd"><h2>Konsumsi per Gedung</h2><span class="sub">indeks · data contoh</span></div>
      <div class="chart-box">${m.bars.map(([k,v]) => `<div class="bar-row">
        <span class="bar-label">${k}</span><div class="bar-track"><div class="bar-fill" style="width:${v}%"></div></div>
        <span class="bar-val">${v}</span></div>`).join("")}</div></div>`;
  }
  el.innerHTML = `
    <div class="mhero">
      <div class="mh-ic"><img src="assets/icons/${m.icon}"></div>
      <div><h2>${m.title}</h2><p>${m.desc}</p></div>
      <span class="pill">${m.pill}</span>
    </div>
    <div class="grid-3" style="margin-bottom:20px">${kpis}</div>
    ${body}
    <p style="text-align:center;color:var(--muted);font-size:12px;margin-top:22px">
      Modul ini menampilkan data contoh untuk presentasi · di produksi terhubung ke SharePoint List tersendiri.</p>`;
}

// ============================================================
// Router & shell
// ============================================================
const PAGE_META = {
  dashboard:["Dashboard","Ringkasan operasional General Affair hari ini"],
  service:["Service Desk","Intake tiket via AGAVA + monitoring SLA sampai selesai"],
  building:["Building","Pengelolaan gedung & maintenance"],
  project:["GA Project","Monitoring proyek General Affair"],
  procurement:["Procurement","Pengadaan barang/jasa GA"],
  payment:["Payment","Tagihan & pembayaran vendor"],
  energy:["Energy","Pemantauan konsumsi listrik & air"],
  hse:["HSE","Health, Safety & Environment"],
  reminder:["Reminder","Pengingat tugas & tenggat GA"],
};
function showView(name){
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.getElementById("view-"+name).classList.add("active");
  document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.view===name));
  const [title,sub] = PAGE_META[name] || [name,""];
  document.getElementById("pageTitle").textContent = title;
  document.getElementById("pageSub").textContent = sub;
  closeSidebar();
  window.scrollTo({top:0});
}
function updateBadges(){
  const open = tickets.filter(t => t.status!=="Selesai").length;
  const b = document.getElementById("navServiceBadge");
  if (b) b.textContent = open;
}

// toast
function toast(html){
  const wrap = document.getElementById("toasts");
  const t = document.createElement("div");
  t.className = "toast"; t.innerHTML = html;
  wrap.appendChild(t);
  setTimeout(() => { t.style.transition="opacity .4s"; t.style.opacity="0"; setTimeout(()=>t.remove(),400); }, 4200);
}

// clock
function tickClock(){
  const el = document.getElementById("clock");
  if (!el) return;
  const d = new Date();
  const days=["Min","Sen","Sel","Rab","Kam","Jum","Sab"];
  el.textContent = `${days[d.getDay()]} ${d.toLocaleDateString("id-ID")} · ${d.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"})}`;
}

// mobile sidebar
function openSidebar(){ document.getElementById("sidebar").classList.add("open"); document.getElementById("scrim").classList.add("show"); }
function closeSidebar(){ document.getElementById("sidebar").classList.remove("open"); document.getElementById("scrim").classList.remove("show"); }

// ============================================================
// INIT
// ============================================================
function init(){
  tickets = SEED_TICKETS.map(t => ({...t}));

  buildDashboardView();
  buildServiceView();
  ["building","project","procurement","payment","energy","hse","reminder"].forEach(buildModuleView);
  updateBadges();

  document.querySelectorAll(".nav-item").forEach(b =>
    b.onclick = () => showView(b.dataset.view));
  document.getElementById("burger").onclick = openSidebar;
  document.getElementById("scrim").onclick = closeSidebar;

  tickClock(); setInterval(tickClock, 30000);
}
document.addEventListener("DOMContentLoaded", init);
