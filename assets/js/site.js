/* ==========================================================================
   Site chrome & motion: nav, mobile menu, cart drawer, quick view, toasts,
   intro (once per visit), page-transition curtain, Lenis smooth scroll,
   scroll reveals. Every page loads data.js, store.js, then this file.
   ========================================================================== */
window.CCHUI = (function () {
  const D = window.CCH, S = window.CCHStore, B = D.BUSINESS;
  const page = document.body.dataset.page || "";
  const root = document.body.dataset.root || "";
  const qs = new URLSearchParams(location.search);
  const POSE = qs.has("pose");
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const MOTION = !REDUCED && !POSE;
  if (POSE) document.documentElement.classList.add("pose");
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const img = (name, size) => `${root}assets/img/${size || "thumb"}/${name}.jpg`;

  /* ---------- icons ---------- */
  const I = {
    bag: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>',
    plus: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 2v12M2 8h12"/></svg>',
    arr: '<svg class="arr" viewBox="0 0 18 10" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M0 5h16M12 1l4 4-4 4"/></svg>',
    x: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 3l10 10M13 3 3 13"/></svg>',
    wa: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.8-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>',
    send: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 12h15M13 6l6 6-6 6"/></svg>'
  };
  const logo = (cls) => `<svg class="${cls || ""}" viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M24.66 2.61A18 18 0 1 0 36.31 12.39" stroke="currentColor" stroke-width="1.4"/><path d="M21.41 18.31 37.72 10.7A18 18 0 0 0 26.07.92Z" fill="#b3c697"/><text x="19" y="27.2" text-anchor="middle" font-family="Gilda Display, Georgia, serif" font-size="19" fill="currentColor">C</text></svg>`;

  /* ---------- nav ---------- */
  const LINKS = [
    { href: "index.html", key: "home", label: "Home", note: "The house" },
    { href: "menu.html", key: "menu", label: "The Menu", note: `${D.PRODUCTS.length} creations` },
    { href: "atelier.html", key: "atelier", label: "Cake Atelier", note: "Design your cake" },
    { href: "weddings.html", key: "weddings", label: "Weddings", note: "Tastings & tiers" },
    { href: "gallery.html", key: "gallery", label: "Gallery", note: "Recent work" },
    { href: "about.html", key: "about", label: "Our House", note: "Story & visit" }
  ];
  function buildChrome() {
    document.body.insertAdjacentHTML("afterbegin", `
      <a class="skip" href="#main">Skip to content</a>
      <header class="nav" id="nav">
        <a class="brand" href="${root}index.html" aria-label="${esc(B.name)}, home">${logo()}<span class="brand-word"><b>Cindy's</b><small>Cake House</small></span></a>
        <ul class="nav-links">${LINKS.slice(1).map(l => `<li><a href="${root}${l.href}" ${l.key === page ? 'aria-current="page"' : ""}>${l.label}</a></li>`).join("")}</ul>
        <div class="nav-actions">
          <a class="icon-btn" href="${root}track.html" aria-label="Track an order" title="Track an order"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg></a>
          <button class="icon-btn cart-btn" id="cartBtn" aria-label="Open your bag">${I.bag}<span class="cart-count" id="cartCount">0</span></button>
          <a class="btn btn-pist btn-sm nav-cta" href="${root}atelier.html">Design a cake</a>
          <button class="icon-btn menu-btn" id="menuBtn" aria-label="Open menu" aria-expanded="false"><span></span><span></span></button>
        </div>
      </header>
      <nav class="mnav" id="mnav" aria-label="Mobile">
        <ol>${LINKS.map(l => `<li><a href="${root}${l.href}" ${l.key === page ? 'aria-current="page"' : ""}>${l.label}<small>${l.note}</small></a></li>`).join("")}<li><a href="${root}track.html">Track order<small>Live status</small></a></li></ol>
        <div class="mnav-foot"><a class="btn btn-pist" href="${root}atelier.html">Design a cake</a><span>${esc(B.address)}</span><span>${esc(B.phone)} · WhatsApp ${esc(B.whatsappDisplay)}</span></div>
      </nav>
      <div class="scrim" id="scrim"></div>
      <aside class="drawer" id="cart" aria-label="Your bag" aria-hidden="true">
        <div class="drawer-head"><h2>Your bag</h2><button class="close-x" data-close aria-label="Close bag">${I.x}</button></div>
        <div class="drawer-body" id="cartBody"></div>
        <div class="drawer-foot" id="cartFoot"></div>
      </aside>
      <aside class="drawer" id="qv" aria-label="Product details" aria-hidden="true">
        <div class="drawer-head"><h2 id="qvTitle">Details</h2><button class="close-x" data-close aria-label="Close">${I.x}</button></div>
        <div class="drawer-body" id="qvBody"></div>
        <div class="drawer-foot" id="qvFoot"></div>
      </aside>
      <div class="toasts" id="toasts" aria-live="polite"></div>
      <div class="curtain" id="curtain" aria-hidden="true">${logo("cmark")}</div>`);
    const foot = $("[data-footer]");
    if (foot) foot.outerHTML = footer();
  }
  function footer() {
    return `<footer class="foot grain">
      <div class="wrap">
        <div class="foot-top">
          <div>
            <a class="brand" href="${root}index.html">${logo()}<span class="brand-word"><b>Cindy's</b><small>Cake House</small></span></a>
            <p class="muted" style="margin-top:18px;max-width:34ch">Couture cakes, wedding tiers and daily pâtisserie, baked in Cantonments since ${B.founded}.</p>
            <form class="remind" id="remindForm" novalidate>
              <label class="sr-only" for="remindPhone">WhatsApp number for occasion reminders</label>
              <input class="input" id="remindPhone" type="tel" placeholder="WhatsApp number" autocomplete="tel">
              <button class="btn btn-pist btn-sm" type="submit">Remind me</button>
            </form>
            <p class="muted" style="font-size:13px;margin-top:10px">We'll send one note before each birthday you save. Nothing else.</p>
          </div>
          <div><h4>Order</h4><ul>
            <li><a href="${root}menu.html">The Menu</a></li><li><a href="${root}atelier.html">Cake Atelier</a></li><li><a href="${root}weddings.html">Weddings & tastings</a></li><li><a href="${root}menu.html#events">Dessert tables</a></li><li><a href="${root}menu.html#gifting">Corporate gifting</a></li><li><a href="${root}track.html">Track an order</a></li></ul></div>
          <div><h4>House</h4><ul>
            <li><a href="${root}about.html">Our story</a></li><li><a href="${root}gallery.html">Gallery</a></li><li><a href="${root}about.html#visit">Visit & contact</a></li><li><a href="${root}policies.html#delivery">Delivery & collection</a></li><li><a href="${root}policies.html#orders">Orders & deposits</a></li><li><a href="${root}policies.html#privacy">Privacy</a></li></ul></div>
          <div><h4>Visit</h4><ul>
            <li>${esc(B.address)}</li><li class="mono" style="font-size:13px">${esc(B.gps)}</li>
            ${B.hours.map(h => `<li><span style="color:var(--on-dark)">${h.d}</span><br>${h.h}</li>`).join("")}
            <li><a href="tel:${B.phone.replace(/\s/g, "")}">${esc(B.phone)}</a></li>
            <li><a href="https://wa.me/${B.whatsapp}" target="_blank" rel="noopener">WhatsApp ${esc(B.whatsappDisplay)}</a></li></ul></div>
        </div>
        <p class="foot-big" aria-hidden="true">Cindy's</p>
        <div class="foot-bottom"><span>© ${new Date().getFullYear()} ${esc(B.name)} · Cantonments, Accra</span><span><a href="${root}admin/index.html">Owner login</a> · Payments are simulated in this demo</span></div>
      </div></footer>`;
  }

  /* ---------- product card ---------- */
  function leadText(p) {
    if (p.booking) return "Book a time";
    if (!p.leadDays) return "Today, from the counter";
    if (p.leadDays === 1) return "Order a day ahead";
    if (p.leadDays < 7) return `${p.leadDays} days' notice`;
    return `${Math.round(p.leadDays / 7)} weeks' notice`;
  }
  function card(p, o) {
    o = o || {};
    const badge = p.badge ? `<span class="pcard-badge glass">${esc(p.badge)}</span>` : "";
    return `<article class="pcard ${o.wide ? "is-wide" : ""}" data-id="${p.id}" ${o.reveal === false ? "" : 'data-reveal'}>
      <div class="pcard-fig">
        <button class="pcard-media" data-qv="${p.id}" aria-label="View ${esc(p.name)}">
          <img src="${img(p.img, o.wide ? "full" : "thumb")}" alt="${esc(p.name)}: ${esc(p.line)}" ${o.eager ? "" : 'loading="lazy"'} decoding="async">
          ${badge}
        </button>
        <button class="pcard-add glass" data-add="${p.id}" aria-label="Add ${esc(p.name)} to bag">${I.plus}<span>${p.booking ? "Book" : "Add"}</span></button>
      </div>
      <div class="pcard-body">
        <div class="pcard-title"><h3>${esc(p.name)}</h3><span class="price">${p.from ? "from " : ""}${S.money(p.price)}</span></div>
        <p class="pcard-line">${esc(p.line)}</p>
        <div class="pcard-meta"><span>${esc(p.unit || "")}</span><span class="lead">${leadText(p)}</span></div>
      </div>
    </article>`;
  }

  /* ---------- drawers ---------- */
  let openDrawer = null, lastFocus = null;
  function open(id) {
    close(true);
    lastFocus = document.activeElement;
    const el = $("#" + id); openDrawer = el;
    el.classList.add("is-open"); el.setAttribute("aria-hidden", "false");
    $("#scrim").classList.add("is-open"); lockScroll(true);
    setTimeout(() => { const f = el.querySelector("button, a, input, select, textarea"); f && f.focus({ preventScroll: true }); }, 60);
  }
  function close(silent) {
    if (!openDrawer) return;
    openDrawer.classList.remove("is-open"); openDrawer.setAttribute("aria-hidden", "true"); openDrawer = null;
    if (!silent) { $("#scrim").classList.remove("is-open"); lockScroll(false); lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true }); }
  }
  function lockScroll(on) { document.body.classList.toggle("is-locked", on); if (lenis) on ? lenis.stop() : lenis.start(); }

  /* ---------- cart ---------- */
  function optText(l) {
    const o = l.opts || {}, bits = [];
    if (o.custom) return esc(o.custom.summary);
    if (o.size) { const s = D.SIZES.find(x => x.id === o.size); s && bits.push(`${s.name} · serves ${s.serves}`); }
    if (o.flavour) bits.push(o.flavour);
    if (o.message) bits.push(`“${o.message}”`);
    if (o.date) bits.push(`${S.fmtDate(o.date)} · ${o.time}`);
    return esc(bits.join(" · ")) || esc(l.p.unit || "");
  }
  function renderCart() {
    const lines = S.cartLines(), n = S.cartCount();
    const cc = $("#cartCount"); if (cc) { cc.textContent = n; cc.classList.toggle("has", n > 0); }
    const body = $("#cartBody"), foot = $("#cartFoot"); if (!body) return;
    if (!lines.length) {
      body.innerHTML = `<div class="empty"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 40h44v12H10z"/><path d="M14 40V28h36v12M20 28v-8h24v8M32 12v8"/></svg><p class="h4" style="margin-bottom:6px">Your bag is empty</p><p>Start with something from the counter, or design a cake from scratch.</p><div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><a class="btn btn-sm" href="${root}menu.html">Browse the menu</a><a class="btn btn-ghost btn-sm" href="${root}atelier.html">Design a cake</a></div></div>`;
      foot.innerHTML = ""; return;
    }
    body.innerHTML = lines.map(l => `<div class="line-item">
      <img src="${img(l.opts.custom ? l.opts.custom.img : l.p.img)}" alt="">
      <div><h4>${esc(l.opts.custom ? l.opts.custom.name : l.p.name)}</h4><div class="opts">${optText(l)}</div>
        <div class="qty"><button aria-label="Fewer" data-q="${esc(l.key)}" data-d="-1">−</button><span>${l.qty}</span><button aria-label="More" data-q="${esc(l.key)}" data-d="1">+</button></div>
        <button class="rm" data-rm="${esc(l.key)}">Remove</button></div>
      <span class="price">${S.money(l.total)}</span></div>`).join("");
    const lead = S.cartLeadDays();
    const earliest = S.addDays(S.today(), lead);
    foot.innerHTML = `<div class="sum-row"><span>Subtotal</span><b class="price">${S.money(S.cartSubtotal())}</b></div>
      <div class="sum-row muted" style="font-size:13px"><span>Earliest ${lead ? "delivery" : "collection"}</span><span>${lead ? S.fmtDate(S.iso(earliest)) : "Today, from the counter"}</span></div>
      <a class="btn btn-block" href="${root}checkout.html">Choose a date & check out ${I.arr}</a>`;
  }
  function add(id, opts, qty, silent) {
    const p = S.byId[id]; if (!p) return;
    S.addToCart(id, opts || {}, qty || 1);
    const cc = $("#cartCount"); if (cc) { cc.classList.remove("bump"); void cc.offsetWidth; cc.classList.add("bump"); }
    if (!silent) toast(`<img src="${img(opts && opts.custom ? opts.custom.img : p.img)}" alt=""><div><b>${esc(opts && opts.custom ? opts.custom.name : p.name)}</b><small>Added to your bag</small></div><button class="btn btn-pist btn-sm" data-open-cart>View bag</button>`);
  }
  function toast(html, ms) {
    const t = document.createElement("div"); t.className = "toast glass"; t.innerHTML = html;
    $("#toasts").appendChild(t);
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 450); }, ms || 3800);
  }

  /* ---------- quick view ---------- */
  function quickView(id) {
    const p = S.byId[id]; if (!p) return;
    const cat = D.CATEGORIES.find(c => c.id === p.cat);
    $("#qvTitle").textContent = cat ? cat.name : "Details";
    const sizes = p.sizes ? `<div class="opt-group"><span class="label">Size</span><div class="opt-row" data-opt="size">${D.SIZES.map((s, i) => `<button class="chip ${i === 0 ? "is-on" : ""}" data-v="${s.id}">${s.name} · ${s.serves}<span class="n">${S.money(Math.round(p.price * s.mult / 10) * 10)}</span></button>`).join("")}</div></div>` : "";
    const flav = p.flavours ? `<div class="opt-group"><label class="label" for="qvFlav">Sponge & filling</label><select class="select" id="qvFlav">${D.FLAVOURS.map(f => `<option>${esc(f)}</option>`).join("")}</select></div>` : "";
    const msg = p.message ? `<div class="opt-group"><label class="label" for="qvMsg">Message on the cake or card <span style="text-transform:none;letter-spacing:0;font-weight:500">(optional)</span></label><input class="input" id="qvMsg" maxlength="40" placeholder="Happy birthday, Maame"></div>` : "";
    const book = p.booking ? `<div class="opt-group"><span class="label">Choose a time</span><div class="form-grid"><input class="input" type="date" id="qvDate" min="${S.iso(S.addDays(S.today(), p.leadDays || 1))}" value="${S.iso(S.addDays(S.today(), Math.max(2, p.leadDays || 1)))}"><select class="select" id="qvTime">${["10:00", "11:30", "13:00", "14:30", "16:00"].map(t => `<option>${t}</option>`).join("")}</select></div></div>` : "";
    $("#qvBody").innerHTML = `<div class="qv-media"><img src="${img(p.img, "full")}" alt="${esc(p.name)}"></div>
      <h3 class="h3" style="margin-bottom:6px">${esc(p.name)}</h3>
      <p class="muted" style="margin-bottom:10px">${esc(p.line)}.</p>
      <div class="kv"><span>Portion</span><span>${esc(p.unit || "")}</span></div>
      <div class="kv"><span>Notice</span><span>${leadText(p)}</span></div>
      ${p.setup ? `<div class="kv"><span>Delivery</span><span>White-glove set-up at your venue</span></div>` : ""}
      ${sizes}${flav}${msg}${book}
      ${p.cat === "wedding" && !p.booking ? `<p class="muted" style="font-size:13.5px">Tier sizes, flavours per tier and flowers are finalised at your tasting. Adding this reserves the design and your date with a 50% deposit.</p>` : ""}`;
    const priceFor = () => { const on = $("#qvBody [data-opt=size] .is-on"); return on ? S.unitPrice(p, { size: on.dataset.v }) : p.price; };
    const renderFoot = () => { $("#qvFoot").innerHTML = `<div class="sum-row total" style="border:0;padding:0"><span>${p.from ? "From" : "Price"}</span><span class="price">${S.money(priceFor())}</span></div><button class="btn btn-block" id="qvAdd">${p.booking ? "Book this tasting" : "Add to bag"} ${I.arr}</button>`; };
    renderFoot();
    $("#qvBody").onclick = e => { const b = e.target.closest("[data-opt] .chip"); if (!b) return; $$(".chip", b.parentNode).forEach(c => c.classList.toggle("is-on", c === b)); renderFoot(); };
    $("#qvFoot").onclick = e => {
      if (!e.target.closest("#qvAdd")) return;
      const opts = {};
      const sz = $("#qvBody [data-opt=size] .is-on"); if (sz) opts.size = sz.dataset.v;
      if ($("#qvFlav")) opts.flavour = $("#qvFlav").value;
      if ($("#qvMsg") && $("#qvMsg").value.trim()) opts.message = $("#qvMsg").value.trim();
      if ($("#qvDate")) { opts.date = $("#qvDate").value; opts.time = $("#qvTime").value; }
      add(id, opts); close();
    };
    open("qv");
  }

  /* ---------- delegated clicks ---------- */
  document.addEventListener("click", e => {
    const t = e.target;
    const addB = t.closest("[data-add]");
    if (addB) { e.preventDefault(); const p = S.byId[addB.dataset.add]; if (p && (p.sizes || p.flavours || p.booking || p.message && p.cat !== "gifting")) quickView(p.id); else add(addB.dataset.add); return; }
    const qv = t.closest("[data-qv]"); if (qv) { e.preventDefault(); quickView(qv.dataset.qv); return; }
    if (t.closest("#cartBtn") || t.closest("[data-open-cart]")) { e.preventDefault(); renderCart(); open("cart"); return; }
    if (t.closest("[data-close]") || t.id === "scrim") { close(); return; }
    const q = t.closest("[data-q]"); if (q) { const l = S.cartLines().find(x => x.key === q.dataset.q); l && S.setQty(l.key, l.qty + Number(q.dataset.d)); return; }
    const rm = t.closest("[data-rm]"); if (rm) { S.removeLine(rm.dataset.rm); return; }
    const mb = t.closest("#menuBtn"); if (mb) { const m = $("#mnav"); const on = !m.classList.contains("is-open"); m.classList.toggle("is-open", on); mb.setAttribute("aria-expanded", on); lockScroll(on); mb.children[0].style.transform = on ? "translateY(3.3px) rotate(45deg)" : ""; mb.children[1].style.transform = on ? "translateY(-3.3px) rotate(-45deg)" : ""; return; }
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") { close(); const m = $("#mnav"); if (m && m.classList.contains("is-open")) $("#menuBtn").click(); } });
  window.addEventListener("cch:cart", renderCart);
  document.addEventListener("submit", e => {
    if (e.target.id !== "remindForm") return;
    e.preventDefault(); const v = $("#remindPhone").value.replace(/\D/g, "");
    if (v.length < 9) { $("#remindPhone").classList.add("is-bad"); $("#remindPhone").focus(); return; }
    $("#remindPhone").classList.remove("is-bad"); $("#remindPhone").value = "";
    toast(`<div><b>You're on the list</b><small>Esi will WhatsApp you to save your dates.</small></div>`);
  });

  /* ---------- smooth scroll + reveals ---------- */
  let lenis = null;
  function initScroll() {
    if (MOTION && window.Lenis) {
      lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
      if (window.gsap && window.ScrollTrigger) { lenis.on("scroll", ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
      else { const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
      $$('a[href^="#"]').forEach(a => a.addEventListener("click", e => { const id = a.getAttribute("href"); if (id.length > 1 && $(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: -90 }); } }));
    }
    if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    // nav hide on scroll down
    let lastY = 0; const nav = $("#nav");
    const onScroll = () => { const y = window.scrollY; if (nav && !document.body.classList.contains("is-locked")) nav.classList.toggle("is-hidden", y > 240 && y > lastY + 4); if (Math.abs(y - lastY) > 4) lastY = y; };
    window.addEventListener("scroll", onScroll, { passive: true });
    reveals();
  }
  function reveals(scope) {
    const els = $$("[data-reveal], [data-split]", scope);
    if (!MOTION || !("IntersectionObserver" in window)) { els.forEach(el => el.classList.add("is-in")); return; }
    const io = new IntersectionObserver(ents => ents.forEach(en => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(el => io.observe(el));
  }
  // split a heading into masked lines: <h2 data-split>Line one|Line two</h2>
  function splitLines(scope) {
    $$("[data-split]", scope).forEach(el => {
      if (el.dataset.done) return; el.dataset.done = 1;
      const parts = el.innerHTML.split("|");
      el.innerHTML = parts.map((t, i) => `<span class="split-line"><span style="--d:${(i * 0.09).toFixed(2)}s">${t}</span></span>`).join("");
    });
  }

  /* ---------- intro & curtains ---------- */
  function curtainIn(href) {
    const c = $("#curtain");
    if (!MOTION || !window.gsap) { location.href = href; return; }
    c.classList.add("is-cover");
    gsap.timeline({ onComplete: () => { try { sessionStorage.setItem("cch.curtain", "1"); } catch (e) {} location.href = href; } })
      .fromTo(c, { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" }, { clipPath: "polygon(0% 22%, 100% -10%, 100% 100%, 0% 100%)", duration: 0.55, ease: "power3.in" })
      .to(c, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 0.25, ease: "power2.out" })
      .to($(".cmark", c), { opacity: 1, scale: 1, duration: 0.3 }, "-=0.25");
  }
  function curtainOut() {
    const c = $("#curtain"); let flag = null;
    try { flag = sessionStorage.getItem("cch.curtain"); sessionStorage.removeItem("cch.curtain"); } catch (e) {}
    if (!flag || !MOTION || !window.gsap) return false;
    c.classList.add("is-cover");
    gsap.set(c, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" }); gsap.set($(".cmark", c), { opacity: 1 });
    gsap.timeline({ delay: 0.08, onComplete: () => c.classList.remove("is-cover") })
      .to($(".cmark", c), { opacity: 0, duration: 0.25 })
      .to(c, { clipPath: "polygon(0% 0%, 100% 0%, 100% -12%, 0% 18%)", duration: 0.85, ease: "power3.inOut" }, "-=0.05");
    return true;
  }
  document.addEventListener("click", e => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || a.target === "_blank" || a.hasAttribute("download")) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || /^https?:/i.test(href)) return;
    const url = new URL(a.href, location.href);
    if (url.pathname === location.pathname && url.hash) return;
    if (!/\.html$/.test(url.pathname) && !url.pathname.endsWith("/")) return;
    e.preventDefault(); close(); curtainIn(a.href);
  });
  window.addEventListener("pageshow", e => { if (e.persisted) { const c = $("#curtain"); if (c) { c.classList.remove("is-cover"); c.style.clipPath = ""; } } });

  function intro(done) {
    let seen = false; try { seen = sessionStorage.getItem("cch.intro"); } catch (e) {}
    if (page !== "home" || seen || !MOTION || !window.gsap) { done && done(false); return; }
    try { sessionStorage.setItem("cch.intro", "1"); } catch (e) {}
    const word = "Cindy's";
    document.body.insertAdjacentHTML("beforeend", `<div class="intro" id="intro" aria-hidden="true"><div class="intro-half a"></div><div class="intro-half b"></div><div class="intro-knife"></div><div class="intro-word"><div><div class="w">${[...word].map(ch => `<span>${ch === " " ? "&nbsp;" : ch}</span>`).join("")}</div><small>Cake House · Cantonments</small></div></div><div class="intro-count">EST. ${B.founded} — ACCRA</div></div>`);
    const el = $("#intro"); lockScroll(true);
    const tl = gsap.timeline({ onComplete: () => { el.remove(); lockScroll(false); } });
    tl.to($$(".w span", el), { y: 0, duration: 1, ease: "expo.out", stagger: 0.06 })
      .to($(".intro-word small", el), { opacity: 1, duration: 0.6 }, "-=0.5")
      .to($(".intro-knife", el), { scaleX: 1, duration: 0.75, ease: "power3.inOut" }, "+=0.15")
      .to($(".intro-word", el), { opacity: 0, duration: 0.3 }, "+=0.05")
      .to($(".intro-count", el), { opacity: 0, duration: 0.3 }, "<")
      .add(() => done && done(true), "-=0.05")
      .to($(".intro-half.a", el), { yPercent: -100, xPercent: -6, duration: 1.15, ease: "expo.inOut" }, "<")
      .to($(".intro-half.b", el), { yPercent: 100, xPercent: 6, duration: 1.15, ease: "expo.inOut" }, "<")
      .to($(".intro-knife", el), { opacity: 0, duration: 0.3 }, "<0.2");
  }

  /* ---------- boot ---------- */
  buildChrome();
  splitLines();
  renderCart();
  const curtained = curtainOut();
  initScroll();

  return { $, $$, esc, img, I, logo, card, add, quickView, toast, open, close, renderCart, reveals, splitLines, intro, leadText, curtained, get lenis() { return lenis; }, MOTION, POSE, root, page };
})();
