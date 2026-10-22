/* Home page: dome slideshow, ticker, collections showcase, horizontal signatures,
   atelier teaser, reviews, delivery checker, gallery strip. */
(function () {
  const D = CCH, S = CCHStore, U = CCHUI, { $, $$, esc, img } = U;
  const M = U.MOTION && window.gsap;

  /* ---------------- hero ---------------- */
  const SLIDES = [
    { id: "pat-croissant", eb: "The bakery", t: "Out of the oven|at ten past seven", l: "Croissants laminated by hand overnight, on the counter every morning.", chip: "int-viennoiserie-wall" },
    { id: "pat-eclair-strawberry", eb: "Pâtisserie", t: "Éclairs, tarts,|mille-feuille", l: "The pastry counter, filled fresh before you wake.", chip: "int-eclair-display" },
    { id: "cel-lambeth-rose", eb: "Cakes", t: "Piped by hand,|gilded by hand", l: "Blush over-piping and gold-leaf cherries, in the sponge you choose.", chip: "life-night-cake" },
    { id: "pat-chocolate-fig-tart", eb: "Tarts", t: "Worth crossing|Accra for", l: "Ghana cocoa, fresh figs and a crisp sablé crust.", chip: "gal-pain-macro" },
    { id: "wed-cantonments", eb: "Weddings", t: "Five tiers,|one quiet gasp", l: "Combed buttercream and garden roses, set up at your venue.", chip: "wed-couple-garden" }
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
      .from("#heroChip", { scale: 0, duration: 0.9, ease: "back.out(1.6)" }, "-=0.8");
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
      "Pistachio mille-feuille back on the counter",
      "Same-day pâtisserie, order before noon",
      `${due} cakes leaving the kitchen today`,
      `${sat.left} cake slots left for ${sat.day}`,
      `${up} birthdays we're baking for this week`
    ];
    const row = items.map(t => `<span>${esc(t)}</span><i aria-hidden="true"></i>`).join("");
    $("#ticker").innerHTML = row + row;
  })();

  /* ---------------- collections: index, arched showcase, most ordered ---------------- */
  (function () {
    const cover = { couture: "cel-pearl-sculpture", wedding: "wed-candlelight-rose", patisserie: "pat-millefeuille", viennoiserie: "gal-croissants", confection: "conf-macaron-stack", events: "evt-macaron-tower", gifting: "gift-petite-box" };
    const score = { Bestseller: 3, Signature: 3, New: 2, "Book first": 0 };
    const C = D.CATEGORIES.map(c => {
      const ps = D.PRODUCTS.filter(p => p.cat === c.id);
      const picks = ps.map((p, k) => ({ p, s: (p.badge ? score[p.badge] : 1) * 100 - k })).filter(x => x.p.img !== cover[c.id]).sort((a, b) => b.s - a.s).slice(0, 3).map(x => x.p);
      return { c, n: ps.length, min: Math.min(...ps.map(p => p.price)), picks };
    });
    const two = n => String(n).padStart(2, "0");
    const list = $("#cxList"), arch = $("#cxArch"), cardEl = $("#cxCard"), picksEl = $("#cxPicks"), cta = $("#cxCta");
    $("#cxAll").textContent = `All ${D.PRODUCTS.length} creations →`;
    list.innerHTML = C.map((x, i) => `<li><button class="cx-item" type="button" data-i="${i}" aria-pressed="false">
      <span class="cx-no mono">${two(i + 1)}</span><span class="cx-name">${esc(x.c.name)}</span>
      <span class="cx-meta mono">${x.n} pieces · from ${S.money(x.min)}</span><i class="cx-bar" aria-hidden="true"><b></b></i></button></li>`).join("");
    // every photo is fetched up front, so a change never waits on the network; nothing ever leaves the arch
    const srcs = C.map(x => img(cover[x.c.id], "full"));
    srcs.forEach(u => { const im = new Image(); im.src = u; });
    const items = $$(".cx-item", list);
    let cur = -1, prog = null;

    function fill(i) {
      const x = C[i];
      cardEl.innerHTML = `<span class="cx-card-no mono">${two(i + 1)} / ${two(C.length)}</span><p>${esc(x.c.line)}</p>`;
      picksEl.innerHTML = x.picks.map(p => `<li><button class="cx-pick" type="button" data-qv="${p.id}">
        <img src="${img(p.img)}" alt="" loading="lazy" decoding="async">
        <span class="cx-pick-t"><b>${esc(p.name)}</b><em>${esc(p.unit || p.line)}</em></span>
        <span class="cx-pick-p mono">${p.from ? "from " : ""}${S.money(p.price)}</span></button></li>`).join("");
      cta.href = `menu.html#${x.c.id}`;
      cta.querySelector("span").textContent = `Explore ${x.c.name.toLowerCase()} →`;
      if (M) {
        gsap.fromTo(cardEl.children, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", stagger: 0.06, overwrite: true });
        gsap.fromTo(picksEl.children, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", stagger: 0.07, delay: 0.1, overwrite: true });
      }
    }
    function show(i) {
      if (i === cur) return;
      const from = cur; cur = i;
      items.forEach((b, k) => { b.classList.toggle("is-on", k === i); b.setAttribute("aria-pressed", k === i); });
      // on phones the index is a row of pills: keep the active one in sight without moving the page
      if (list.scrollWidth > list.clientWidth + 2) list.scrollTo({ left: Math.max(0, items[i].parentElement.offsetLeft - 16), behavior: M && from >= 0 ? "smooth" : "auto" });
      fill(i);
      // the slice: each new cake is cut in on top of what is showing; layers underneath are only
      // removed once it fully covers them, so a quick change of mind can never flash or jump
      const f = document.createElement("figure");
      f.className = "cx-slide";
      f.innerHTML = `<img src="${srcs[i]}" alt="${esc(C[i].c.name)}" decoding="async">`;
      arch.appendChild(f);
      const clearBelow = () => { let el = f.previousElementSibling; while (el) { const p = el.previousElementSibling; if (M) gsap.killTweensOf([el, el.firstElementChild]); el.remove(); el = p; } };
      if (!M || from < 0) { clearBelow(); return; }
      const dir = i > from ? 1 : -1;
      gsap.fromTo(f, { clipPath: dir > 0 ? "polygon(100% 0%, 130% 0%, 100% 100%, 70% 100%)" : "polygon(-30% 0%, 0% 0%, -30% 100%, -60% 100%)" },
        { clipPath: "polygon(-30% 0%, 130% 0%, 100% 100%, -60% 100%)", duration: 1.05, ease: "expo.inOut", onComplete: () => { clearBelow(); gsap.set(f, { clearProps: "clipPath" }); } });
      gsap.fromTo(f.firstElementChild, { scale: 1.16 }, { scale: 1, duration: 1.5, ease: "expo.out" });
    }

    // turns slowly on its own while in view; a hover pauses it, a click hands control to the visitor
    let inView = false, hovering = false, stopped = !M;
    function arm() {
      if (prog) prog.kill();
      if (!M) return;
      $$(".cx-bar b", list).forEach(b => gsap.set(b, { scaleX: 0 }));
      if (stopped) return;
      prog = gsap.fromTo(items[cur].querySelector(".cx-bar b"), { scaleX: 0 }, { scaleX: 1, duration: 5.5, ease: "none", paused: !inView || hovering, onComplete: () => { show((cur + 1) % C.length); arm(); } });
    }
    const sync = () => { if (prog) (inView && !hovering) ? prog.resume() : prog.pause(); };
    const pick = (i, stop) => { if (stop) stopped = true; show(i); arm(); };
    show(0); arm();

    let intent = 0;
    const canHover = matchMedia("(hover: hover)").matches;
    items.forEach((b, i) => {
      b.addEventListener("click", () => { clearTimeout(intent); pick(i, true); });
      b.addEventListener("focus", () => { if (!canHover || b.matches(":focus-visible")) pick(i, true); });
      if (canHover) {
        b.addEventListener("mouseenter", () => { clearTimeout(intent); intent = setTimeout(() => pick(i), 120); });
        b.addEventListener("mouseleave", () => clearTimeout(intent));
      }
    });
    const cx = $("#cx");
    cx.addEventListener("mouseenter", () => { hovering = true; sync(); });
    cx.addEventListener("mouseleave", () => { hovering = false; sync(); });
    if ("IntersectionObserver" in window) new IntersectionObserver(es => { inView = es[0].isIntersecting; sync(); }, { threshold: 0.35 }).observe(arch);
    if (M) gsap.from(".cx-stage", { clipPath: "inset(100% 0% 0% 0% round 999px 999px 28px 28px)", duration: 1.4, ease: "expo.inOut", scrollTrigger: { trigger: "#cx", start: "top 75%" }, clearProps: "clipPath" });
  })();

  /* ---------------- signatures (horizontal) ---------------- */
  (function () {
    const ids = ["pat-pistachio-millefeuille", "pat-croissant", "pat-chocolate-fig-tart", "pat-eclair-cocoa", "cel-lambeth-rose", "pat-babka-knot", "conf-truffles", "cel-hexagon-garden", "wed-cantonments"];
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
