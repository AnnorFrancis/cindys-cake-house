/* The Menu: grouped catalogue with category, occasion, search and sort filters. */
(function () {
  const D = CCH, S = CCHStore, U = CCHUI, { $, $$, esc } = U;
  const BG = ["bg-meringue", "bg-cocoa grain", "bg-blush", "bg-sobolo grain", "bg-meringue", "bg-cocoa grain", "bg-blush"];
  const state = { cat: "all", occ: "", q: "", sort: "feat" };

  // header line
  const counter = D.PRODUCTS.filter(p => p.cat === "patisserie" || p.cat === "viennoiserie").length;
  const h = new Date().getHours(), dow = new Date().getDay();
  const close = [17, 15, 19, 19, 19, 19, 20][dow];
  $("#todayLine").innerHTML = `${dow === 1 ? "A short Monday counter" : counter + " pâtisseries on the counter"} · ${h < close ? "open until " + close + ":00" : "opens tomorrow morning"}<br><span class="muted" style="font-size:13px">Same-day delivery on counter orders before noon</span>`;

  const counts = {}; D.PRODUCTS.forEach(p => counts[p.cat] = (counts[p.cat] || 0) + 1);
  $("#fCats").innerHTML = `<button class="chip is-on" data-cat="all" role="tab" aria-selected="true">All <span class="n">${D.PRODUCTS.length}</span></button>` + D.CATEGORIES.map(c => `<button class="chip" data-cat="${c.id}" role="tab" aria-selected="false">${esc(c.name)} <span class="n">${counts[c.id]}</span></button>`).join("");
  $("#fOcc").innerHTML = `<option value="">Any occasion</option>` + D.OCCASIONS.map(o => `<option value="${o.id}">${esc(o.name)}</option>`).join("");

  const featScore = p => (p.badge === "Signature" ? 3 : p.badge === "Bestseller" ? 2 : p.badge ? 1 : 0);
  function sortList(list) {
    const l = list.slice();
    if (state.sort === "lo") l.sort((a, b) => a.price - b.price);
    else if (state.sort === "hi") l.sort((a, b) => b.price - a.price);
    else if (state.sort === "az") l.sort((a, b) => a.name.localeCompare(b.name));
    else l.sort((a, b) => featScore(b) - featScore(a));
    return l;
  }
  function match(p) {
    if (state.cat !== "all" && p.cat !== state.cat) return false;
    if (state.occ && !p.occ.includes(state.occ)) return false;
    if (state.q) { const q = state.q.toLowerCase(); const hay = (p.name + " " + p.line + " " + (p.unit || "") + " " + p.cat).toLowerCase(); if (!q.split(/\s+/).every(w => hay.includes(w))) return false; }
    return true;
  }
  function render(jump) {
    const out = $("#menuOut");
    const filtered = state.occ || state.q || state.sort !== "feat";
    if (state.cat === "all" && !filtered) {
      out.innerHTML = D.CATEGORIES.map((c, i) => {
        const list = sortList(D.PRODUCTS.filter(p => p.cat === c.id));
        return `<section class="section-sm menu-group ${BG[i]}" id="${c.id}">
          <div class="wrap">
            <div class="mg-head"><div><p class="eyebrow">${String(i + 1).padStart(2, "0")} · ${list.length} pieces</p><h2 class="h2">${esc(c.name)}</h2></div><p class="muted mg-line">${esc(c.line)}.</p></div>
            <div class="pgrid">${list.map((p, k) => U.card(p, { wide: k === 0 && list.length > 6 })).join("")}</div>
          </div></section>`;
      }).join("");
    } else {
      const list = sortList(D.PRODUCTS.filter(match));
      const cat = D.CATEGORIES.find(c => c.id === state.cat);
      const occ = D.OCCASIONS.find(o => o.id === state.occ);
      out.innerHTML = `<section class="section-sm bg-meringue menu-group" id="results"><div class="wrap">
        <div class="mg-head"><div><p class="eyebrow">${list.length} result${list.length === 1 ? "" : "s"}</p><h2 class="h2">${esc(cat ? cat.name : "The whole menu")}${occ ? ` for ${esc(occ.name.toLowerCase())}` : ""}</h2></div>
        ${filtered ? `<button class="link-u" id="clearF">Clear filters</button>` : ""}</div>
        ${list.length ? `<div class="pgrid">${list.map(p => U.card(p)).join("")}</div>` : `<div class="empty"><p class="h4">Nothing matches “${esc(state.q)}”.</p><p>Try a flavour like pistachio or red velvet, or describe it to Ama and she'll find the closest thing.</p><button class="btn btn-sm" onclick="CCHConcierge.open(${JSON.stringify(state.q || "")})">Ask Ama</button></div>`}
      </div></section>`;
      const cf = $("#clearF"); cf && cf.addEventListener("click", () => { Object.assign(state, { occ: "", q: "", sort: "feat" }); $("#fOcc").value = ""; $("#fQ").value = ""; $("#fSort").value = "feat"; render(true); });
    }
    U.reveals(out);
    if (window.ScrollTrigger) ScrollTrigger.refresh();
    if (jump) { const top = $("#filters").getBoundingClientRect().top + window.scrollY; if (window.scrollY > top) (U.lenis ? U.lenis.scrollTo(top) : window.scrollTo(0, top)); }
  }
  $("#fCats").addEventListener("click", e => {
    const b = e.target.closest("[data-cat]"); if (!b) return;
    $$("#fCats .chip").forEach(c => { c.classList.toggle("is-on", c === b); c.setAttribute("aria-selected", c === b); });
    state.cat = b.dataset.cat;
    if (state.cat !== "all" && !state.occ && !state.q && state.sort === "feat") {
      // keep grouped view but jump to the section
      render(false);
      const sec = $("#" + state.cat);
      // show only that group
      $$(".menu-group").forEach(g => g.style.display = g.id === state.cat ? "" : "none");
      const top = $("#filters").getBoundingClientRect().top + scrollY;
      U.lenis ? U.lenis.scrollTo(top) : window.scrollTo(0, top);
      return;
    }
    render(true);
  });
  $("#fOcc").addEventListener("change", e => { state.occ = e.target.value; render(true); });
  $("#fSort").addEventListener("change", e => { state.sort = e.target.value; render(true); });
  let t; $("#fQ").addEventListener("input", e => { clearTimeout(t); t = setTimeout(() => { state.q = e.target.value.trim(); render(false); }, 180); });

  render(false);
  // deep links: menu.html#wedding, menu.html?q=red+velvet
  const qp = new URLSearchParams(location.search);
  if (qp.get("q")) { $("#fQ").value = qp.get("q"); state.q = qp.get("q"); render(false); }
  if (qp.get("occ")) { $("#fOcc").value = qp.get("occ"); state.occ = qp.get("occ"); render(false); }
  if (location.hash && $(location.hash)) setTimeout(() => { const el = $(location.hash); const y = el.getBoundingClientRect().top + scrollY - 70; U.lenis ? U.lenis.scrollTo(y, { immediate: true }) : window.scrollTo(0, y); }, 300);
})();
