/* Weddings, gallery and about pages. */
(function () {
  const D = CCH, S = CCHStore, U = CCHUI, B = D.BUSINESS, { $, $$, esc, img } = U;
  const page = U.page;
  const M = U.MOTION && window.gsap;
  const parallax = () => { if (!M) return; $$(".phero-bg img, .bg-photo .bg-img img").forEach(im => gsap.fromTo(im, { yPercent: -5 }, { yPercent: 5, ease: "none", scrollTrigger: { trigger: im.closest("section"), start: "top bottom", end: "bottom top", scrub: true } })); };

  /* ================= WEDDINGS ================= */
  if (page === "weddings") {
    // next Saturdays with room for a 4-tier cake
    const sats = []; let d = S.addDays(S.today(), 14);
    while (sats.length < 3) { if (d.getDay() === 6) { const st = S.dayState(S.iso(d), 4); if (st.state !== "full") sats.push(`${S.fmtDate(S.iso(d), { day: "numeric", month: "short" })}${st.state === "limited" ? " (1 left)" : ""}`); } d = S.addDays(d, 1); }
    $("#satLine").innerHTML = sats.join(" · ") + `<br><span class="muted" style="font-size:13px">Book a tasting first; it holds the date for 7 days.</span>`;
    const wed = D.PRODUCTS.filter(p => p.cat === "wedding" && !p.booking && p.id !== "eng-knocking");
    $("#wedGrid").innerHTML = wed.map((p, i) => U.card(p, { wide: i === 0 })).join("");
    $("#knockCards").innerHTML = ["eng-knocking", "evt-engagement-table"].map(id => { const p = S.byId[id]; return `<button class="mini-card" data-qv="${id}"><img src="${img(p.img)}" alt=""><span><b>${esc(p.name)}</b><small class="mono">from ${S.money(p.price)} · ${esc(p.unit)}</small></span><span aria-hidden="true">→</span></button>`; }).join("");
    // tasting form
    const days = []; let t = S.addDays(S.today(), 2);
    while (days.length < 10) { const dw = t.getDay(); if (dw >= 2 && dw <= 6) days.push(S.iso(t)); t = S.addDays(t, 1); }
    let selDay = days[0], selTime = "11:30";
    const TIMES = ["10:00", "11:30", "13:00", "14:30", "16:00"];
    const busy = iso => (iso.charCodeAt(9) + iso.charCodeAt(8)) % 5; // a deterministic "taken" slot per day
    function drawTs() {
      $("#tsDays").innerHTML = days.map(x => { const dt = S.parse(x); return `<button type="button" class="tsd ${x === selDay ? "is-on" : ""}" data-day="${x}"><small>${dt.toLocaleDateString("en-GB", { weekday: "short" })}</small><b>${dt.getDate()}</b><small>${dt.toLocaleDateString("en-GB", { month: "short" })}</small></button>`; }).join("");
      $("#tsTimes").innerHTML = TIMES.map((x, i) => { const dis = i === busy(selDay); if (dis && selTime === x) selTime = TIMES[(i + 1) % TIMES.length]; return `<button type="button" class="chip ${x === selTime ? "is-on" : ""}" data-time="${x}" ${dis ? "disabled" : ""}>${x}${dis ? " · taken" : ""}</button>`; }).join("");
      const g = +$("#tsGuests").value; const tiers = g <= 70 ? 2 : g <= 110 ? 3 : g <= 160 ? 4 : 5;
      const pool = D.PRODUCTS.filter(p => p.cat === "wedding" && p.tiers === tiers);
      const lo = pool.length ? Math.min(...pool.map(p => p.price)) : 6800;
      $("#tsGOut").textContent = g;
      $("#tsEst").innerHTML = `For ${g} guests: <b>${tiers} tiers</b>, our designs start at <b class="mono">${S.money(lo)}</b> plus set-up.`;
    }
    drawTs();
    $("#tsDays").addEventListener("click", e => { const b = e.target.closest("[data-day]"); if (b) { selDay = b.dataset.day; drawTs(); } });
    $("#tsTimes").addEventListener("click", e => { const b = e.target.closest("[data-time]"); if (b && !b.disabled) { selTime = b.dataset.time; drawTs(); } });
    $("#tsGuests").addEventListener("input", drawTs);
    $("#tsWed").min = S.iso(S.addDays(S.today(), 21));
    $("#tsForm").addEventListener("submit", e => {
      e.preventDefault();
      const n = $("#tsNames"); if (n.value.trim().length < 2) { n.classList.add("is-bad"); n.focus(); $("#tsErr").hidden = false; $("#tsErr").textContent = "Tell us your names so we can set the table."; return; }
      n.classList.remove("is-bad"); $("#tsErr").hidden = true;
      U.add("evt-tasting", { date: selDay, time: selTime, message: `${n.value.trim()} · ${$("#tsGuests").value} guests${$("#tsWed").value ? " · wedding " + S.fmtDate($("#tsWed").value, { day: "numeric", month: "short", year: "numeric" }) : ""}` });
      try { sessionStorage.setItem("cch.prefDate", selDay); } catch (x) {}
      setTimeout(() => { location.href = "checkout.html"; }, 700);
    });
    $("#faq").innerHTML = D.FAQ.concat([{ q: "Can you deliver outside Accra?", a: "Aburi and Peduase are on our standard list. For Akosombo, Ada or Kumasi we quote individually, and the cake travels in our van with a chiller box." }, { q: "Do you do the whole dessert table?", a: "Yes. The Orchid Table and Ivory Table include stands, linen and clearing. We work alongside your planner on colours and timing." }])
      .map(f => `<details data-reveal><summary><span>${esc(f.q)}</span><i aria-hidden="true"></i></summary><p>${esc(f.a)}</p></details>`).join("");
    U.reveals();
    parallax();
  }

  /* ================= GALLERY ================= */
  if (page === "gallery") {
    const CAP = {
      "life-night-cake": "Birthday at a rooftop in Osu", "life-white-dress": "Naa's 25th, Lambeth Rosé in ivory", "life-joy-pink": "A slice of Fig & Berry Ribbon", "life-bite": "First bite, Strawberries & Cream", "life-tart": "Chocolate tart, Sunday lunch", "life-bite-close": "Meringue Crown, one slice in",
      "life-candle-red": "Red velvet with sparklers", "life-blue-birthday": "Watercolour for a 16th", "life-print-dress": "A birthday in ankara", "life-balloons": "Bento Love Note, studio shoot", "life-blow-candle": "Midnight birthday, Ganache Noir", "life-family": "Family birthday, East Legon", "life-family-white": "Naming day, Trasacco", "life-candles-dark": "Forty candles",
      "wed-couple-garden": "Adwoa & Kwame, Peduase", "wed-couple-white": "Akua & Yaw, Airport Hills", "wed-bride": "Dzifa before the ceremony", "wed-couple-tender": "Esi & Kofi, Cantonments", "wed-traditional": "A knocking ceremony in Tema", "wed-couple-print": "Engagement in matching prints", "wed-beach": "Selorm & Eli, Labadi", "wed-couple-kiss": "Mr & Mrs Darko", "eng-couple-black": "Engagement portraits", "wed-cutting-hands": "The first cut", "wed-cutting-love": "Ivory Garden, cut", "wed-noir-detail": "Noir Botanica, detail", "wed-monogram-alt": "The Monogram, by the pool",
      "proc-piping-cupcakes": "Piping red velvet cupcakes", "proc-palette-knife": "Smoothing a Victoria sponge", "proc-piping-stripes": "Striped buttercream in progress", "proc-teal-finish": "Finishing an Under the Sea", "proc-piping-border": "Ganache border", "proc-rosettes": "Rosettes for a drip cake", "proc-meringues": "Meringue kisses, 6am", "proc-layering": "Filling the layers",
      "int-cafe": "The front room", "int-shelves": "The bread shelf", "int-viennoiserie-wall": "Viennoiserie, Saturday morning", "int-display": "The counter at 10am", "int-eclair-display": "Éclairs and choux", "int-macaron-display": "Macarons, sorted by colour", "int-counter": "Late afternoon"
    };
    const GALCAP = {
      "gal-macaron-pastel": "Pastel macarons for a bridal shower", "gal-croissant-dust": "Croissants under a snow of sugar", "gal-glaze-pour": "Glazing the cinnamon swirls", "gal-petits-silver": "Petits fours on silver, Ridge office launch", "gal-truffle-bowl": "Truffles, rolled by hand",
      "gal-strawberry-cupcakes": "Strawberry cupcakes for a baby shower", "gal-mousse-slice": "Chocolate mousse slice", "gal-macaron-ribbon": "Rose macarons, tied for a proposal", "gal-fruit-naked": "Naked sponge with summer fruit", "gal-chocolate-box": "A box of painted bonbons",
      "gal-brownie-pour": "Ghana cocoa brownies, warm", "gal-madeleines": "Madeleines straight from the tin", "gal-pain-macro": "Pain au chocolat, cross-section", "gal-tartelette-plated": "A plated tartelette for high tea", "gal-milestone-23": "Twenty-third birthday with macarons",
      "gal-sage-detail": "Sage & Gold, detail", "gal-baby-slice": "Oh Baby, sliced", "gal-stemware": "Dessert table detail, Peduase", "gal-poolside": "Poolside party, Trasacco", "gal-citrus-tart": "Lemon & ginger tart, from above",
      "gal-lemon-berry-tart": "Lemon tart with berries", "gal-pistachio-slice": "Pistachio cake, one slice", "gal-strawberry-cream": "Strawberry cream cake", "gal-rv-cupcakes": "Red velvet cupcakes", "gal-macaron-cluster": "Macarons, mixed flavours",
      "gal-macaron-noir-box": "The Noir box, closed", "gal-mint-cupcakes": "Mint cupcakes for a kids' party", "gal-petits-white": "White petits fours with rose", "gal-chocolate-slice": "Seven-layer chocolate", "gal-coconut-sheet": "Coconut Cloud, whole tray",
      "gal-tiramisu-square": "Tiramisu by the square", "gal-lemon-cheesecake": "Lemon cheesecake on a stand", "gal-rv-slice": "Red velvet, the tall slice", "gal-croissants": "A tray of butter croissants", "gal-croissant-plate": "Two croissants and a glass of milk"
    };
    const TAGS = [["all", "Everything"], ["weddings", "Weddings"], ["celebrations", "Celebrations"], ["patisserie", "Pâtisserie"], ["moments", "Moments"], ["kitchen", "The kitchen"]];
    const tagOf = n => /^(wed|eng)-/.test(n) ? "weddings" : /^(cel|kid|baby)-/.test(n) ? "celebrations" : /^(life)-/.test(n) ? "moments" : /^(proc|int|team)-/.test(n) ? "kitchen" : "patisserie";
    const fromProducts = D.PRODUCTS.filter(p => !/^evt-tasting/.test(p.id)).map(p => ({ n: p.img, cap: p.name, pid: p.id }));
    const extra = Object.keys(CAP).map(n => ({ n, cap: CAP[n] }));
    const gal = ["gal-macaron-pastel", "gal-croissant-dust", "gal-glaze-pour", "gal-petits-silver", "gal-truffle-bowl", "gal-strawberry-cupcakes", "gal-mousse-slice", "gal-macaron-ribbon", "gal-fruit-naked", "gal-chocolate-box", "gal-brownie-pour", "gal-madeleines", "gal-pain-macro", "gal-tartelette-plated", "gal-milestone-23", "gal-sage-detail", "gal-baby-slice", "gal-stemware", "gal-poolside", "gal-citrus-tart", "gal-lemon-berry-tart", "gal-pistachio-slice", "gal-strawberry-cream", "gal-rv-cupcakes", "gal-macaron-cluster", "gal-macaron-noir-box", "gal-mint-cupcakes", "gal-petits-white", "gal-chocolate-slice", "gal-coconut-sheet", "gal-tiramisu-square", "gal-lemon-cheesecake", "gal-rv-slice", "gal-croissants", "gal-croissant-plate"].map(n => ({ n, cap: GALCAP[n] || "From the counter", tag: /baby|milestone|sage|poolside/.test(n) ? "celebrations" : "patisserie" }));
    // interleave for a lively first screen
    const all = []; const a = extra.slice(), b = fromProducts.slice(), c = gal.slice();
    while (a.length || b.length || c.length) { if (b.length) all.push(b.shift()); if (a.length) all.push(a.shift()); if (b.length) all.push(b.shift()); if (c.length) all.push(c.shift()); }
    all.forEach(x => x.tag = x.tag || tagOf(x.n));
    const meta = {}; // natural aspect from loaded thumbs keeps the masonry honest
    let filter = new URLSearchParams(location.search).get("tag") || "all", view = [];
    $("#glTags").innerHTML = TAGS.map(t => `<button class="chip ${t[0] === filter ? "is-on" : ""}" data-tag="${t[0]}">${t[1]} <span class="n">${t[0] === "all" ? all.length : all.filter(x => x.tag === t[0]).length}</span></button>`).join("");
    function draw() {
      view = all.filter(x => filter === "all" || x.tag === filter);
      $("#masonry").innerHTML = view.map((x, i) => `<button class="m-item" data-i="${i}" data-reveal style="--d:${(i % 4) * 0.05}s"><img src="${img(x.n)}" alt="${esc(x.cap)}" loading="lazy"><span class="m-cap">${esc(x.cap)}</span></button>`).join("");
      U.reveals($("#masonry")); if (window.ScrollTrigger) ScrollTrigger.refresh();
    }
    draw();
    $("#glTags").addEventListener("click", e => { const b = e.target.closest("[data-tag]"); if (!b) return; filter = b.dataset.tag; $$("#glTags .chip").forEach(c => c.classList.toggle("is-on", c === b)); draw(); });
    // lightbox
    let cur = 0;
    const lb = $("#lb");
    function openLb(i) {
      cur = (i + view.length) % view.length; const x = view[cur];
      $("#lbImg").src = img(x.n, "full"); $("#lbImg").alt = x.cap;
      const p = x.pid && S.byId[x.pid];
      $("#lbCap").innerHTML = `<span><b class="h4">${esc(x.cap)}</b>${p ? `<small class="mono">${p.from ? "from " : ""}${S.money(p.price)} · ${esc(p.unit || "")}</small>` : `<small>${cur + 1} of ${view.length}</small>`}</span>${p ? `<button class="btn btn-pist btn-sm" data-qv="${p.id}">Order this</button>` : `<a class="btn btn-ghost btn-sm on-dark" href="atelier.html">Design one like it</a>`}`;
      if (lb.hidden) { lb.hidden = false; document.body.classList.add("is-locked"); U.lenis && U.lenis.stop(); $("#lbX").focus(); }
      if (M) gsap.fromTo("#lbImg", { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" });
    }
    function closeLb() { lb.hidden = true; document.body.classList.remove("is-locked"); U.lenis && U.lenis.start(); }
    $("#masonry").addEventListener("click", e => { const b = e.target.closest("[data-i]"); b && openLb(+b.dataset.i); });
    $("#lbX").onclick = closeLb; $("#lbPrev").onclick = () => openLb(cur - 1); $("#lbNext").onclick = () => openLb(cur + 1);
    lb.addEventListener("click", e => { if (e.target === lb) closeLb(); if (e.target.closest("[data-qv]")) closeLb(); });
    document.addEventListener("keydown", e => { if (lb.hidden) return; if (e.key === "Escape") closeLb(); if (e.key === "ArrowRight") openLb(cur + 1); if (e.key === "ArrowLeft") openLb(cur - 1); });
    let sx = null; lb.addEventListener("touchstart", e => sx = e.touches[0].clientX, { passive: true }); lb.addEventListener("touchend", e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) openLb(cur + (dx < 0 ? 1 : -1)); sx = null; });
  }

  /* ================= ABOUT ================= */
  if (page === "about") {
    $("#team").innerHTML = D.TEAM.map((t, i) => `<article class="member" data-reveal style="--d:${i * 0.07}s"><div class="member-img"><img src="${img(t.img)}" alt="${esc(t.name)}, ${esc(t.role)}" loading="lazy"></div><h3 class="h4">${esc(t.name)}</h3><p class="mono member-role">${esc(t.role)}</p><p class="muted">${esc(t.bio)}</p></article>`).join("");
    $("#vAddr").innerHTML = `${esc(B.address)}<br><span class="mono" style="font-size:13px">${esc(B.gps)}</span><br><span class="muted small">${esc(B.landmark)}.</span>`;
    $("#vHours").innerHTML = B.hours.map(h => `<li><b>${h.d}</b> ${h.h}</li>`).join("");
    $("#vTalk").innerHTML = `<a href="tel:${B.phone.replace(/\s/g, "")}">${esc(B.phone)}</a><br><a href="https://wa.me/${B.whatsapp}" target="_blank" rel="noopener">WhatsApp ${esc(B.whatsappDisplay)}</a><br><a href="mailto:${B.email}">${esc(B.email)}</a>`;
    $("#contact").addEventListener("submit", e => {
      e.preventDefault();
      let ok = true; ["cName", "cPhone", "cMsg"].forEach(id => { const el = $("#" + id); const bad = id === "cPhone" ? el.value.replace(/\D/g, "").length < 9 : el.value.trim().length < 2; el.classList.toggle("is-bad", bad); if (bad && ok) { el.focus(); ok = false; } });
      if (!ok) return;
      S.db.messages = S.db.messages || [];
      S.db.messages.push({ at: new Date().toISOString(), name: $("#cName").value.trim(), phone: $("#cPhone").value.trim(), about: $("#cAbout").value, msg: $("#cMsg").value.trim(), own: true });
      S.save();
      $$("#contact .form-grid, #contact > button").forEach(el => el.hidden = true); $("#sent").hidden = false;
    });
    U.reveals();
    parallax();
  }
})();
