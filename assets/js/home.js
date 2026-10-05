/* Home page: dome slideshow, ticker, collections hover, horizontal signatures,
   atelier teaser, reviews, delivery checker, gallery strip. */
(function () {
  const D = CCH, S = CCHStore, U = CCHUI, { $, $$, esc, img } = U;
  const M = U.MOTION && window.gsap;

  /* ---------------- hero ---------------- */
  const SLIDES = [
    { id: "wed-cantonments", eb: "Weddings", t: "Five tiers,|one quiet gasp", l: "The Cantonments: combed ivory buttercream, garden roses and ivy, set up at your venue by two of our team.", chip: "wed-couple-garden" },
    { id: "cel-lambeth-rose", eb: "Birthdays", t: "Piped by hand,|gilded by hand", l: "The Lambeth Rosé: blush meringue over-piping, gold-leaf cherries, and a sponge you choose.", chip: "life-night-cake" },
    { id: "pat-eclair-strawberry", eb: "Pâtisserie", t: "At the counter|by ten past seven", l: "Éclairs, mille-feuille and croissants laminated overnight. Order before noon for same-day delivery.", chip: "int-eclair-display" },
    { id: "cel-hexagon-garden", eb: "Couture", t: "A garden,|in buttercream", l: "Hexagon Garden: two tall tiers, every petal piped by Nana Ama. Five days' notice, worth every one.", chip: "proc-piping-border" },
    { id: "evt-orchid-table", eb: "Dessert tables", t: "Tables that|hold the room", l: "The Orchid Table: twelve desserts on gold stands for a hundred guests, styled and cleared by us.", chip: "life-print-dress" }
  ];
  const domeSlides = $("#domeSlides"), title = $("#heroTitle"), lede = $("#heroLede"), dots = $("#heroDots"), card = $("#domeCard");
  domeSlides.innerHTML = SLIDES.map((s, i) => `<figure class="dome-slide ${i ? "" : "is-on"}" data-i="${i}"><img src="${img(S.byId[s.id].img, "full")}" alt="${esc(S.byId[s.id].name)}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}></figure>`).join("");
  dots.innerHTML = SLIDES.map((s, i) => `<li><button data-go="${i}" aria-label="Show ${esc(S.byId[s.id].name)}"><span class="mono">${String(i + 1).padStart(2, "0")}</span><em>${esc(s.eb)}</em><i><b></b></i></button></li>`).join("");
  let cur = 0, timer = null, t0 = 0;
  const DUR = 6500;
  function satSlots() {
    const t = S.today(); const d = S.addDays(t, ((6 - t.getDay()) + 7) % 7 || 7); const st = S.dayState(S.iso(d));
    return { day: S.fmtDate(S.iso(d), { weekday: "long" }), left: st.left };
  }
  function paint(i, first) {
    const s = SLIDES[i], p = S.byId[s.id];
    $("#heroEyebrow").textContent = s.eb;
    $("#heroNo").textContent = `${String(i + 1).padStart(2, "0")} / ${String(SLIDES.length).padStart(2, "0")}`;
    title.innerHTML = s.t.split("|").map((t, k) => `<span class="split-line"><span style="--d:${k * 0.08}s">${t}</span></span>`).join("");
    lede.textContent = s.l;
    const sat = satSlots();
    card.innerHTML = `<div class="dc-top"><span class="mono">${esc(p.unit)}</span><span class="dc-cap"><i></i>${p.cat === "patisserie" || p.cat === "viennoiserie" ? "Fresh today" : `${sat.left} ${sat.day} slots left`}</span></div>
      <div class="dc-row"><div><b class="h4">${esc(p.name)}</b><span class="price">${p.from ? "from " : ""}${S.money(p.price)}</span></div><button class="dc-add" data-qv="${p.id}" aria-label="View ${esc(p.name)}">${U.I.plus}</button></div>`;
    $("#heroChip img").src = img(s.chip);
    $$("button", dots).forEach((b, k) => b.classList.toggle("is-on", k === i));
    void title.offsetWidth; // restart the line transition
    setTimeout(() => title.classList.add("is-in"), 20);
    if (!first && M) {
      gsap.fromTo(lede, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.15 });
      gsap.fromTo(card, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.35 });
      gsap.fromTo("#heroChip", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.6)", delay: 0.25 });
    }
  }
  function go(i, dir) {
    if (i === cur) return;
    const prev = $$(".dome-slide")[cur], next = $$(".dome-slide")[i];
    title.classList.remove("is-in");
    if (M) {
      next.classList.add("is-on");
      gsap.set(next, { zIndex: 3 }); gsap.set(prev, { zIndex: 2 });
      // the slice: a diagonal cut sweeps the new cake into the dome
      gsap.fromTo(next, { clipPath: dir < 0 ? "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)" : "polygon(100% 0%, 130% 0%, 100% 100%, 70% 100%)" },
        { clipPath: "polygon(-30% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 1.15, ease: "expo.inOut", onComplete: () => { prev.classList.remove("is-on"); gsap.set(next, { clearProps: "clipPath,zIndex" }); gsap.set(prev, { clearProps: "zIndex" }); } });
      gsap.fromTo(next.querySelector("img"), { scale: 1.18 }, { scale: 1, duration: 1.6, ease: "expo.out" });
      gsap.to(prev.querySelector("img"), { scale: 1.06, duration: 1.1, ease: "expo.inOut", onComplete: () => gsap.set(prev.querySelector("img"), { scale: 1 }) });
    } else { prev.classList.remove("is-on"); next.classList.add("is-on"); }
    cur = i; setTimeout(() => paint(i), M ? 120 : 0); restart();
  }
  function restart() {
    clearInterval(timer); t0 = performance.now();
    if (U.POSE) return;
    timer = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / DUR);
      const bar = $$("button", dots)[cur]?.querySelector("b"); if (bar) bar.style.transform = `scaleX(${k})`;
      $$("button b", dots).forEach((b, j) => j !== cur && (b.style.transform = "scaleX(0)"));
      if (k >= 1 && !paused) go((cur + 1) % SLIDES.length, 1);
    }, 60);
  }
  let paused = false;
  dots.addEventListener("click", e => { const b = e.target.closest("[data-go]"); if (b) go(+b.dataset.go, +b.dataset.go > cur ? 1 : -1); });
  $("#dome").addEventListener("mouseenter", () => { paused = true; });
  $("#dome").addEventListener("mouseleave", () => { paused = false; t0 = performance.now(); });
  document.addEventListener("keydown", e => { if (document.activeElement && /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return; const r = $("#hero").getBoundingClientRect(); if (r.bottom < 0) return; if (e.key === "ArrowRight") go((cur + 1) % SLIDES.length, 1); if (e.key === "ArrowLeft") go((cur - 1 + SLIDES.length) % SLIDES.length, -1); });
  let sx = null; $("#dome").addEventListener("touchstart", e => sx = e.touches[0].clientX, { passive: true });
  $("#dome").addEventListener("touchend", e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) go(dx < 0 ? (cur + 1) % SLIDES.length : (cur - 1 + SLIDES.length) % SLIDES.length, dx < 0 ? 1 : -1); sx = null; });
  paint(0, true);

  function heroIn(fromIntro) {
    restart();
    if (!M) return;
    const tl = gsap.timeline({ delay: fromIntro ? 0.05 : U.curtained ? 0.5 : 0.1 });
    tl.from("#dome", { clipPath: "inset(100% 0% 0% 0% round 999px 999px 28px 28px)", duration: 1.5, ease: "expo.inOut" })
      .from("#domeSlides img", { scale: 1.3, duration: 2, ease: "expo.out" }, "-=1")
      .from(".hero-eyebrow, .hero-lede, .hero-ctas, .hero-dots", { opacity: 0, y: 20, stagger: 0.08, duration: 0.9, ease: "power3.out" }, "-=1.5")
      .from("#domeCard", { opacity: 0, y: 24, duration: 0.8, ease: "power3.out" }, "-=0.9")
      .from("#heroChip", { scale: 0, duration: 0.9, ease: "back.out(1.6)" }, "-=0.8")
      .from(".hero-side", { opacity: 0, duration: 1 }, "-=0.8");
    // parallax on the dome
    gsap.to("#domeSlides", { yPercent: 8, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });
  }
  U.intro(played => { heroIn(played); });

  /* ---------------- ticker ---------------- */
  (function () {
    const sat = satSlots();
    const due = S.db.orders.filter(o => o.date === S.iso(S.today()) && o.channel !== "walk-in").length;
    const up = S.upcomingOccasions(7).length;
    const items = [
      "Croissants out of the oven at 7:10",
      `${due} cakes leaving the kitchen today`,
      `${sat.left} couture slots left for ${sat.day}`,
      "Pistachio mille-feuille back on the counter",
      `${up} birthdays we're baking for this week`,
      "Order before noon for same-day pâtisserie delivery",
      "Wedding tastings Tuesday to Saturday"
    ];
    const row = items.map(t => `<span>${esc(t)}</span><i aria-hidden="true"></i>`).join("");
    $("#ticker").innerHTML = row + row;
  })();

  /* ---------------- manifesto word reveal ---------------- */
  (function () {
    const el = $("#mani");
    // wrap words (text nodes only) so they can light up on scroll
    const walk = node => { [...node.childNodes].forEach(n => { if (n.nodeType === 3) { const f = document.createDocumentFragment(); n.textContent.split(/(\s+)/).forEach(w => { if (!w) return; if (/^\s+$/.test(w)) f.appendChild(document.createTextNode(w)); else { const s = document.createElement("span"); s.className = "mw"; s.textContent = w; f.appendChild(s); } }); n.replaceWith(f); } }); };
    walk(el);
    if (M) gsap.fromTo($$(".mw, .ichip", el), { opacity: 0.16 }, { opacity: 1, stagger: 0.05, ease: "none", scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true } });
  })();

  /* ---------------- collections ---------------- */
  (function () {
    const counts = {}; D.PRODUCTS.forEach(p => counts[p.cat] = (counts[p.cat] || 0) + 1);
    const cover = { couture: "cel-pearl-sculpture", wedding: "wed-monogram", patisserie: "pat-pistachio-millefeuille", viennoiserie: "pat-croissant", confection: "conf-macaron-12", events: "evt-orchid-table", gifting: "gift-pistachio-ribbon" };
    const minP = c => Math.min(...D.PRODUCTS.filter(p => p.cat === c).map(p => p.price));
    $("#collList").innerHTML = D.CATEGORIES.map(c => `<li data-reveal><a class="coll-row" href="menu.html#${c.id}" data-img="${img(cover[c.id], "full")}">
      <img class="coll-thumb" src="${img(cover[c.id])}" alt="" loading="lazy">
      <span class="coll-name">${esc(c.name)}</span>
      <span class="coll-line">${esc(c.line)}</span>
      <span class="coll-meta mono">${counts[c.id]} · from ${S.money(minP(c.id))}</span>
      <span class="coll-arr" aria-hidden="true">→</span></a></li>`).join("");
    U.reveals($("#collList"));
    const fl = $("#collFloat"), fimg = fl.querySelector("img");
    if (!M || !matchMedia("(hover: hover) and (min-width: 1021px)").matches) return;
    const xTo = gsap.quickTo(fl, "x", { duration: 0.6, ease: "power3" }), yTo = gsap.quickTo(fl, "y", { duration: 0.6, ease: "power3" });
    const sec = $("#collections");
    sec.addEventListener("mousemove", e => { xTo(e.clientX); yTo(e.clientY); });
    $$(".coll-row").forEach(r => {
      r.addEventListener("mouseenter", () => { fimg.src = r.dataset.img; gsap.to(fl, { opacity: 1, scale: 1, rotate: -4, duration: 0.5, ease: "power3.out" }); });
      r.addEventListener("mouseleave", () => gsap.to(fl, { opacity: 0, scale: 0.85, rotate: 0, duration: 0.4 }));
    });
  })();

  /* ---------------- signatures (horizontal) ---------------- */
  (function () {
    const ids = ["cel-lambeth-rose", "cel-hexagon-garden", "cel-pearl-sculpture", "pat-chocolate-fig-tart", "wed-cantonments", "conf-truffles", "kid-princess-castle", "gift-pistachio-ribbon", "evt-orchid-table"];
    const track = $("#sigTrack");
    track.innerHTML = ids.map(id => U.card(S.byId[id], { reveal: false, eager: true })).join("") + `<a class="sig-end" href="menu.html"><span class="h3">See all ${D.PRODUCTS.length}<br>creations</span><span class="sig-end-arr">→</span></a>`;
    track.classList.add("is-swipe");
    if (!M) return;
    // pinned horizontal scroll on desktop only; native swipe below 1021px
    gsap.matchMedia().add("(min-width: 1021px)", () => {
      track.classList.remove("is-swipe");
      const pin = $(".sig-pin");
      const dist = () => track.scrollWidth - window.innerWidth + parseFloat(getComputedStyle(track).paddingLeft);
      gsap.to(track, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: "#sig", start: "top top", end: () => "+=" + dist(), pin: pin, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1 } });
      $$(".pcard", track).forEach((c, i) => gsap.from(c, { y: 60 + (i % 3) * 30, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: "#sig", start: "top 70%" }, delay: i * 0.05 }));
      return () => track.classList.add("is-swipe");
    });
  })();

  /* ---------------- atelier teaser ---------------- */
  (function () {
    const mc = $("#miniCake");
    const setFinish = (c, c2) => { mc.style.setProperty("--c", c); mc.style.setProperty("--c2", c2); };
    setFinish("#f4ece6", "#e6d8cf");
    $("#teaseFinish").addEventListener("click", e => {
      const b = e.target.closest(".chip"); if (!b) return;
      $$("#teaseFinish .chip").forEach(x => x.classList.toggle("is-on", x === b));
      setFinish(b.dataset.c, b.dataset.c2);
      const prices = { Ivory: 8400, Blush: 8600, Sobolo: 9200, Cocoa: 8800, Pistachio: 9000 };
      $("#teasePrice").textContent = "from " + S.money(prices[b.textContent.trim()] || 8400);
      if (M) gsap.fromTo(".mc-tier", { scaleX: 0.96 }, { scaleX: 1, duration: 0.6, ease: "elastic.out(1, .5)", stagger: 0.05 });
    });
    if (M) {
      gsap.from(".mc-tier, .mc-topper", { y: -260, opacity: 0, duration: 1, ease: "bounce.out", stagger: { each: 0.22, from: "end" }, scrollTrigger: { trigger: "#teaseStage", start: "top 70%" } });
      gsap.from(".tease-price", { opacity: 0, y: 30, duration: 0.8, delay: 1.1, scrollTrigger: { trigger: "#teaseStage", start: "top 70%" } });
    }
  })();

  /* ---------------- reviews ---------------- */
  (function () {
    const R = D.REVIEWS; let i = 0, t;
    $("#rvDots").innerHTML = R.map((_, k) => `<button aria-label="Review ${k + 1}" data-r="${k}"></button>`).join("");
    function show(k) {
      i = (k + R.length) % R.length; const r = R[i];
      const st = $("#rvStage");
      st.innerHTML = `<blockquote class="rv-q"><p>${esc(r.q)}</p><footer><b>${esc(r.n)}</b><span class="mono">${esc(r.a)}</span></footer></blockquote>`;
      $$("#rvDots button").forEach((b, j) => b.classList.toggle("is-on", j === i));
      if (M) gsap.from(st.querySelector("p"), { opacity: 0, y: 24, filter: "blur(6px)", duration: 0.9, ease: "power3.out" });
      clearTimeout(t); if (!U.POSE) t = setTimeout(() => show(i + 1), 8000);
    }
    $("#rvDots").addEventListener("click", e => { const b = e.target.closest("[data-r]"); b && show(+b.dataset.r); });
    $("#rvPrev").onclick = () => show(i - 1); $("#rvNext").onclick = () => show(i + 1);
    show(0);
  })();

  /* ---------------- delivery ---------------- */
  (function () {
    $("#zoneList").innerHTML = D.ZONES.map(z => `<li><span>${esc(z.name)}</span><span class="mono">${z.fee ? S.money(z.fee) : "Free"}</span><span class="mono">${esc(z.eta)}</span></li>`).join("");
    const sel = $("#zoneSel");
    sel.innerHTML = `<option value="">Choose your neighbourhood</option>` + D.ZONES.map(z => `<option value="${z.id}">${esc(z.name)}</option>`).join("");
    sel.addEventListener("change", () => { const z = D.ZONES.find(x => x.id === sel.value); $("#zoneOut").textContent = z ? `${z.fee ? S.money(z.fee) : "Free"} · about ${z.eta}` : ""; $$("#zoneList li").forEach((li, k) => li.classList.toggle("is-on", z && D.ZONES[k] === z)); });
  })();

  /* ---------------- strip ---------------- */
  (function () {
    const a = ["gal-macaron-pastel", "cel-gilded-rose", "life-white-dress", "pat-tartelettes", "wed-sage-gold", "gal-croissant-dust", "cel-peony-crown", "life-joy-pink", "gal-petits-silver"];
    const b = ["wed-noir-botanica", "gal-glaze-pour", "life-family", "conf-bonbons", "baby-moon-clouds", "int-cafe", "pat-noir-cube", "life-blow-candle", "cel-watercolour"];
    const row = list => list.map(n => `<a href="gallery.html" class="strip-item"><img src="${img(n)}" alt="" loading="lazy"></a>`).join("");
    $("#stripA").innerHTML = row(a) + row(a); $("#stripB").innerHTML = row(b) + row(b);
    if (M) {
      gsap.fromTo("#stripA", { xPercent: 0 }, { xPercent: -22, ease: "none", scrollTrigger: { trigger: ".strip", start: "top bottom", end: "bottom top", scrub: true } });
      gsap.fromTo("#stripB", { xPercent: -26 }, { xPercent: -4, ease: "none", scrollTrigger: { trigger: ".strip", start: "top bottom", end: "bottom top", scrub: true } });
      $$("[data-parallax] img").forEach(im => gsap.fromTo(im, { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: im.closest("section"), start: "top bottom", end: "bottom top", scrub: true } }));
    }
  })();

  window.addEventListener("load", () => window.ScrollTrigger && ScrollTrigger.refresh());
})();
