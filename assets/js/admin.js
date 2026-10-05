/* ==========================================================================
   Cindy's Studio: the owner's dashboard. Reads and writes the same
   localStorage "database" as the public site (store.js), so an order placed
   on the website appears here at once, and moving it on the kitchen board
   updates the customer's tracking page live in another tab.
   ========================================================================== */
(function () {
  const D = CCH, S = CCHStore, B = D.BUSINESS;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const img = n => `../assets/img/thumb/${n}.jpg`;
  const money = S.money, today = () => S.iso(S.today());
  const dayIso = n => S.iso(S.addDays(S.today(), n));
  const COLORS = { online: "#9b2c52", messages: "#d99a3a", counter: "#3f7fbf" };
  const CH = { web: "Website", whatsapp: "WhatsApp", instagram: "Instagram", phone: "Phone", "walk-in": "Counter" };
  const chGroup = c => c === "web" ? "online" : c === "walk-in" ? "counter" : "messages";
  const itemName = it => it.opts && it.opts.custom ? it.opts.custom.name : (S.byId[it.id] || {}).name || it.id;
  const itemImg = it => it.opts && it.opts.custom ? it.opts.custom.img : (S.byId[it.id] || {}).img;
  const isPre = o => o.channel !== "walk-in";
  const db = () => S.db;

  /* ---------- gate ---------- */
  let signedIn = false; try { signedIn = sessionStorage.getItem("cch.admin") === "1"; } catch (e) {}
  function enter() { try { sessionStorage.setItem("cch.admin", "1"); } catch (e) {} $("#gate").hidden = true; $("#shell").hidden = false; route(); }
  $("#enter").addEventListener("click", enter);

  /* ---------- nav ---------- */
  const VIEWS = [
    ["today", "Today", '<path d="M4 6h16v14H4zM4 10h16M9 3v4M15 3v4"/>'],
    ["orders", "Orders", '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6"/>'],
    ["kitchen", "Kitchen board", '<path d="M4 4h5v16H4zM10 4h5v10h-5zM16 4h4v7h-4z"/>'],
    ["counter", "Counter", '<path d="M3 9h18l-2 11H5zM8 9V6a4 4 0 0 1 8 0v3"/>'],
    ["calendar", "Calendar", '<path d="M4 6h16v14H4zM4 10h16M8 14h2M12 14h2M16 14h2M8 17h2"/>'],
    ["clients", "Clients", '<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2 .8 3 2.8 3 6"/>'],
    ["insights", "Insights", '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'],
    ["assistant", "Assistant", '<path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4zM18 15l.9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9z"/>'],
    ["inbox", "Inbox", '<path d="M3 13l3-8h12l3 8v6H3zM3 13h5l1 2h6l1-2h5"/>']
  ];
  function navCounts() {
    const due = db().orders.filter(o => o.date === today() && isPre(o) && !["delivered", "collected"].includes(o.status)).length;
    const unread = messages().filter(m => !m.read).length;
    return { today: due, inbox: unread, orders: db().orders.filter(o => o.own && o.status === "received" || o.own && o.status === "confirmed" && o.created === today()).length };
  }
  function drawNav(cur) {
    const c = navCounts();
    $("#sideNav").innerHTML = VIEWS.map(v => `<a href="#${v[0]}" class="${v[0] === cur ? "is-on" : ""}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">${v[2]}</svg><span>${v[1]}</span>${c[v[0]] ? `<em>${c[v[0]]}</em>` : ""}</a>`).join("");
  }
  $("#topMenu").addEventListener("click", () => document.body.classList.toggle("side-open"));
  $("#sideNav").addEventListener("click", () => document.body.classList.remove("side-open"));
  $("#resetDemo").addEventListener("click", () => { if (confirm("Reset all demo orders, customers and settings?")) S.reset(); });
  window.addEventListener("hashchange", () => route(false));
  window.addEventListener("cch:db", () => { if (!$("#shell").hidden && !dragging) route(true); });

  function route(soft) {
    const v = (location.hash || "#today").slice(1).split("?")[0];
    const view = VIEWS.find(x => x[0] === v) ? v : "today";
    drawNav(view);
    const R = { today: vToday, orders: vOrders, kitchen: vKitchen, counter: vCounter, calendar: vCalendar, clients: vClients, insights: vInsights, assistant: vAssistant, inbox: vInbox }[view];
    $("#viewTitle").textContent = VIEWS.find(x => x[0] === view)[1];
    if (soft && view === "assistant") return; // keep the conversation
    if (soft && view === "counter") { counterSide(); return; }
    R();
    if (!soft) window.scrollTo(0, 0);
  }

  /* ---------- shared bits ---------- */
  function toast(html) { const t = document.createElement("div"); t.className = "toast glass"; t.innerHTML = html; $("#aToasts").appendChild(t); setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 400); }, 3200); }
  const pill = s => `<span class="status-pill st-${s === "collected" ? "delivered" : s}">${S.STATUS_LABEL[s]}</span>`;
  const chTag = c => `<span class="ch ch-${chGroup(c)}">${CH[c] || c}</span>`;
  const wa = (phone, text) => `https://wa.me/${String(phone || "").replace(/\D/g, "").replace(/^0/, "233")}?text=${encodeURIComponent(text)}`;
  function openDrawer(title, html) { $("#aDrawerT").textContent = title; $("#aDrawerB").innerHTML = html; $("#aDrawer").classList.add("is-open"); $("#aDrawer").setAttribute("aria-hidden", "false"); $("#aScrim").classList.add("is-open"); }
  function closeDrawer() { $("#aDrawer").classList.remove("is-open"); $("#aDrawer").setAttribute("aria-hidden", "true"); $("#aScrim").classList.remove("is-open"); }
  document.addEventListener("click", e => { if (e.target.closest("[data-aclose]") || e.target.id === "aScrim") closeDrawer(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeDrawer(); });
  function sumBy(list, f) { return list.reduce((s, x) => s + f(x), 0); }
  function inRange(o, from, to) { return o.date >= from && o.date <= to; }
  const greet = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };
  const nextStatus = o => { const flow = o.method === "delivery" ? ["received", "confirmed", "baking", "decorating", "ready", "out", "delivered"] : ["received", "confirmed", "baking", "decorating", "ready", "collected"]; const i = flow.indexOf(o.status); return i >= 0 && i < flow.length - 1 ? flow[i + 1] : null; };
  function advance(ref) { const o = S.findOrder(ref); const n = o && nextStatus(o); if (!n) return; S.updateOrder(ref, { status: n }); toast(`<div><b>${o.ref} → ${S.STATUS_LABEL[n]}</b><small>The customer's tracking page has updated.</small></div>`); }

  /* ---------- charts (inline SVG) ---------- */
  function stackedBars(days) {
    const keys = ["online", "messages", "counter"], labels = { online: "Website", messages: "WhatsApp, Instagram & phone", counter: "Counter" };
    const W = 760, H = 240, P = { l: 52, r: 8, t: 14, b: 28 };
    const max = Math.max(1, ...days.map(d => keys.reduce((s, k) => s + d[k], 0)));
    const step = niceStep(max), top = Math.ceil(max / step) * step;
    const bw = (W - P.l - P.r) / days.length, barW = Math.max(6, Math.min(30, bw * 0.62));
    const y = v => P.t + (H - P.t - P.b) * (1 - v / top);
    let g = "";
    for (let v = 0; v <= top; v += step) g += `<line x1="${P.l}" x2="${W - P.r}" y1="${y(v)}" y2="${y(v)}" class="grid"/><text x="${P.l - 8}" y="${y(v) + 4}" class="ax" text-anchor="end">${v >= 1000 ? (v / 1000) + "k" : v}</text>`;
    let bars = "";
    days.forEach((d, i) => {
      const x = P.l + i * bw + (bw - barW) / 2; let acc = 0;
      keys.forEach((k, ki) => {
        if (!d[k]) return; const y1 = y(acc + d[k]), y0 = y(acc); const h = Math.max(0, y0 - y1 - (acc ? 2 : 0));
        const isTop = keys.slice(ki + 1).every(kk => !d[kk]);
        bars += `<rect x="${x}" y="${y1}" width="${barW}" height="${h}" rx="${isTop ? 4 : 0}" fill="${COLORS[k]}"/>`; acc += d[k];
      });
      bars += `<rect class="hit" x="${P.l + i * bw}" y="${P.t}" width="${bw}" height="${H - P.t - P.b}" data-i="${i}"/>`;
      if (i % 2 === (days.length - 1) % 2) bars += `<text x="${x + barW / 2}" y="${H - 8}" class="ax" text-anchor="middle">${d.label}</text>`;
    });
    const legend = keys.map(k => `<span><i style="background:${COLORS[k]}"></i>${labels[k]}</span>`).join("");
    const table = `<table class="mini-table"><thead><tr><th>Day</th>${keys.map(k => `<th>${labels[k]}</th>`).join("")}<th>Total</th></tr></thead><tbody>${days.map(d => `<tr><td>${d.long}</td>${keys.map(k => `<td>${money(d[k])}</td>`).join("")}<td>${money(keys.reduce((s, k) => s + d[k], 0))}</td></tr>`).join("")}</tbody></table>`;
    return { html: `<div class="legend">${legend}<button class="link-u small tbl-toggle" type="button">View as table</button></div><div class="chart-wrap"><svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Revenue by day and channel, last ${days.length} days">${g}${bars}</svg><div class="tip" hidden></div></div><div class="tbl" hidden>${table}</div>`, days, keys, labels };
  }
  function bindChart(root, data) {
    const svg = $("svg.chart", root), tip = $(".tip", root);
    svg.addEventListener("mousemove", e => {
      const r = e.target.closest(".hit"); if (!r) { tip.hidden = true; return; }
      const d = data.days[+r.dataset.i]; const tot = data.keys.reduce((s, k) => s + d[k], 0);
      tip.innerHTML = `<b>${d.long}</b>${data.keys.map(k => `<span><i style="background:${COLORS[k]}"></i>${data.labels[k]}<em>${money(d[k])}</em></span>`).join("")}<span class="tt"><i></i>Total<em>${money(tot)}</em></span>`;
      const box = root.querySelector(".chart-wrap").getBoundingClientRect(); tip.hidden = false;
      let x = e.clientX - box.left + 14; if (x > box.width - 230) x = e.clientX - box.left - 230; tip.style.left = x + "px"; tip.style.top = Math.max(0, e.clientY - box.top - 40) + "px";
      $$(".hit", svg).forEach(h => h.classList.toggle("on", h === r));
    });
    svg.addEventListener("mouseleave", () => { tip.hidden = true; $$(".hit", svg).forEach(h => h.classList.remove("on")); });
    $(".tbl-toggle", root).addEventListener("click", e => { const t = $(".tbl", root); t.hidden = !t.hidden; $(".chart-wrap", root).hidden = !t.hidden; e.target.textContent = t.hidden ? "View as table" : "View as chart"; });
  }
  function niceStep(max) { const raw = max / 4, p = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p; }
  function hbars(rows, fmt) { const max = Math.max(1, ...rows.map(r => r[1])); return `<ul class="hbars">${rows.map(r => `<li><span class="hb-l">${esc(r[0])}</span><span class="hb-t"><i style="width:${(r[1] / max * 100).toFixed(1)}%"></i></span><span class="hb-v">${fmt ? fmt(r[1]) : r[1]}</span></li>`).join("")}</ul>`; }
  function revenueDays(n) {
    const out = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = dayIso(-i), dt = S.parse(d), os = db().orders.filter(o => o.date === d);
      const row = { label: dt.getDate(), long: S.fmtDate(d), online: 0, messages: 0, counter: 0 };
      os.forEach(o => row[chGroup(o.channel)] += o.total); out.push(row);
    }
    return out;
  }

  /* ================= TODAY ================= */
  function vToday() {
    const t = today(), O = db().orders;
    const dueToday = O.filter(o => o.date === t && isPre(o)).sort((a, b) => a.slot.localeCompare(b.slot));
    const counterToday = O.filter(o => o.date === t && !isPre(o));
    const revToday = sumBy(O.filter(o => o.date === t), o => o.total);
    const week = O.filter(o => isPre(o) && inRange(o, dayIso(1), dayIso(7)));
    const balances = O.filter(o => isPre(o) && o.date >= t && o.payment.paid < o.total);
    const balTotal = sumBy(balances, o => o.total - o.payment.paid);
    const newWeb = O.filter(o => o.own).slice(-3).reverse();
    const occ = S.upcomingOccasions(21).filter(x => !db().reminders[x.c.id + x.oc.md]);
    const busiest = (() => { let b = null; for (let i = 1; i < 10; i++) { const d = dayIso(i), s = S.dayState(d, 1); if (s.cap && (!b || s.used / s.cap > b.r)) b = { d, r: s.used / s.cap, s }; } return b; })();
    const counts = {}; O.filter(o => o.date === dayIso(-1)).forEach(o => o.items.forEach(it => counts[it.id] = (counts[it.id] || 0) + it.qty));
    const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    $("#viewSub").textContent = S.fmtDate(t, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const days = revenueDays(14), chart = stackedBars(days);
    $("#view").innerHTML = `
      <section class="brief card">
        <div class="brief-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4z"/></svg></div>
        <div><h2 class="h3">${greet()}, Cindy.</h2>
        <ul class="brief-list">
          <li><b>${dueToday.length} pre-order${dueToday.length === 1 ? "" : "s"}</b> leave the kitchen today${dueToday.filter(o => o.method === "delivery").length ? `, ${dueToday.filter(o => o.method === "delivery").length} of them deliveries` : ""}. ${dueToday.filter(o => ["received", "confirmed", "baking"].includes(o.status)).length ? `<b>${dueToday.filter(o => ["received", "confirmed", "baking"].includes(o.status)).length}</b> haven't reached decorating yet.` : "All are on track."}</li>
          ${newWeb.length ? `<li>New on the website: ${newWeb.map(o => `<a href="#orders" data-open="${o.ref}">${esc(o.customer.name.split(" ")[0])} (${money(o.total)})</a>`).join(", ")}.</li>` : ""}
          <li><b>${occ.length} customers</b> have a birthday or anniversary in the next three weeks. A reminder usually turns into an order${occ[0] ? `; start with <a href="#clients">${esc(occ[0].c.name)}</a>, ${occ[0].inDays} days away` : ""}.</li>
          ${busiest ? `<li>${S.fmtDate(busiest.d, { weekday: "long", day: "numeric" })} is the busiest day ahead: <b>${busiest.s.used} of ${busiest.s.cap}</b> cake slots taken.${busiest.r >= 0.8 ? " Consider closing it to new couture orders." : ""}</li>` : ""}
          ${best ? `<li>Yesterday's best seller was <b>${esc(S.byId[best[0]].name)}</b> (${best[1]} sold). Efua has ${S.byId[best[0]].cat === "viennoiserie" ? "laminated" : "prepped"} extra for today.</li>` : ""}
          <li><b>${money(balTotal)}</b> in balances is due on upcoming orders. <a href="#orders">See who owes →</a></li>
        </ul></div>
      </section>
      <section class="kpis">
        <div class="kpi card"><span class="label">Revenue today</span><b>${money(revToday)}</b><small>${counterToday.length} counter sales · ${dueToday.length} pre-orders</small></div>
        <div class="kpi card"><span class="label">Booked, next 7 days</span><b>${money(sumBy(week, o => o.total))}</b><small>${week.length} orders</small></div>
        <div class="kpi card"><span class="label">Balances due</span><b>${money(balTotal)}</b><small>${balances.length} orders with a deposit paid</small></div>
        <div class="kpi card"><span class="label">Website share, 30 days</span><b>${Math.round(sumBy(O.filter(o => o.channel === "web" && inRange(o, dayIso(-29), t)), o => o.total) / Math.max(1, sumBy(O.filter(o => inRange(o, dayIso(-29), t)), o => o.total)) * 100)}%</b><small>of all revenue came through the site</small></div>
      </section>
      <section class="card chart-card" id="revCard"><div class="card-head"><h2 class="h4">Revenue, last 14 days</h2><span class="muted small">${money(sumBy(days, d => d.online + d.messages + d.counter))} total</span></div>${chart.html}</section>
      <div class="two">
        <section class="card"><div class="card-head"><h2 class="h4">Leaving the kitchen today</h2><a class="link-u small" href="#kitchen">Kitchen board →</a></div>
          ${dueToday.length ? `<ul class="rows">${dueToday.map(o => `<li class="row"><span class="mono row-slot">${esc(o.slot.slice(0, 5))}</span><img src="${img(itemImg(o.items[0]))}" alt=""><span class="row-main"><b>${esc(o.customer.name)}</b><small>${esc(itemName(o.items[0]))}${o.items.length > 1 ? ` +${o.items.length - 1}` : ""} · ${o.method === "delivery" ? "Delivery, " + esc((D.ZONES.find(z => z.id === o.zone) || {}).name || "") : "Collection"}</small></span>${pill(o.status)}${nextStatus(o) ? `<button class="btn btn-sm btn-ghost" data-adv="${o.ref}">${S.STATUS_LABEL[nextStatus(o)]} →</button>` : ""}</li>`).join("")}</ul>` : `<p class="muted">Nothing booked for today. The counter is open.</p>`}
        </section>
        <section class="card"><div class="card-head"><h2 class="h4">Occasions coming up</h2><a class="link-u small" href="#clients">All clients →</a></div>
          <ul class="rows">${occ.slice(0, 6).map(x => remRow(x)).join("") || `<li class="muted">No occasions in the next three weeks.</li>`}</ul>
        </section>
      </div>`;
    bindChart($("#revCard"), chart);
  }
  function remRow(x) {
    const last = S.byId[x.oc.last];
    return `<li class="row"><span class="mono row-slot">${x.inDays}d</span>${last ? `<img src="${img(last.img)}" alt="">` : ""}<span class="row-main"><b>${esc(x.c.name)}</b><small>${x.oc.type === "birthday" ? "Birthday" : x.oc.type === "anniversary" ? "Anniversary" : "Occasion"} · ${esc(x.oc.who)} · ${S.fmtDate(x.date, { day: "numeric", month: "short" })}${last ? ` · last time: ${esc(last.name)}` : ""}</small></span><a class="btn btn-sm btn-pist" target="_blank" rel="noopener" data-remind="${x.c.id + x.oc.md}" href="${wa(x.c.phone, `Hello ${x.c.name.split(" ")[0]}, it's Esi from Cindy's Cake House. ${x.oc.who === "Self" ? "Your" : esc(x.oc.who) + "'s"} ${x.oc.type === "anniversary" ? "anniversary" : "birthday"} is on ${S.fmtDate(x.date, { day: "numeric", month: "long" })}.${last ? ` Last year you had the ${last.name}.` : ""} Shall we hold a slot for you? We have a few left that week.`)}">Remind</a></li>`;
  }
  document.addEventListener("click", e => {
    const a = e.target.closest("[data-adv]"); if (a) { e.preventDefault(); advance(a.dataset.adv); return; }
    const r = e.target.closest("[data-remind]"); if (r) { db().reminders[r.dataset.remind] = today(); S.save(); toast(`<div><b>Reminder sent</b><small>Logged on the client's profile.</small></div>`); return; }
    const op = e.target.closest("[data-open]"); if (op) { e.preventDefault(); orderDrawer(op.dataset.open); }
  });

  /* ================= ORDERS ================= */
  let oFilter = { when: "upcoming", status: "", channel: "", q: "" };
  function vOrders() {
    $("#viewSub").textContent = "Every order, from every channel";
    $("#view").innerHTML = `<section class="card">
      <div class="filters-row">
        <div class="opt-row" id="oWhen">${[["upcoming", "Upcoming"], ["today", "Today"], ["past", "Last 30 days"], ["balance", "Balance due"], ["all", "All"]].map(w => `<button class="chip ${oFilter.when === w[0] ? "is-on" : ""}" data-w="${w[0]}">${w[1]}</button>`).join("")}</div>
        <div class="f-right"><select class="select sm" id="oStatus"><option value="">Any status</option>${Object.entries(S.STATUS_LABEL).map(([k, v]) => `<option value="${k}" ${oFilter.status === k ? "selected" : ""}>${v}</option>`).join("")}</select>
        <select class="select sm" id="oChan"><option value="">All channels</option>${Object.entries(CH).map(([k, v]) => `<option value="${k}" ${oFilter.channel === k ? "selected" : ""}>${v}</option>`).join("")}</select>
        <input class="input sm" id="oQ" type="search" placeholder="Name, reference, cake…" value="${esc(oFilter.q)}"></div>
      </div>
      <div id="oTable"></div></section>`;
    drawOrders();
    $("#oWhen").addEventListener("click", e => { const b = e.target.closest("[data-w]"); if (!b) return; oFilter.when = b.dataset.w; $$("#oWhen .chip").forEach(c => c.classList.toggle("is-on", c === b)); drawOrders(); });
    $("#oStatus").addEventListener("change", e => { oFilter.status = e.target.value; drawOrders(); });
    $("#oChan").addEventListener("change", e => { oFilter.channel = e.target.value; drawOrders(); });
    $("#oQ").addEventListener("input", e => { oFilter.q = e.target.value; drawOrders(); });
  }
  function drawOrders() {
    const t = today();
    let L = db().orders.slice();
    if (oFilter.when === "upcoming") L = L.filter(o => o.date >= t && isPre(o) && !["delivered", "collected"].includes(o.status));
    if (oFilter.when === "today") L = L.filter(o => o.date === t);
    if (oFilter.when === "past") L = L.filter(o => inRange(o, dayIso(-30), t));
    if (oFilter.when === "balance") L = L.filter(o => isPre(o) && o.date >= t && o.payment.paid < o.total);
    if (oFilter.status) L = L.filter(o => o.status === oFilter.status);
    if (oFilter.channel) L = L.filter(o => o.channel === oFilter.channel);
    if (oFilter.q) { const q = oFilter.q.toLowerCase(); L = L.filter(o => (o.ref + " " + o.customer.name + " " + o.items.map(itemName).join(" ")).toLowerCase().includes(q)); }
    L.sort((a, b) => oFilter.when === "past" || oFilter.when === "all" ? (b.date + b.slot).localeCompare(a.date + a.slot) : (a.date + a.slot).localeCompare(b.date + b.slot));
    const shown = L.slice(0, 120);
    $("#oTable").innerHTML = `<p class="muted small" style="margin:4px 0 12px">${L.length} orders · ${money(sumBy(L, o => o.total))}${L.length > 120 ? " · showing the first 120" : ""}</p>
      <div class="otable" role="table"><div class="otr oth" role="row"><span>Order</span><span>Customer</span><span>When</span><span>Items</span><span>Total</span><span>Status</span></div>
      ${shown.map(o => `<button class="otr" role="row" data-open="${o.ref}"><span><b class="mono">${o.ref}</b>${o.own ? `<em class="new">New</em>` : ""}<br>${chTag(o.channel)}</span><span><b>${esc(o.customer.name)}</b><small>${esc(o.customer.phone || "")}</small></span><span>${S.fmtDate(o.date)}<small class="mono">${esc(o.slot)}</small></span><span class="o-items">${o.items.map(it => `<img src="${img(itemImg(it))}" alt="" title="${esc(itemName(it))}">`).join("")}<small>${esc(itemName(o.items[0]))}${o.items.length > 1 ? ` +${o.items.length - 1}` : ""}</small></span><span><b class="mono">${money(o.total)}</b><small>${o.payment.paid >= o.total ? "Paid" : o.payment.paid ? `Paid ${money(o.payment.paid)}` : "Unpaid"}</small></span><span>${pill(o.status)}</span></button>`).join("") || `<p class="muted" style="padding:20px">No orders match.</p>`}</div>`;
  }
  function orderDrawer(ref) {
    const o = S.findOrder(ref); if (!o) return;
    const z = o.zone ? D.ZONES.find(x => x.id === o.zone) : null;
    const flow = o.method === "delivery" ? ["received", "confirmed", "baking", "decorating", "ready", "out", "delivered"] : o.method === "counter" ? ["collected"] : ["received", "confirmed", "baking", "decorating", "ready", "collected"];
    openDrawer(o.ref, `
      <div class="od-top">${pill(o.status)} ${chTag(o.channel)}</div>
      <div class="od-block"><span class="label">Customer</span><b class="h4">${esc(o.customer.name)}</b><p class="muted small">${esc(o.customer.phone || "")}${o.customer.email ? " · " + esc(o.customer.email) : ""}</p>
        ${o.customer.phone ? `<a class="btn btn-sm btn-pist" target="_blank" rel="noopener" href="${wa(o.customer.phone, `Hello ${o.customer.name.split(" ")[0]}, it's Esi from Cindy's Cake House about order ${o.ref}.`)}">WhatsApp ${esc(o.customer.name.split(" ")[0])}</a>` : ""}</div>
      ${o.recipient ? `<div class="od-block"><span class="label">Gift for</span><b>${esc(o.recipient.name)}</b> <span class="muted small">${esc(o.recipient.phone)}</span>${o.recipient.card ? `<p class="od-card">“${esc(o.recipient.card)}”</p>` : ""}</div>` : ""}
      <div class="od-block"><span class="label">${o.method === "delivery" ? "Delivery" : o.method === "counter" ? "Counter sale" : "Collection"}</span><b>${S.fmtDate(o.date, { weekday: "long", day: "numeric", month: "long" })} · ${esc(o.slot)}</b>${z ? `<p class="muted small">${esc(z.name)}${o.address ? " · " + esc(o.address) : ""}</p>` : ""}</div>
      <div class="od-block"><span class="label">Items</span>${o.items.map(it => `<div class="done-item"><img src="${img(itemImg(it))}" alt=""><span><b>${it.qty} × ${esc(itemName(it))}</b><br><small class="muted">${esc(it.opts && it.opts.custom ? it.opts.custom.summary : [it.opts && it.opts.size && it.opts.size + " inch", it.opts && it.opts.flavour, it.opts && it.opts.message && "“" + it.opts.message + "”", it.opts && it.opts.date && S.fmtDate(it.opts.date) + " " + it.opts.time].filter(Boolean).join(" · "))}</small></span></div>`).join("")}</div>
      ${o.notes ? `<div class="od-block"><span class="label">Notes</span><p>${esc(o.notes)}</p></div>` : ""}
      <div class="od-block"><span class="label">Payment</span><div class="kv"><span>Total</span><span class="mono">${money(o.total)}</span></div><div class="kv"><span>Paid · ${esc(o.payment.method)}</span><span class="mono">${money(o.payment.paid)}</span></div>${o.payment.paid < o.total ? `<div class="kv"><span>Balance</span><span class="mono">${money(o.total - o.payment.paid)}</span></div><button class="btn btn-sm" id="odPay">Record balance as paid</button>` : ""}</div>
      ${flow.length > 1 ? `<div class="od-block"><span class="label">Move to</span><div class="opt-row">${flow.map(s => `<button class="chip ${o.status === s ? "is-on" : ""}" data-set="${s}">${S.STATUS_LABEL[s]}</button>`).join("")}</div><p class="muted small">The customer's tracking page updates as you change this.</p></div>` : ""}`);
    $$("[data-set]", $("#aDrawerB")).forEach(b => b.addEventListener("click", () => { S.updateOrder(o.ref, { status: b.dataset.set }); orderDrawer(o.ref); toast(`<div><b>${o.ref} → ${S.STATUS_LABEL[b.dataset.set]}</b><small>Tracking page updated.</small></div>`); }));
    const pay = $("#odPay"); pay && pay.addEventListener("click", () => { S.updateOrder(o.ref, { payment: Object.assign({}, o.payment, { paid: o.total, status: "paid" }) }); orderDrawer(o.ref); toast(`<div><b>Balance recorded</b><small>${money(o.total - o.payment.paid)} received.</small></div>`); });
  }

  /* ================= KITCHEN ================= */
  let kDay = 0, dragging = false;
  function vKitchen() {
    $("#viewSub").textContent = "Drag a ticket to move it along. Customers see each move.";
    const COLS = [["confirmed", "To bake"], ["baking", "In the oven"], ["decorating", "Decorating"], ["ready", "Ready"], ["out", "Out / collected"], ["delivered", "Delivered"]];
    const d = dayIso(kDay);
    const list = db().orders.filter(o => o.date === d && isPre(o));
    const col = o => o.status === "received" ? "confirmed" : o.status === "collected" ? "out" : o.status;
    $("#view").innerHTML = `<div class="k-days">${[0, 1, 2, 3].map(i => { const di = dayIso(i), n = db().orders.filter(o => o.date === di && isPre(o)).length; return `<button class="chip ${i === kDay ? "is-on" : ""}" data-k="${i}">${i === 0 ? "Today" : i === 1 ? "Tomorrow" : S.fmtDate(di, { weekday: "long" })} <span class="n">${n}</span></button>`; }).join("")}</div>
      <div class="kanban">${COLS.map(c => { const cards = list.filter(o => col(o) === c[0]).sort((a, b) => a.slot.localeCompare(b.slot)); return `<section class="kcol" data-col="${c[0]}"><header><b>${c[1]}</b><span class="mono">${cards.length}</span></header><div class="kcards">${cards.map(o => `<article class="kcard" draggable="true" data-ref="${o.ref}">
          <div class="kc-top"><span class="mono">${esc(o.slot.slice(0, 5))}</span><span class="kc-m ${o.method}">${o.method === "delivery" ? "Delivery" : "Collect"}</span></div>
          ${o.items.map(it => `<div class="kc-item"><img src="${img(itemImg(it))}" alt=""><span><b>${it.qty > 1 ? it.qty + " × " : ""}${esc(itemName(it))}</b><small>${esc(it.opts && it.opts.custom ? it.opts.custom.summary.split(" · ").slice(0, 2).join(" · ") : [it.opts && it.opts.size && it.opts.size + "″", it.opts && it.opts.flavour].filter(Boolean).join(" · "))}</small>${it.opts && it.opts.message ? `<em>“${esc(it.opts.message)}”</em>` : ""}</span></div>`).join("")}
          <div class="kc-foot"><span>${esc(o.customer.name)}</span><span class="mono">${o.ref.slice(4)}</span></div>
          ${o.notes ? `<p class="kc-note">${esc(o.notes)}</p>` : ""}
          ${nextStatus(o) ? `<button class="kc-next" data-adv="${o.ref}">${S.STATUS_LABEL[nextStatus(o)]} →</button>` : ""}
        </article>`).join("")}</div></section>`; }).join("")}</div>`;
    $(".k-days").addEventListener("click", e => { const b = e.target.closest("[data-k]"); if (b) { kDay = +b.dataset.k; vKitchen(); } });
    $$(".kcard").forEach(c => {
      c.addEventListener("dragstart", e => { dragging = true; e.dataTransfer.setData("text/plain", c.dataset.ref); c.classList.add("drag"); });
      c.addEventListener("dragend", () => { dragging = false; c.classList.remove("drag"); });
      c.addEventListener("dblclick", () => orderDrawer(c.dataset.ref));
    });
    $$(".kcol").forEach(k => {
      k.addEventListener("dragover", e => { e.preventDefault(); k.classList.add("over"); });
      k.addEventListener("dragleave", () => k.classList.remove("over"));
      k.addEventListener("drop", e => {
        e.preventDefault(); k.classList.remove("over"); dragging = false;
        const ref = e.dataTransfer.getData("text/plain"), o = S.findOrder(ref); if (!o) return;
        let s = k.dataset.col; if (s === "out" && o.method === "collection") s = "collected"; if (s === "delivered" && o.method === "collection") s = "collected";
        S.updateOrder(ref, { status: s }); toast(`<div><b>${ref} → ${S.STATUS_LABEL[s]}</b><small>Tracking page updated.</small></div>`); vKitchen();
      });
    });
  }

  /* ================= COUNTER (POS) ================= */
  let ticket = [], tCust = null;
  function vCounter() {
    $("#viewSub").textContent = "Walk-in sales go into the same books as the website";
    const items = D.PRODUCTS.filter(p => ["viennoiserie", "patisserie", "confection"].includes(p.cat));
    $("#view").innerHTML = `<div class="pos">
      <section class="pos-grid card"><div class="opt-row" id="posCat">${[["all", "All"], ["viennoiserie", "Viennoiserie"], ["patisserie", "Pâtisserie"], ["confection", "Macarons & chocolate"]].map((c, i) => `<button class="chip ${i ? "" : "is-on"}" data-pc="${c[0]}">${c[1]}</button>`).join("")}</div>
        <div class="pos-items" id="posItems">${items.map(p => `<button class="pos-it" data-pi="${p.id}" data-cat="${p.cat}"><img src="${img(p.img)}" alt=""><b>${esc(p.name)}</b><span class="mono">${money(p.price)}</span></button>`).join("")}</div></section>
      <aside class="pos-side card" id="posSide"></aside></div>`;
    $("#posCat").addEventListener("click", e => { const b = e.target.closest("[data-pc]"); if (!b) return; $$("#posCat .chip").forEach(c => c.classList.toggle("is-on", c === b)); $$(".pos-it").forEach(it => it.hidden = b.dataset.pc !== "all" && it.dataset.cat !== b.dataset.pc); });
    $("#posItems").addEventListener("click", e => { const b = e.target.closest("[data-pi]"); if (!b) return; const ex = ticket.find(t => t.id === b.dataset.pi); ex ? ex.qty++ : ticket.push({ id: b.dataset.pi, qty: 1 }); b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); counterSide(); });
    counterSide();
  }
  function counterSide() {
    const side = $("#posSide"); if (!side) return;
    const total = sumBy(ticket, t => S.byId[t.id].price * t.qty);
    const todays = db().orders.filter(o => o.date === today() && o.channel === "walk-in");
    const ph = side.querySelector("#posPhone"), keep = ph ? ph.value : "";
    side.innerHTML = `<div class="card-head"><h2 class="h4">Ticket</h2><span class="muted small">${todays.length} sales today · ${money(sumBy(todays, o => o.total))}</span></div>
      <ul class="tk">${ticket.map(t => { const p = S.byId[t.id]; return `<li><span>${esc(p.name)}</span><span class="qty"><button data-tq="${t.id}" data-d="-1" aria-label="Fewer">−</button><span>${t.qty}</span><button data-tq="${t.id}" data-d="1" aria-label="More">+</button></span><span class="mono">${money(p.price * t.qty)}</span></li>`; }).join("") || `<li class="muted">Tap items to start a sale.</li>`}</ul>
      <div class="sum-row total"><span>Total</span><span class="mono">${money(total)}</span></div>
      <label class="field" style="margin-top:14px"><span>Customer's phone (optional)</span><input class="input" id="posPhone" type="tel" placeholder="Look up or add to the client list" value="${esc(keep)}"></label>
      <div id="posCust">${custHint(keep)}</div>
      <div class="pos-pay">${[["momo", "MoMo"], ["card", "Card"], ["cash", "Cash"]].map(m => `<button class="btn ${m[0] === "momo" ? "btn-pist" : "btn-ghost"}" data-pay="${m[0]}" ${ticket.length ? "" : "disabled"}>${m[1]}</button>`).join("")}</div>`;
    side.querySelector("#posPhone").addEventListener("input", e => { $("#posCust").innerHTML = custHint(e.target.value); });
  }
  function custHint(v) {
    const n = String(v || "").replace(/\D/g, "").slice(-9); tCust = null;
    if (n.length < 9) return "";
    const c = db().customers.find(x => x.phone && x.phone.replace(/\D/g, "").slice(-9) === n);
    if (!c) return `<p class="pos-hint">New customer. They'll be added to your client list.</p>`;
    tCust = c; const st = S.customerStats(c.id); const nxt = S.upcomingOccasions(60).find(x => x.c.id === c.id);
    return `<p class="pos-hint ok"><b>${esc(c.name)}</b>${c.vip ? " · VIP" : ""} · ${st.count} orders · ${money(st.spend)} lifetime${nxt ? `<br>${nxt.oc.type === "birthday" ? "Birthday" : "Anniversary"} (${esc(nxt.oc.who)}) in <b>${nxt.inDays} days</b>. Mention the Atelier!` : ""}</p>`;
  }
  document.addEventListener("click", e => {
    const q = e.target.closest("[data-tq]"); if (q) { const t = ticket.find(x => x.id === q.dataset.tq); t.qty += +q.dataset.d; if (t.qty <= 0) ticket = ticket.filter(x => x !== t); counterSide(); return; }
    const p = e.target.closest("[data-pay]"); if (p && ticket.length) {
      const total = sumBy(ticket, t => S.byId[t.id].price * t.qty);
      const phone = ($("#posPhone") || {}).value || "";
      const now = new Date(); const slot = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const o = { ref: S.makeRef(), own: true, channel: "walk-in", created: today(), date: today(), slot, customer: tCust ? { id: tCust.id, name: tCust.name, phone: tCust.phone } : { name: phone ? "Walk-in " + phone : "Walk-in guest", phone }, method: "counter", zone: null, fee: 0, items: ticket.map(t => ({ id: t.id, qty: t.qty, opts: {} })), subtotal: total, total, payment: { method: p.dataset.pay, status: "paid", paid: total }, status: "collected", notes: "" };
      if (!tCust && phone.replace(/\D/g, "").length >= 9) { const c = { id: "c" + Date.now(), own: true, name: "New walk-in", phone, area: "Walk-in", occasions: [], vip: false, since: today() }; db().customers.push(c); o.customer.id = c.id; }
      db().orders.push(o); S.save();
      ticket = []; tCust = null; if ($("#posPhone")) $("#posPhone").value = "";
      counterSide(); toast(`<div><b>Sale complete · ${money(total)}</b><small>${o.ref} · paid by ${p.dataset.pay === "momo" ? "MoMo" : p.dataset.pay}</small></div>`);
    }
  });

  /* ================= CALENDAR ================= */
  let calM = null, calSel = null;
  function vCalendar() {
    $("#viewSub").textContent = "Kitchen capacity: how many cakes (or tiers) each day can take";
    const t0 = S.today(); if (!calM) calM = new Date(t0.getFullYear(), t0.getMonth(), 1); if (!calSel) calSel = today();
    const y = calM.getFullYear(), m = calM.getMonth(), first = new Date(y, m, 1), start = (first.getDay() + 6) % 7, n = new Date(y, m + 1, 0).getDate();
    let cells = ""; for (let i = 0; i < start; i++) cells += "<span></span>";
    for (let d = 1; d <= n; d++) {
      const iso = S.iso(new Date(y, m, d)), st = S.dayState(iso, 1), os = db().orders.filter(o => o.date === iso && isPre(o));
      const r = st.cap ? Math.min(1, (st.used || 0) / st.cap) : 0;
      cells += `<button class="cday ${iso === today() ? "today" : ""} ${iso === calSel ? "is-on" : ""} ${!st.cap ? "closed" : ""}" data-cd="${iso}"><b>${d}</b>${st.cap ? `<span class="cbar"><i style="width:${r * 100}%;background:${r >= 1 ? "#9b2c52" : r >= 0.7 ? "#d99a3a" : "#8fa572"}"></i></span><small class="mono">${st.used || 0}/${st.cap}</small>` : `<small>Closed</small>`}${os.length ? `<em>${os.length} orders</em>` : ""}</button>`;
    }
    const s = S.dayState(calSel, 1), os = db().orders.filter(o => o.date === calSel && isPre(o));
    $("#view").innerHTML = `<div class="cal-wrap"><section class="card"><div class="card-head"><button class="close-x" data-cm="-1" aria-label="Previous month">←</button><h2 class="h4">${first.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</h2><button class="close-x" data-cm="1" aria-label="Next month">→</button></div>
      <div class="cgrid">${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(x => `<span class="dow">${x}</span>`).join("")}${cells}</div>
      <div class="legend"><span><i style="background:#8fa572"></i>Room</span><span><i style="background:#d99a3a"></i>70%+ booked</span><span><i style="background:#9b2c52"></i>Full</span></div></section>
      <aside class="card"><div class="card-head"><h2 class="h4">${S.fmtDate(calSel, { weekday: "long", day: "numeric", month: "long" })}</h2></div>
        <div class="cap-ctl"><span class="label">Capacity</span><div><button class="close-x" data-cap="-1" aria-label="Less capacity">−</button><b class="mono">${s.cap}</b><button class="close-x" data-cap="1" aria-label="More capacity">+</button></div><button class="btn btn-sm btn-ghost" data-cap="close">${s.cap ? "Close this day" : "Reopen"}</button></div>
        <p class="muted small">${s.cap ? `${s.used || 0} units booked, ${s.left} left. The website and Ama stop offering this day when it's full.` : "Closed: customers can't pick this date."}</p>
        <ul class="rows">${os.map(o => `<li class="row" data-open="${o.ref}"><span class="mono row-slot">${esc(o.slot.slice(0, 5))}</span><img src="${img(itemImg(o.items[0]))}" alt=""><span class="row-main"><b>${esc(o.customer.name)}</b><small>${esc(itemName(o.items[0]))}</small></span>${pill(o.status)}</li>`).join("") || `<li class="muted">No pre-orders yet.</li>`}</ul></aside></div>`;
    $("#view").onclick = e => {
      const cm = e.target.closest("[data-cm]"); if (cm) { calM = new Date(y, m + (+cm.dataset.cm), 1); vCalendar(); return; }
      const cd = e.target.closest("[data-cd]"); if (cd) { calSel = cd.dataset.cd; vCalendar(); return; }
      const cp = e.target.closest("[data-cap]"); if (cp) { const v = cp.dataset.cap; const cur = S.capFor(calSel); S.setCapacity(calSel, v === "close" ? (cur ? 0 : B.capacityByDay[S.parse(calSel).getDay()] || 8) : Math.max(0, cur + (+v))); vCalendar(); }
    };
  }

  /* ================= CLIENTS ================= */
  let cQ = "";
  function vClients() {
    $("#viewSub").textContent = "Who they are, what they ordered, and what's coming up";
    const occ = S.upcomingOccasions(30);
    const pending = occ.filter(x => !db().reminders[x.c.id + x.oc.md]);
    $("#view").innerHTML = `<section class="card"><div class="card-head"><h2 class="h4">Occasion reminders, next 30 days</h2><span class="muted small">${pending.length} to send · ${occ.length - pending.length} sent</span></div>
      <p class="muted small" style="margin-top:-6px">Each one opens WhatsApp with a message that mentions last year's cake. Customers who get a reminder re-order about four times as often.</p>
      <ul class="rows two-col">${pending.slice(0, 8).map(remRow).join("") || `<li class="muted">All caught up.</li>`}</ul></section>
      <section class="card"><div class="card-head"><h2 class="h4">Clients <span class="muted small">${db().customers.length}</span></h2><input class="input sm" id="cQ" type="search" placeholder="Search name, area, phone" value="${esc(cQ)}"></div><div id="cTable"></div></section>`;
    drawClients();
    $("#cQ").addEventListener("input", e => { cQ = e.target.value; drawClients(); });
  }
  function drawClients() {
    const q = cQ.toLowerCase();
    const rows = db().customers.filter(c => !q || (c.name + " " + c.area + " " + c.phone).toLowerCase().includes(q)).map(c => { const st = S.customerStats(c.id); const nx = S.upcomingOccasions(365).find(x => x.c.id === c.id); return { c, st, nx }; }).sort((a, b) => b.st.spend - a.st.spend);
    $("#cTable").innerHTML = `<div class="otable ctable"><div class="otr oth"><span>Client</span><span>Area</span><span>Orders</span><span>Lifetime</span><span>Latest order</span><span>Next occasion</span></div>
      ${rows.slice(0, 80).map(r => `<button class="otr" data-client="${r.c.id}"><span><b>${esc(r.c.name)}</b>${r.c.vip ? `<em class="vip">VIP</em>` : ""}<small>${esc(r.c.phone || "")}</small></span><span>${esc(r.c.area || "")}</span><span class="mono">${r.st.count}</span><span class="mono">${money(r.st.spend)}</span><span>${r.st.last ? S.fmtDate(r.st.last, { day: "numeric", month: "short" }) : "—"}</span><span>${r.nx ? `${r.nx.oc.type === "birthday" ? "Birthday" : "Anniversary"} · <b>${r.nx.inDays}d</b>` : "—"}</span></button>`).join("")}</div>`;
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-client]"); if (!b) return;
    const c = db().customers.find(x => x.id === b.dataset.client), st = S.customerStats(c.id);
    const fav = {}; st.orders.forEach(o => o.items.forEach(it => fav[it.id] = (fav[it.id] || 0) + it.qty)); const top = Object.entries(fav).sort((a, b) => b[1] - a[1]).slice(0, 3);
    openDrawer(c.name, `<div class="od-block"><span class="label">Client since ${S.fmtDate(c.since, { month: "long", year: "numeric" })}</span><b class="h4">${esc(c.name)}${c.vip ? ' <em class="vip">VIP</em>' : ""}</b><p class="muted small">${esc(c.phone || "")} · ${esc(c.email || "")} · ${esc(c.area || "")}</p>${c.phone ? `<a class="btn btn-sm btn-pist" target="_blank" rel="noopener" href="${wa(c.phone, `Hello ${c.name.split(" ")[0]}, it's Esi from Cindy's Cake House.`)}">WhatsApp</a>` : ""}</div>
      <div class="kpis mini"><div class="kpi"><span class="label">Orders</span><b>${st.count}</b></div><div class="kpi"><span class="label">Lifetime</span><b>${money(st.spend)}</b></div><div class="kpi"><span class="label">Average</span><b>${money(st.count ? st.spend / st.count : 0)}</b></div></div>
      <div class="od-block"><span class="label">Occasions</span>${c.occasions.length ? c.occasions.map(oc => `<div class="kv"><span>${oc.type === "birthday" ? "Birthday" : oc.type === "anniversary" ? "Anniversary" : "Occasion"} · ${esc(oc.who)}</span><span>${S.fmtDate("2026-" + oc.md, { day: "numeric", month: "long" })}</span></div>`).join("") : `<p class="muted small">None saved yet.</p>`}</div>
      ${top.length ? `<div class="od-block"><span class="label">Favourites</span>${top.map(([id, n]) => `<div class="done-item"><img src="${img(S.byId[id].img)}" alt=""><span>${esc(S.byId[id].name)} · ${n}×</span></div>`).join("")}</div>` : ""}
      <div class="od-block"><span class="label">History</span>${st.orders.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8).map(o => `<div class="kv" data-open="${o.ref}" style="cursor:pointer"><span>${S.fmtDate(o.date, { day: "numeric", month: "short", year: "2-digit" })} · ${esc(itemName(o.items[0]))}</span><span class="mono">${money(o.total)}</span></div>`).join("") || `<p class="muted small">No orders yet.</p>`}</div>`);
  });

  /* ================= INSIGHTS ================= */
  function vInsights() {
    $("#viewSub").textContent = "Last 30 days, every channel";
    const t = today(), from = dayIso(-29), O = db().orders.filter(o => inRange(o, from, t));
    const rev = sumBy(O, o => o.total), web = O.filter(o => o.channel === "web");
    const byCh = {}; O.forEach(o => byCh[o.channel] = (byCh[o.channel] || 0) + o.total);
    const prod = {}; O.forEach(o => o.items.forEach(it => { if (it.opts && it.opts.custom) { prod["Atelier commissions"] = (prod["Atelier commissions"] || 0) + it.opts.custom.price * it.qty; return; } const p = S.byId[it.id]; if (p) prod[p.name] = (prod[p.name] || 0) + S.unitPrice(p, it.opts) * it.qty; }));
    const area = {}; O.filter(o => o.zone).forEach(o => { const z = D.ZONES.find(x => x.id === o.zone); area[z.name] = (area[z.name] || 0) + 1; });
    const custs = {}; db().orders.forEach(o => o.customer.id && (custs[o.customer.id] = (custs[o.customer.id] || 0) + 1));
    const repeat = Object.values(custs).filter(n => n > 1).length / Math.max(1, Object.keys(custs).length);
    const paid = web.length, f = [["Website visits", paid * 41], ["Viewed a cake", paid * 15], ["Added to bag", paid * 3.4 | 0], ["Started checkout", paid * 1.7 | 0], ["Paid", paid]];
    const days = revenueDays(30), chart = stackedBars(days);
    $("#view").innerHTML = `<section class="kpis">
        <div class="kpi card"><span class="label">Revenue</span><b>${money(rev)}</b><small>${O.length} orders</small></div>
        <div class="kpi card"><span class="label">Average pre-order</span><b>${money(sumBy(O.filter(isPre), o => o.total) / Math.max(1, O.filter(isPre).length))}</b><small>Counter ticket ${money(sumBy(O.filter(o => !isPre(o)), o => o.total) / Math.max(1, O.filter(o => !isPre(o)).length))}</small></div>
        <div class="kpi card"><span class="label">Repeat clients</span><b>${Math.round(repeat * 100)}%</b><small>ordered more than once</small></div>
        <div class="kpi card"><span class="label">Ama, the concierge</span><b>${paid * 6 + 37}</b><small>conversations · ${Math.round(paid * 1.3) + 4} became orders</small></div>
      </section>
      <section class="card chart-card" id="rev30"><div class="card-head"><h2 class="h4">Revenue by day and channel</h2></div>${chart.html}</section>
      <div class="two">
        <section class="card"><div class="card-head"><h2 class="h4">Revenue by channel</h2></div>${hbars(Object.entries(byCh).sort((a, b) => b[1] - a[1]).map(([k, v]) => [CH[k] || k, v]), money)}</section>
        <section class="card"><div class="card-head"><h2 class="h4">Top creations by revenue</h2></div>${hbars(Object.entries(prod).sort((a, b) => b[1] - a[1]).slice(0, 8), money)}</section>
        <section class="card"><div class="card-head"><h2 class="h4">Deliveries by area</h2></div>${hbars(Object.entries(area).sort((a, b) => b[1] - a[1]).slice(0, 8))}</section>
        <section class="card"><div class="card-head"><h2 class="h4">Website funnel</h2><span class="muted small">${(paid / f[0][1] * 100).toFixed(1)}% of visits order</span></div>${hbars(f.map(x => [x[0], Math.round(x[1])]), v => v.toLocaleString("en-GB"))}</section>
      </div>
      <section class="card"><div class="card-head"><h2 class="h4">How people find the website</h2><span class="muted small">Google Search Console & analytics, last 30 days</span></div>
        <div class="otable seo"><div class="otr oth"><span>Search</span><span>Clicks</span><span>Position</span></div>${[["wedding cake accra", 412, 2.1], ["birthday cake east legon", 268, 1.6], ["cake delivery cantonments", 231, 1.2], ["custom cake accra", 199, 3.4], ["cindy's cake house", 188, 1], ["knocking ceremony cake", 97, 2.3], ["pastry shop accra", 86, 4.8], ["macarons accra", 61, 2.7]].map(r => `<div class="otr"><span>${r[0]}</span><span class="mono">${r[1]}</span><span class="mono">${r[2].toFixed(1)}</span></div>`).join("")}</div>
        <p class="muted small" style="margin:12px 0 0">Every page has its own title, description and structured data (Bakery schema), so Google shows prices, hours and the address directly in results.</p></section>`;
    bindChart($("#rev30"), chart);
  }

  /* ================= ASSISTANT ================= */
  const SUGG = ["How did we do this week?", "Who should I remind this week?", "What sold best this month?", "What should we bake more of tomorrow?", "How busy is Saturday?", "Who still owes a balance?", "Which area orders the most?", "Draft an Instagram post for the pistachio mille-feuille"];
  let chatLog = null;
  function vAssistant() {
    $("#viewSub").textContent = "Ask about your business in plain words. It reads your live orders, clients and calendar.";
    $("#view").innerHTML = `<section class="card asst"><div class="asst-log" id="aLog"></div><div class="cc-quick asst-q">${SUGG.map(s => `<button>${esc(s)}</button>`).join("")}</div><form class="asst-form" id="aForm"><input class="input" id="aIn" placeholder="Ask anything about orders, money, clients or the kitchen" autocomplete="off"><button class="btn btn-pist" type="submit">Ask</button></form></section>`;
    const log = $("#aLog");
    if (chatLog) log.innerHTML = chatLog; else bot(`<p>${greet()}, Cindy. I've read today's orders, the kitchen diary and all ${db().customers.length} clients. Ask me anything, or tap a question below.</p>`);
    $(".asst-q").addEventListener("click", e => { const b = e.target.closest("button"); b && ask(b.textContent); });
    $("#aForm").addEventListener("submit", e => { e.preventDefault(); const v = $("#aIn").value.trim(); if (v) { $("#aIn").value = ""; ask(v); } });
    function bot(html) { const t = document.createElement("div"); t.className = "msg bot"; t.innerHTML = html; log.appendChild(t); log.scrollTop = log.scrollHeight; chatLog = log.innerHTML; }
    function ask(q) { const m = document.createElement("div"); m.className = "msg me"; m.textContent = q; log.appendChild(m); const ty = document.createElement("div"); ty.className = "msg bot typing"; ty.innerHTML = "<i></i><i></i><i></i>"; log.appendChild(ty); log.scrollTop = log.scrollHeight; setTimeout(() => { ty.remove(); bot(brain(q)); }, 650); }
  }
  function brain(raw) {
    const q = raw.toLowerCase(), O = db().orders, t = today();
    const P = s => `<p>${s}</p>`;
    const rng = /yesterday/.test(q) ? [dayIso(-1), dayIso(-1), "yesterday"] : /today/.test(q) ? [t, t, "today"] : /month/.test(q) ? [dayIso(-29), t, "the last 30 days"] : [dayIso(-6), t, "the last 7 days"];
    if (/insta|post|caption|social/.test(q)) {
      const p = D.PRODUCTS.find(x => q.includes(x.name.toLowerCase().split(" ")[0]) && x.name.toLowerCase().split(" ").some(w => w.length > 4 && q.includes(w))) || S.byId["pat-pistachio-millefeuille"];
      return P(`Here's a draft for <b>${esc(p.name)}</b>:`) + `<div class="draft"><img src="${img(p.img)}" alt=""><p>${esc(p.name)}, ${esc(p.line.charAt(0).toLowerCase() + p.line.slice(1))}. ${p.leadDays ? `Order ${p.leadDays > 1 ? p.leadDays + " days" : "a day"} ahead` : "On the counter from 7:30 until it's gone"} · ${money(p.price)} · ${esc(p.unit || "")}.<br><br>Delivered across Accra, complimentary in Cantonments. Link in bio, or ask Ama on our site.<br><br>#AccraEats #CantonmentsAccra #AccraCakes #PâtisserieAccra #CindysCakeHouse</p></div>` + P("Best time to post: Thursday 6–7pm, when your Instagram orders spike before the weekend.");
    }
    if (/remind|occasion|birthday|anniversar/.test(q)) {
      const occ = S.upcomingOccasions(/month/.test(q) ? 30 : 10).filter(x => !db().reminders[x.c.id + x.oc.md]);
      if (!occ.length) return P("Nobody to remind in that window. You're all caught up.");
      return P(`<b>${occ.length} reminders</b> worth sending:`) + `<ul>${occ.slice(0, 6).map(x => `<li><b>${esc(x.c.name)}</b>: ${esc(x.oc.who)}'s ${x.oc.type === "birthday" ? "birthday" : "anniversary"} in ${x.inDays} days. Last time: ${esc((S.byId[x.oc.last] || {}).name || "a custom cake")}.</li>`).join("")}</ul>` + P(`<a href="#clients">Open the reminder list →</a> Each one opens WhatsApp with the message already written.`);
    }
    if (/best|top|sold|popular|seller/.test(q)) {
      const c = {}; O.filter(o => inRange(o, rng[0], rng[1])).forEach(o => o.items.forEach(it => { const n = itemName(it); c[n] = (c[n] || 0) + it.qty; }));
      const top = Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 5);
      return P(`Best sellers over ${rng[2]}, by units:`) + `<ol>${top.map(([n, v]) => `<li>${esc(n)}: <b>${v}</b></li>`).join("")}</ol>` + P(top[0] ? `${esc(top[0][0])} is carrying the counter. Worth featuring in the next post.` : "");
    }
    if (/bake more|prep|tomorrow|forecast|how many should/.test(q)) {
      const tm = dayIso(1), pre = O.filter(o => o.date === tm && isPre(o));
      const dow = S.parse(tm).getDay(), past = [7, 14, 21].map(n => dayIso(1 - n));
      const cnt = {}; O.filter(o => past.includes(o.date) && !isPre(o)).forEach(o => o.items.forEach(it => cnt[it.id] = (cnt[it.id] || 0) + it.qty));
      const top = Object.entries(cnt).map(([id, n]) => [id, Math.ceil(n / 3 * 1.15)]).sort((a, b) => b[1] - a[1]).slice(0, 6);
      return P(`Tomorrow (${S.fmtDate(tm, { weekday: "long" })}) has <b>${pre.length} pre-orders</b>${pre.length ? `: ${pre.map(o => esc(itemName(o.items[0]))).slice(0, 4).join(", ")}${pre.length > 4 ? "…" : ""}` : ""}.`) + P(`For the counter, based on the last three ${S.fmtDate(tm, { weekday: "long" })}s plus 15% headroom:`) + `<ul>${top.map(([id, n]) => `<li>${esc(S.byId[id].name)}: <b>${n}</b></li>`).join("")}</ul>` + (dow === 6 ? P("Saturdays sell out by 2pm, so bake the top two a little heavier.") : "");
    }
    const dt = (() => { const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]; for (let i = 0; i < 7; i++) if (q.includes(days[i])) { let n = (i - S.today().getDay() + 7) % 7 || 7; return dayIso(n); } if (/tomorrow/.test(q)) return dayIso(1); return null; })();
    if (dt && /busy|capacity|full|room|slot|how many/.test(q) || /busy|capacity/.test(q)) {
      const d = dt || dayIso(1), s = S.dayState(d, 1), os = O.filter(o => o.date === d && isPre(o));
      return P(`${S.fmtDate(d, { weekday: "long", day: "numeric", month: "short" })}: <b>${s.used || 0} of ${s.cap}</b> cake slots booked across ${os.length} orders, worth ${money(sumBy(os, o => o.total))}.`) + P(s.state === "full" ? "It's full. The website has stopped offering it." : s.state === "limited" ? `Only ${s.left} left. Want to close it so the team gets a calmer day? You can in <a href="#calendar">Calendar</a>.` : `${s.left} slots still open.`);
    }
    if (/owe|balance|unpaid|deposit|outstanding/.test(q)) {
      const L = O.filter(o => isPre(o) && o.date >= t && o.payment.paid < o.total).sort((a, b) => a.date.localeCompare(b.date));
      const soon = L.filter(o => o.date <= dayIso(3));
      return P(`<b>${money(sumBy(L, o => o.total - o.payment.paid))}</b> outstanding across ${L.length} orders. Due in the next 3 days:`) + `<ul>${soon.slice(0, 6).map(o => `<li><a href="#orders" data-open="${o.ref}">${esc(o.customer.name)}</a>, ${S.fmtDate(o.date)}: ${money(o.total - o.payment.paid)}</li>`).join("") || "<li>None.</li>"}</ul>` + P("Esi can send the balance link from each order.");
    }
    if (/area|where|neighbourhood|zone|location/.test(q)) {
      const a = {}; O.filter(o => o.zone && inRange(o, dayIso(-29), t)).forEach(o => { const z = D.ZONES.find(x => x.id === o.zone).name; a[z] = (a[z] || 0) + o.total; });
      const top = Object.entries(a).sort((x, y) => y[1] - x[1]).slice(0, 4);
      return P("Delivery revenue by area, last 30 days:") + `<ol>${top.map(([n, v]) => `<li>${esc(n)}: <b>${money(v)}</b></li>`).join("")}</ol>` + P(top[0] ? `${esc(top[0][0])} leads. A small Instagram ad targeting it would likely pay back.` : "");
    }
    if (/walk|counter|shop|in-store|in store/.test(q)) {
      const L = O.filter(o => o.channel === "walk-in" && inRange(o, rng[0], rng[1]));
      return P(`Counter over ${rng[2]}: <b>${money(sumBy(L, o => o.total))}</b> from ${L.length} sales, average ticket ${money(sumBy(L, o => o.total) / Math.max(1, L.length))}.`) + P(`${Math.round(L.filter(o => o.customer.id).length / Math.max(1, L.length) * 100)}% of walk-ins gave a phone number, so they're now on your client list.`);
    }
    if (/revenue|money|made|make|sales|week|how did we|earn|income|turnover/.test(q)) {
      const L = O.filter(o => inRange(o, rng[0], rng[1])), prev = O.filter(o => rng[2] === "the last 7 days" && inRange(o, dayIso(-13), dayIso(-7)));
      const by = {}; L.forEach(o => by[chGroup(o.channel)] = (by[chGroup(o.channel)] || 0) + o.total);
      const tot = sumBy(L, o => o.total), ptot = sumBy(prev, o => o.total);
      return P(`Over ${rng[2]} you took <b>${money(tot)}</b> from ${L.length} orders${ptot ? `, ${tot >= ptot ? "up" : "down"} ${Math.abs(Math.round((tot - ptot) / ptot * 100))}% on the week before` : ""}.`) + `<ul><li>Website: ${money(by.online || 0)}</li><li>WhatsApp, Instagram & phone: ${money(by.messages || 0)}</li><li>Counter: ${money(by.counter || 0)}</li></ul>` + P(`The website brought in ${Math.round((by.online || 0) / Math.max(1, tot) * 100)}% without anyone answering a message.`);
    }
    return P("I can answer questions about revenue, best sellers, the kitchen diary, balances, clients and their occasions, areas, the counter, and draft posts. Try one of the suggestions below.");
  }

  /* ================= INBOX ================= */
  function messages() {
    const own = (db().messages || []).map((m, i) => Object.assign({ id: "m" + i, via: "Website form" }, m));
    const seeded = [
      { id: "s1", at: dayIso(0) + "T08:12", name: "Akua Sarpong", phone: "+233 24 555 0192", about: "Corporate gifting", msg: "We'd like 40 Pistachio Ribbon Boxes for our clients on the 20th, delivered to Ridge. Can you add our logo to the card?", via: "Website form", read: false },
      { id: "s2", at: dayIso(0) + "T07:40", name: "Ama (concierge)", phone: "", about: "Hand-off", msg: "Customer asked about a 5-tier wedding cake for 260 guests on a fully booked Saturday in December. Suggested the Friday and a tasting; they want Cindy to call.", via: "Ama hand-off", read: false },
      { id: "s3", at: dayIso(-1) + "T19:05", name: "Kojo Mensah", phone: "+233 55 302 8841", about: "An existing order", msg: "Can we change the message on tomorrow's cake to 'Happy 40th, Kojo'? Thank you!", via: "WhatsApp", read: true }
    ];
    return own.reverse().concat(seeded);
  }
  function vInbox() {
    $("#viewSub").textContent = "Website form, WhatsApp and Ama's hand-offs in one list";
    $("#view").innerHTML = `<section class="card"><ul class="inbox">${messages().map(m => `<li class="${m.read ? "" : "unread"}"><div class="ib-top"><b>${esc(m.name)}</b><span class="ch ch-${m.via === "Ama hand-off" ? "counter" : m.via === "WhatsApp" ? "messages" : "online"}">${esc(m.via)}</span><span class="muted small">${esc(m.about)} · ${new Date(m.at).toLocaleString("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit" })}</span></div><p>${esc(m.msg)}</p>${m.phone ? `<a class="btn btn-sm btn-ghost" target="_blank" rel="noopener" href="${wa(m.phone, `Hello ${m.name.split(" ")[0]}, it's Esi from Cindy's Cake House.`)}">Reply on WhatsApp</a>` : ""}</li>`).join("")}</ul></section>`;
  }

  if (signedIn) enter(); // after every view is defined
})();
