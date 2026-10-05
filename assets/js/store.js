/* ==========================================================================
   Store: cart, orders, customers and capacity, kept in localStorage so the
   public site and the owner's dashboard (admin/) share one "database".
   A realistic demo history is generated on first visit, and again each new
   day, so the dashboard always looks current. Orders placed on the site
   are flagged own:true and kept across reseeds.
   ========================================================================== */
window.CCHStore = (function () {
  const D = window.CCH;
  const KEY = "cch.v1";
  const CART = "cch.cart.v1";
  const byId = Object.fromEntries(D.PRODUCTS.map(p => [p.id, p]));
  const SLOTS = ["08:00 – 10:00", "10:00 – 12:00", "12:00 – 14:00", "14:00 – 16:00", "16:00 – 18:00", "18:00 – 20:00"];
  const STATUS = ["received", "confirmed", "baking", "decorating", "ready", "out", "delivered"];
  const STATUS_LABEL = { received: "Received", confirmed: "Deposit confirmed", baking: "In the oven", decorating: "Decorating", ready: "Ready", out: "Out for delivery", delivered: "Delivered", collected: "Collected" };

  /* ---------- small utils ---------- */
  const safe = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const pad = n => String(n).padStart(2, "0");
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const parse = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const money = n => "GHS " + Math.round(n).toLocaleString("en-GB");
  const fmtDate = (s, o) => parse(s).toLocaleDateString("en-GB", o || { weekday: "short", day: "numeric", month: "short" });
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function makeRef(r) { const a = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; let s = "CCH-"; for (let i = 0; i < 5; i++) s += a[Math.floor((r ? r() : Math.random()) * a.length)]; return s; }

  /* ---------- pricing ---------- */
  function unitPrice(p, opts) {
    if (opts && opts.custom) return opts.custom.price;
    let price = p.price;
    if (p.sizes && opts && opts.size) { const s = D.SIZES.find(x => x.id === opts.size); if (s) price = Math.round(p.price * s.mult / 10) * 10; }
    return price;
  }
  function units(p, opts, qty) { // production "units" a line consumes on its due day
    if (opts && opts.custom) return opts.custom.tiers * qty;
    if (p.cat === "wedding") return (p.tiers || 2) * qty;
    if (p.cat === "couture" || p.cat === "gifting" && p.flavours) return qty;
    if (p.cat === "events" && p.setup) return 4;
    return 0;
  }

  /* ---------- seed ---------- */
  const FIRST = ["Abena", "Akosua", "Ama", "Efua", "Esi", "Adwoa", "Yaa", "Afia", "Nana", "Naa", "Dede", "Kukua", "Selorm", "Delali", "Nadia", "Maame", "Kwame", "Kofi", "Kojo", "Kwesi", "Yaw", "Nii", "Fiifi", "Edem", "Elikem", "Kwabena"];
  const LAST = ["Mensah", "Owusu", "Boateng", "Asante", "Agyeman", "Osei", "Addo", "Quaye", "Tetteh", "Ampofo", "Darko", "Danquah", "Bonsu", "Amoako", "Sarpong", "Frimpong", "Lartey", "Nkansah", "Aidoo", "Ofori", "Antwi", "Badu", "Kyei", "Acquah", "Annan", "Djan"];
  const WHO = ["Daughter, Ama", "Son, Kobby", "Husband", "Wife", "Mother", "Daughter, Naana", "Son, Kwaku", "Wedding anniversary", "Self", "Twins, Esi & Ekua", "Father", "Business anniversary"];

  function seed() {
    const r = rng(20261004);
    const t0 = today();
    const pick = a => a[Math.floor(r() * a.length)];
    const zones = D.ZONES;
    const customers = [];
    for (let i = 0; i < 140; i++) {
      const fn = FIRST[i % FIRST.length], ln = LAST[(i * 7 + Math.floor(i / 26) * 5 + 3) % LAST.length];
      const zone = zones[Math.min(zones.length - 1, Math.floor(Math.pow(r(), 1.6) * zones.length))];
      const occ = [];
      const nOcc = 1 + Math.floor(r() * 2);
      for (let k = 0; k < nOcc; k++) {
        const offset = Math.floor(r() * 365) - 20; // some within the next weeks
        const od = addDays(t0, i < 9 && k === 0 ? 4 + i * 3 : offset);
        occ.push({ type: k === 0 && r() > 0.3 ? "birthday" : "anniversary", who: pick(WHO), md: `${pad(od.getMonth() + 1)}-${pad(od.getDate())}`, last: pick(["cel-red-velvet", "cel-lambeth-rose", "kid-under-the-sea", "cel-meringue-crown", "cel-hexagon-garden", "cel-funfetti", "cel-pink-gilded", "kid-princess-castle", "cel-gilded-rose", "cel-ganache-noir"]) });
      }
      customers.push({
        id: "c" + (100 + i), name: `${fn} ${ln}`, phone: `+233 ${pick(["24", "54", "55", "20", "50", "59"])} ${Math.floor(100 + r() * 899)} ${Math.floor(1000 + r() * 8999)}`,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${pick(["gmail.com", "yahoo.com", "outlook.com", "icloud.com"])}`,
        area: zone.name, zone: zone.id, occasions: occ, vip: r() > 0.78, since: iso(addDays(t0, -Math.floor(60 + r() * 1400)))
      });
    }
    const orders = [];
    const cakeIds = D.PRODUCTS.filter(p => p.cat === "couture").map(p => p.id);
    const weddIds = D.PRODUCTS.filter(p => p.cat === "wedding" && !p.booking).map(p => p.id);
    const evtIds = D.PRODUCTS.filter(p => p.cat === "events" || p.cat === "gifting" || p.cat === "confection").map(p => p.id);
    const counterIds = D.PRODUCTS.filter(p => p.cat === "patisserie" || p.cat === "viennoiserie" || p.cat === "confection").map(p => p.id);
    const channelW = [["web", 0.52], ["whatsapp", 0.24], ["instagram", 0.14], ["phone", 0.1]];
    const chan = () => { let x = r(), a = 0; for (const [c, w] of channelW) { a += w; if (x < a) return c; } return "web"; };

    // pre-orders from 34 days ago to 24 days ahead
    const usedSeed = {};
    for (let d = -34; d <= 24; d++) {
      const day = addDays(t0, d);
      const dow = day.getDay();
      let n = dow === 6 ? 7 : dow === 5 ? 5 : dow === 0 ? 3 : dow === 1 ? 2 : 3;
      if (d > 0) n = Math.max(0, Math.round(n * (d < 8 ? 1 : d < 15 ? 0.8 : 0.45)));
      for (let k = 0; k < n; k++) {
        const c = customers[Math.floor(Math.pow(r(), 1.8) * customers.length)];
        const roll = r();
        let items;
        if (roll < 0.1 && (dow === 6 || dow === 5)) {
          const p = byId[pick(weddIds)]; items = [{ id: p.id, qty: 1, opts: { flavour: pick(D.FLAVOURS) } }];
        } else if (roll < 0.72) {
          const p = byId[pick(cakeIds)]; const sz = p.sizes ? pick(["6", "6", "8", "8", "10"]) : undefined;
          items = [{ id: p.id, qty: 1, opts: { size: sz, flavour: p.flavours ? pick(D.FLAVOURS) : undefined, message: r() > 0.5 ? pick(["Happy birthday, Maame", "Afehyia pa!", "Happy 40th, Kojo", "Congratulations Dr. Esi", "Happy anniversary", "Welcome, baby Nhyira"]) : undefined } }];
          if (r() > 0.6) items.push({ id: pick(evtIds), qty: 1, opts: {} });
        } else {
          items = [{ id: pick(evtIds), qty: 1 + Math.floor(r() * 2), opts: {} }];
        }
        // never seed a future day beyond what the kitchen can make
        const need = items.reduce((s, it) => s + units(byId[it.id], it.opts, it.qty), 0);
        const capDay = D.BUSINESS.capacityByDay[dow];
        if (d >= 0 && (usedSeed[iso(day)] || 0) + need > capDay) continue;
        usedSeed[iso(day)] = (usedSeed[iso(day)] || 0) + need;
        const sub = items.reduce((s, it) => s + unitPrice(byId[it.id], it.opts) * it.qty, 0);
        const delivery = r() > 0.32;
        const zone = delivery ? D.ZONES.find(z => z.id === c.zone) : null;
        const setup = items.some(it => byId[it.id].setup) && delivery ? D.SETUP_FEE : 0;
        const fee = (zone ? zone.fee : 0) + setup;
        const created = addDays(day, -Math.max(1, Math.floor((byId[items[0].id].leadDays || 1) + r() * 6)));
        let status;
        if (d < 0) status = delivery ? "delivered" : "collected";
        else if (d === 0) status = pick(["decorating", "ready", delivery ? "out" : "ready", "baking", delivery ? "delivered" : "collected"]);
        else if (d === 1) status = pick(["baking", "confirmed", "confirmed"]);
        else status = r() > 0.15 ? "confirmed" : "received";
        const total = sub + fee;
        const full = d < 0 || r() > 0.6;
        orders.push({
          ref: makeRef(r), own: false, channel: chan(), created: iso(created), date: iso(day), slot: pick(SLOTS),
          customer: { id: c.id, name: c.name, phone: c.phone, email: c.email },
          method: delivery ? "delivery" : "collection", zone: zone ? zone.id : null, fee, items, subtotal: sub, total,
          payment: { method: pick(["momo", "momo", "momo", "card", "card", "arrival"]), status: full ? "paid" : status === "received" ? "pending" : "deposit", paid: full ? total : status === "received" ? 0 : Math.round(total * D.BUSINESS.depositRate) },
          status, notes: r() > 0.85 ? pick(["Nut-free please", "Gate code 2241", "Call on arrival", "Surprise, do not call the recipient", "Deliver to the reception desk"]) : ""
        });
      }
    }
    // walk-in counter sales, past 21 days and this morning
    for (let d = -21; d <= 0; d++) {
      const day = addDays(t0, d);
      const mon = day.getDay() === 1;
      const n = d === 0 ? 9 : mon ? 5 + Math.floor(r() * 4) : 10 + Math.floor(r() * 9);
      for (let k = 0; k < n; k++) {
        const nItems = 1 + Math.floor(r() * 3);
        const items = [];
        for (let j = 0; j < nItems; j++) items.push({ id: pick(counterIds), qty: 1 + Math.floor(r() * 2), opts: {} });
        const sub = items.reduce((s, it) => s + byId[it.id].price * it.qty, 0);
        const known = r() > 0.55 ? customers[Math.floor(r() * customers.length)] : null;
        orders.push({ ref: makeRef(r), own: false, channel: "walk-in", created: iso(day), date: iso(day), slot: `${pad(8 + Math.floor(r() * 11))}:${pad(Math.floor(r() * 60))}`, customer: known ? { id: known.id, name: known.name, phone: known.phone } : { name: "Walk-in guest" }, method: "counter", zone: null, fee: 0, items, subtotal: sub, total: sub, payment: { method: pick(["momo", "momo", "card", "cash"]), status: "paid", paid: sub }, status: "collected", notes: "" });
      }
    }
    return { seededOn: iso(t0), customers, orders, capacity: {}, reminders: {} };
  }

  /* ---------- load / save ---------- */
  let db = safe.get(KEY, null);
  if (!db || db.seededOn !== iso(today())) {
    const own = db ? db.orders.filter(o => o.own) : [];
    const ownCustomers = db ? db.customers.filter(c => c.own) : [];
    const keepCap = db ? db.capacity : {};
    const keepMsgs = db && db.messages ? db.messages.filter(m => m.own) : [];
    db = seed();
    db.orders = db.orders.concat(own);
    db.customers = db.customers.concat(ownCustomers);
    db.capacity = keepCap || {};
    db.messages = keepMsgs;
    safe.set(KEY, db);
  }
  const save = () => { safe.set(KEY, db); window.dispatchEvent(new CustomEvent("cch:db")); };
  // another tab (e.g. the owner's dashboard) changed the data: pick it up live
  window.addEventListener("storage", e => {
    if (e.key === KEY && e.newValue) { try { db = JSON.parse(e.newValue); window.dispatchEvent(new CustomEvent("cch:db")); } catch (x) {} }
    if (e.key === CART) { try { cart = JSON.parse(e.newValue || "[]"); window.dispatchEvent(new CustomEvent("cch:cart", { detail: cart })); } catch (x) {} }
  });

  /* ---------- cart ---------- */
  let cart = safe.get(CART, []);
  const saveCart = () => { safe.set(CART, cart); window.dispatchEvent(new CustomEvent("cch:cart", { detail: cart })); };
  function lineKey(id, opts) { return id + "|" + JSON.stringify(opts || {}); }
  function addToCart(id, opts, qty) {
    opts = opts || {}; qty = qty || 1;
    Object.keys(opts).forEach(k => (opts[k] === undefined || opts[k] === "") && delete opts[k]);
    const key = opts.custom ? id + "|" + Date.now() : lineKey(id, opts);
    const ex = cart.find(l => l.key === key);
    if (ex) ex.qty += qty; else cart.push({ key, id, qty, opts });
    saveCart();
    return key;
  }
  function setQty(key, qty) { const l = cart.find(x => x.key === key); if (!l) return; l.qty = Math.max(0, qty); if (!l.qty) cart = cart.filter(x => x !== l); saveCart(); }
  function removeLine(key) { cart = cart.filter(x => x.key !== key); saveCart(); }
  function clearCart() { cart = []; saveCart(); }
  function cartLines() { return cart.filter(l => byId[l.id]).map(l => { const p = byId[l.id]; const unit = unitPrice(p, l.opts); return Object.assign({}, l, { p, unit, total: unit * l.qty }); }); }
  function cartCount() { return cart.reduce((s, l) => s + l.qty, 0); }
  function cartSubtotal() { return cartLines().reduce((s, l) => s + l.total, 0); }
  function cartLeadDays() { return cartLines().reduce((m, l) => Math.max(m, l.opts.custom ? l.opts.custom.leadDays : (l.p.leadDays || 0)), 0); }
  function cartNeedsSetup() { return cartLines().some(l => l.p.setup || (l.opts.custom && l.opts.custom.tiers >= 3)); }
  function cartUnits() { return cartLines().reduce((s, l) => s + units(l.p, l.opts, l.qty), 0); }

  /* ---------- capacity ---------- */
  function capFor(dateStr) { return db.capacity[dateStr] != null ? db.capacity[dateStr] : D.BUSINESS.capacityByDay[parse(dateStr).getDay()]; }
  function usedOn(dateStr) { return db.orders.filter(o => o.date === dateStr && o.channel !== "walk-in").reduce((s, o) => s + o.items.reduce((a, it) => a + (byId[it.id] ? units(byId[it.id], it.opts, it.qty) : 0), 0), 0); }
  function dayState(dateStr, need) {
    const cap = capFor(dateStr); if (!cap) return { state: "closed", left: 0, cap };
    const used = usedOn(dateStr); const left = Math.max(0, cap - used);
    if (left < Math.max(1, need || 0)) return { state: "full", left, cap, used };
    return { state: left <= Math.ceil(cap * 0.3) ? "limited" : "open", left, cap, used };
  }
  function setCapacity(dateStr, n) { db.capacity[dateStr] = n; save(); }

  /* ---------- orders ---------- */
  function placeOrder(o) {
    o.ref = makeRef(); o.own = true; o.created = iso(today()); o.status = o.payment.status === "pending" ? "received" : "confirmed";
    db.orders.push(o);
    // add or update customer
    let c = db.customers.find(x => x.phone && o.customer.phone && x.phone.replace(/\D/g, "").slice(-9) === o.customer.phone.replace(/\D/g, "").slice(-9));
    if (!c) { c = { id: "c" + Date.now(), own: true, name: o.customer.name, phone: o.customer.phone, email: o.customer.email, area: o.zone ? (D.ZONES.find(z => z.id === o.zone) || {}).name : "Collection", zone: o.zone, occasions: [], vip: false, since: iso(today()) }; db.customers.push(c); }
    if (o.occasion && o.occasion.md) c.occasions.push(o.occasion);
    o.customer.id = c.id;
    save();
    return o;
  }
  function findOrder(ref) { ref = String(ref || "").trim().toUpperCase(); if (ref && !ref.startsWith("CCH-")) ref = "CCH-" + ref; return db.orders.find(o => o.ref === ref); }
  function updateOrder(ref, patch) { const o = findOrder(ref); if (!o) return; Object.assign(o, patch); save(); return o; }
  function customerStats(id) {
    const os = db.orders.filter(o => o.customer.id === id);
    const spend = os.reduce((s, o) => s + o.total, 0);
    const last = os.map(o => o.date).sort().pop();
    return { count: os.length, spend, last, orders: os };
  }
  function upcomingOccasions(days) {
    const t0 = today(); const out = [];
    db.customers.forEach(c => c.occasions.forEach(oc => {
      const [m, d] = oc.md.split("-").map(Number);
      let dt = new Date(t0.getFullYear(), m - 1, d); if (dt < t0) dt = new Date(t0.getFullYear() + 1, m - 1, d);
      const inDays = Math.round((dt - t0) / 864e5);
      if (inDays <= days) out.push({ c, oc, date: iso(dt), inDays });
    }));
    return out.sort((a, b) => a.inDays - b.inDays);
  }

  return {
    get db() { return db; }, save, byId, SLOTS, STATUS, STATUS_LABEL,
    money, iso, parse, addDays, today, fmtDate, makeRef, unitPrice, units,
    addToCart, setQty, removeLine, clearCart, cartLines, cartCount, cartSubtotal, cartLeadDays, cartNeedsSetup, cartUnits,
    capFor, usedOn, dayState, setCapacity, placeOrder, findOrder, updateOrder, customerStats, upcomingOccasions,
    reset() { try { localStorage.removeItem(KEY); localStorage.removeItem(CART); } catch (e) {} location.reload(); }
  };
})();
