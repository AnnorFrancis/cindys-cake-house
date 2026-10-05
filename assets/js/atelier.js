/* ==========================================================================
   The Cake Atelier: a live cake builder. Every choice redraws the cake,
   reprices it, and recalculates notice and kitchen availability. The
   finished design goes into the bag as a custom line item.
   ========================================================================== */
(function () {
  const D = CCH, S = CCHStore, U = CCHUI, { $, $$, esc, img } = U;
  const M = U.MOTION && window.gsap;

  /* ---------- the option model ---------- */
  const TIER = { 6: { w: 118, serves: 20, price: 1400 }, 8: { w: 168, serves: 34, price: 2000 }, 10: { w: 218, serves: 50, price: 2900 }, 12: { w: 266, serves: 70, price: 3800 }, 14: { w: 314, serves: 95, price: 4900 } };
  const STACK = { 2: [6, 8], 3: [6, 8, 10], 4: [6, 8, 10, 12], 5: [6, 8, 10, 12, 14] };
  const OPT = {
    occasion: [["birthday", "Birthday"], ["wedding", "Wedding"], ["engagement", "Knocking / engagement"], ["baby", "Baby & naming"], ["romance", "Anniversary"], ["corporate", "Corporate"], ["everyday", "Just because"]],
    tiers: [[1, "1 tier"], [2, "2 tiers"], [3, "3 tiers"], [4, "4 tiers"], [5, "5 tiers"]],
    shape: [["round", "Round", 1], ["hexagon", "Hexagon", 1.15], ["heart", "Heart", 1.1]],
    height: [["classic", "Classic", 1], ["tall", "Tall · double barrel", 1.3]],
    finish: [["smooth", "Smooth buttercream", 1], ["combed", "Combed buttercream", 1], ["seminaked", "Semi-naked", 0.92], ["fondant", "Fondant", 1.2], ["vintage", "Vintage piping", 1.3], ["palette", "Palette knife", 1.15]],
    colour: [["ivory", "Ivory", "#f4ece6", "#e2d4c8"], ["blush", "Blush", "#f2cdd2", "#dcaab3"], ["sobolo", "Sobolo", "#7f2643", "#58142c"], ["cocoa", "Cocoa", "#5b3528", "#3c2118"], ["pistachio", "Pistachio", "#cad8b0", "#a6b98a"], ["powder", "Powder blue", "#d3e1ec", "#a9bfd1"], ["butter", "Butter", "#f6e5ad", "#e0c57d"], ["noir", "Noir", "#2d2725", "#151110"]],
    decor: [["flowers", "Fresh flowers", 350, "tier", "Roses and greenery from our Aburi grower"], ["sugar", "Sugar flowers", 650, "tier", "Hand-made by Nana Ama. Adds 3 days"], ["gold", "Gold leaf", 250, "tier", "Torn 23-carat edible leaf"], ["drip", "Ganache drip", 180, "cake", "Dark, or white on dark colours"], ["fruit", "Fresh fruit & berries", 220, "tier", "Seasonal: strawberries, figs, mango"], ["macarons", "Macarons & meringues", 320, "cake", "A crown on the top tier"], ["topper", "Monogram topper", 240, "cake", "Gold acrylic, your initials or number"], ["plaque", "Message plaque", 120, "cake", "Piped on a white chocolate plaque"]]
  };
  const PREMIUM = ["Pistachio & rose", "Sobolo hibiscus & raspberry"];

  const saved = (() => { try { return JSON.parse(sessionStorage.getItem("cch.atelier")) || null; } catch (e) { return null; } })();
  const st = Object.assign({ occasion: "birthday", guests: 30, tiers: 1, shape: "round", height: "classic", finish: "smooth", colour: "ivory", decor: ["flowers"], flavours: [D.FLAVOURS[1]], plaque: "", notes: "", date: null, files: [] }, saved || {});
  st.files = [];
  const persist = () => { try { const c = Object.assign({}, st); delete c.files; sessionStorage.setItem("cch.atelier", JSON.stringify(c)); } catch (e) {} };

  /* ---------- derived values ---------- */
  function sizes() {
    if (st.tiers === 1) return [st.guests <= 20 ? 6 : st.guests <= 34 ? 8 : 10];
    return STACK[st.tiers];
  }
  function serves() { return sizes().reduce((s, z) => s + TIER[z].serves, 0) * (st.height === "tall" ? 1.25 : 1) | 0; }
  function leadDays() {
    let d = 2;
    if (st.tiers >= 3) d = 5; if (st.tiers >= 4) d = 10;
    if (st.finish === "fondant" || st.finish === "vintage") d += 1;
    if (st.decor.includes("sugar")) d += 3;
    return d;
  }
  function pricing() {
    const lines = [];
    const sz = sizes();
    const f = OPT.finish.find(x => x[0] === st.finish), sh = OPT.shape.find(x => x[0] === st.shape), h = OPT.height.find(x => x[0] === st.height);
    let base = 0;
    sz.forEach((z, i) => { let p = TIER[z].price; if (PREMIUM.includes(st.flavours[i] || st.flavours[0])) p *= 1.08; base += p; });
    lines.push([`${sz.length} ${sz.length > 1 ? "tiers" : "tier"} (${sz.map(z => z + "″").join(" + ")}), sponge & filling`, base]);
    const mult = f[2] * sh[2] * h[2];
    if (mult !== 1) lines.push([`${f[1]}${sh[2] !== 1 ? ", " + sh[1].toLowerCase() : ""}${h[2] !== 1 ? ", tall" : ""}`, base * (mult - 1)]);
    st.decor.forEach(id => { const d = OPT.decor.find(x => x[0] === id); lines.push([d[1], d[3] === "tier" ? d[2] * sz.length : d[2]]); });
    const total = Math.round(lines.reduce((s, l) => s + l[1], 0) / 10) * 10;
    return { lines, total, deposit: Math.round(total * D.BUSINESS.depositRate / 10) * 10 };
  }
  function ref() {
    const big = st.tiers >= 3;
    if (st.shape === "heart") return "cel-golden-heart";
    if (st.shape === "hexagon") return "cel-hexagon-garden";
    if (st.decor.includes("sugar")) return big ? "wed-candlelight-rose" : "cel-lilac-atelier";
    if (st.finish === "vintage") return "cel-lambeth-rose";
    if (st.finish === "palette") return "cel-watercolour";
    if (st.finish === "fondant") return st.colour === "noir" ? "wed-noir-botanica" : big ? "wed-sage-gold" : "cel-pearl-sculpture";
    if (st.finish === "seminaked") return big ? (st.decor.includes("fruit") ? "wed-berries-peonies" : "wed-dusty-rose") : st.decor.includes("fruit") ? "cel-tropical" : "cel-raspberry-victoria";
    if (st.decor.includes("drip")) return st.decor.includes("macarons") ? "cel-lilac-indulgence" : "cel-meringue-crown";
    if (st.decor.includes("gold")) return "cel-gilded-rose";
    if (st.finish === "combed") return big ? "wed-cantonments" : "wed-ivory-garden";
    return big ? "wed-monogram" : st.decor.includes("flowers") ? "cel-rose-garden" : "cel-petite-bow";
  }

  /* ---------- render options ---------- */
  function chips(key) {
    const row = $(`[data-key="${key}"]`);
    row.innerHTML = OPT[key].map(o => `<button class="chip ${String(st[key]) === String(o[0]) ? "is-on" : ""}" data-v="${o[0]}" ${key === "shape" && o[0] === "heart" && st.tiers > 2 ? "disabled" : ""}>${esc(o[1])}${o[2] && o[2] !== 1 && key !== "tiers" ? `<span class="n">${o[2] > 1 ? "+" : "−"}${Math.round(Math.abs(o[2] - 1) * 100)}%</span>` : ""}</button>`).join("");
  }
  function swatches() {
    $('[data-key="colour"]').innerHTML = OPT.colour.map(c => `<button class="sw ${st.colour === c[0] ? "is-on" : ""}" data-v="${c[0]}" style="--c:${c[2]};--c2:${c[3]}" aria-label="${c[1]}" title="${c[1]}"><i></i><span>${c[1]}</span></button>`).join("");
  }
  function decor() {
    const n = sizes().length;
    $('[data-key="decor"]').innerHTML = OPT.decor.map(d => `<label class="dec ${st.decor.includes(d[0]) ? "is-on" : ""}"><input type="checkbox" value="${d[0]}" ${st.decor.includes(d[0]) ? "checked" : ""}><span class="dec-tick"></span><span class="dec-t"><b>${esc(d[1])}</b><small>${esc(d[4])}</small></span><span class="mono dec-p">+${S.money(d[3] === "tier" ? d[2] * n : d[2])}</span></label>`).join("");
    $("#plaqueField").hidden = !(st.decor.includes("plaque") || st.decor.includes("topper"));
  }
  function flavours() {
    const sz = sizes();
    while (st.flavours.length < sz.length) st.flavours.push(st.flavours[st.flavours.length - 1] || D.FLAVOURS[0]);
    st.flavours.length = sz.length;
    const label = i => sz.length === 1 ? "Your cake" : i === 0 ? `Top tier · ${sz[0]}″` : i === sz.length - 1 ? `Bottom tier · ${sz[i]}″` : `Tier ${i + 1} · ${sz[i]}″`;
    $("#flavours").innerHTML = sz.map((z, i) => `<label class="field"><span>${label(i)}</span><select class="select" data-flv="${i}">${D.FLAVOURS.map(f => `<option ${st.flavours[i] === f ? "selected" : ""}>${esc(f)}${PREMIUM.includes(f) ? " (+8%)" : ""}</option>`).join("")}</select></label>`).join("");
  }
  function guestsHint() {
    const s = serves();
    $("#guestsOut").textContent = st.guests;
    $("#guestsHint").innerHTML = `${sizes().length > 1 ? sizes().length + " tiers" : sizes()[0] + "″ single tier"} serves <b>${s}</b> ${st.occasion === "wedding" || st.occasion === "engagement" ? "finger portions" : "generous slices"}${s < st.guests ? ` · <span style="color:var(--sobolo)">add a tier, or we'll add a kitchen cake for the extra ${st.guests - s}</span>` : ""}.`;
  }

  /* ---------- the cake ---------- */
  function drawCake(animateFrom) {
    const sz = sizes(), col = OPT.colour.find(c => c[0] === st.colour);
    const tall = st.height === "tall";
    const H = tall ? 104 : 74;
    const k = Math.min(1.6, 330 / (sz.length * H * 0.9 + 40), 400 / (TIER[sz[sz.length - 1]].w + 70));
    const darkCol = ["sobolo", "cocoa", "noir"].includes(st.colour);
    const dripC = darkCol ? "#f6efe9" : "#3b1d14";
    const has = k => st.decor.includes(k);
    const tiers = sz.map((z, i) => {
      const w = TIER[z].w * (st.shape === "hexagon" ? 1.04 : 1);
      const top = i === 0;
      let deco = "";
      if (has("drip") && top) deco += `<span class="dk-drip" style="--d:${dripC}"></span>`;
      if (has("gold")) deco += `<span class="dk-gold"></span>`;
      if (has("sugar") && (i === 0 || i === 1 || i === sz.length - 1)) deco += `<span class="dk-sugar ${i % 2 ? "r" : "l"}"></span>`;
      if (has("flowers") && (i === 0 || i === sz.length - 1 && sz.length > 2)) deco += `<span class="dk-flowers ${i ? "r" : "l"}"></span>`;
      if (has("fruit") && (top || st.finish === "seminaked" && i === Math.floor(sz.length / 2))) deco += `<span class="dk-fruit"></span>`;
      if (has("plaque") && i === sz.length - 1) deco += `<span class="dk-plaque">${esc(st.plaque || "Afehyia pa")}</span>`;
      return `<div class="tier f-${st.finish} sh-${st.shape} ${has("drip") && top ? "has-drip" : ""}" style="width:${w}px;height:${H}px;z-index:${10 - i};--d:${dripC}">${top && has("macarons") ? `<span class="dk-macs"></span>` : ""}<i class="pipe"></i>${deco}</div>`;
    }).join("");
    const topper = has("topper") ? `<div class="topper"><b>${esc((st.plaque || "C").slice(0, 6))}</b><i></i></div>` : "";
    const heart = st.shape === "heart" ? `<div class="heart-mark" aria-hidden="true">♥</div>` : "";
    const cake = $("#cake");
    cake.style.setProperty("--c", col[2]); cake.style.setProperty("--c2", col[3]); cake.style.setProperty("--k", k.toFixed(3));
    cake.innerHTML = `${topper}${heart}${tiers}<div class="board" style="width:${TIER[sz[sz.length - 1]].w + 70}px"></div>`;
    if (M && animateFrom) gsap.from($$(".tier, .topper", cake), { y: -220, opacity: 0, duration: 0.9, ease: "bounce.out", stagger: { each: 0.12, from: "end" } });
  }

  /* ---------- calendar ---------- */
  let calMonth = null;
  function minDate() { return S.addDays(S.today(), leadDays()); }
  function drawCal() {
    const min = minDate();
    if (!calMonth) calMonth = new Date(min.getFullYear(), min.getMonth(), 1);
    if (st.date && S.parse(st.date) < min) st.date = null;
    const need = sizes().length;
    const y = calMonth.getFullYear(), m = calMonth.getMonth();
    const first = new Date(y, m, 1), startDow = (first.getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
    let cells = "";
    for (let i = 0; i < startDow; i++) cells += `<span></span>`;
    for (let d = 1; d <= days; d++) {
      const dt = new Date(y, m, d), iso = S.iso(dt);
      const s = S.dayState(iso, need);
      let cls = "", dis = false, note = "";
      if (dt < min) { cls = "past"; dis = true; }
      else if (s.state === "closed") { cls = "closed"; dis = true; note = "Kitchen"; }
      else if (s.state === "full") { cls = "full"; dis = true; note = "Full"; }
      else { cls = s.state; note = s.state === "limited" ? `${s.left} left` : ""; }
      cells += `<button class="day ${cls} ${st.date === iso ? "is-on" : ""}" data-d="${iso}" ${dis ? "disabled" : ""} aria-label="${S.fmtDate(iso, { weekday: "long", day: "numeric", month: "long" })}${note ? ", " + note : ""}"><b>${d}</b><small>${note}</small></button>`;
    }
    const now = S.today(); const canPrev = y > now.getFullYear() || m > now.getMonth();
    $("#cal").innerHTML = `<div class="cal-head"><button class="close-x" data-cal="-1" ${canPrev ? "" : "disabled"} aria-label="Previous month">←</button><b class="h4">${first.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</b><button class="close-x" data-cal="1" aria-label="Next month">→</button></div>
      <div class="cal-grid">${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => `<span class="dow">${d}</span>`).join("")}${cells}</div>`;
    $("#calNote").innerHTML = `This design needs <b>${leadDays()} days' notice</b>, so the earliest date is <b>${S.fmtDate(S.iso(min), { weekday: "long", day: "numeric", month: "long" })}</b>. Dates reflect the kitchen's real bookings.`;
  }

  /* ---------- summary & price ---------- */
  function summary() {
    const pr = pricing(), sz = sizes();
    const occ = OPT.occasion.find(o => o[0] === st.occasion)[1];
    const fin = OPT.finish.find(o => o[0] === st.finish)[1], col = OPT.colour.find(o => o[0] === st.colour)[1];
    $("#summary").innerHTML = `
      <div class="sum-spec">
        <div class="kv"><span>Occasion</span><span>${esc(occ)}</span></div>
        <div class="kv"><span>Cake</span><span>${sz.length} × ${esc(OPT.shape.find(o => o[0] === st.shape)[1].toLowerCase())}${st.height === "tall" ? ", tall" : ""} · serves ${serves()}</span></div>
        <div class="kv"><span>Finish</span><span>${esc(fin)}, ${esc(col.toLowerCase())}</span></div>
        <div class="kv"><span>Sponges</span><span>${st.flavours.map(esc).join(" · ")}</span></div>
        <div class="kv"><span>Date</span><span>${st.date ? S.fmtDate(st.date, { weekday: "long", day: "numeric", month: "long" }) : `<button class="link-u" data-goto="7">Choose a date</button>`}</span></div>
        ${st.files.length ? `<div class="kv"><span>Inspiration</span><span>${st.files.length} photo${st.files.length > 1 ? "s" : ""}</span></div>` : ""}
      </div>
      <div class="sum-price">${pr.lines.map(l => `<div class="sum-row"><span>${esc(l[0])}</span><span class="price">${S.money(l[1])}</span></div>`).join("")}
        <div class="sum-row total"><span>Total</span><span class="price">${S.money(pr.total)}</span></div>
        <div class="sum-row"><span>Deposit today (50%)</span><span class="price">${S.money(pr.deposit)}</span></div>
        <p class="muted small" style="margin:8px 0 0">${st.tiers >= 3 ? `Delivery and set-up (${S.money(D.SETUP_FEE)} + area fee) are added at checkout.` : "Delivery fee depends on your area and is added at checkout."}</p></div>`;
    const r = ref(), rp = S.byId[r];
    $("#stRef").innerHTML = `<img src="${img(rp.img)}" alt=""><span><small>Closest piece we've made</small><b>${esc(rp.name)}</b></span>`;
    $("#stPrice").textContent = S.money(pr.total);
    $("#stDeposit").textContent = `Deposit today ${S.money(pr.deposit)}`;
    $("#stServes").textContent = `Serves ${serves()}`;
    $("#stLead").textContent = `${leadDays()} days' notice`;
    $("#barPrice").textContent = S.money(pr.total);
    $("#barSub").textContent = `${sz.length} tier${sz.length > 1 ? "s" : ""} · serves ${serves()}${st.date ? " · " + S.fmtDate(st.date) : ""}`;
  }

  function all(anim) { chips("occasion"); chips("tiers"); chips("shape"); chips("height"); chips("finish"); swatches(); decor(); flavours(); guestsHint(); drawCake(anim); drawCal(); summary(); persist(); }

  /* ---------- events ---------- */
  $("#steps").addEventListener("click", e => {
    const b = e.target.closest(".opt-row .chip, .sw");
    if (b && !b.disabled) {
      const key = b.parentNode.dataset.key; let v = b.dataset.v;
      if (key === "tiers") { v = +v; const sv = { 1: 30, 2: 54, 3: 100, 4: 170, 5: 250 }; st.guests = sv[v]; $("#guests").value = st.guests; if (v > 2 && st.shape === "heart") st.shape = "round"; }
      st[key] = v; all(key === "tiers");
      if (M && key !== "tiers") gsap.fromTo("#cake .tier", { scaleX: 0.97 }, { scaleX: 1, duration: 0.7, ease: "elastic.out(1, .45)", stagger: 0.04 });
      return;
    }
    const day = e.target.closest(".day"); if (day && !day.disabled) { st.date = day.dataset.d; drawCal(); summary(); persist(); return; }
    const cal = e.target.closest("[data-cal]"); if (cal) { calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + (+cal.dataset.cal), 1); drawCal(); return; }
    const go = e.target.closest("[data-goto]"); if (go) { const el = $(`[data-step="${go.dataset.goto}"]`); U.lenis ? U.lenis.scrollTo(el, { offset: -100 }) : el.scrollIntoView({ behavior: "smooth" }); }
  });
  $("#steps").addEventListener("change", e => {
    const cb = e.target.closest('[data-key="decor"] input');
    if (cb) { st.decor = $$('[data-key="decor"] input:checked').map(i => i.value); decor(); drawCake(false); drawCal(); summary(); persist(); if (M) gsap.from("#cake [class^=dk-], #cake .topper", { scale: 0.4, opacity: 0, duration: 0.6, ease: "back.out(2)", stagger: 0.03 }); return; }
    const fl = e.target.closest("[data-flv]"); if (fl) { st.flavours[+fl.dataset.flv] = fl.value.replace(" (+8%)", ""); summary(); persist(); }
  });
  $("#guests").addEventListener("input", e => {
    st.guests = +e.target.value;
    const need = st.guests <= 40 ? 1 : st.guests <= 60 ? 2 : st.guests <= 110 ? 3 : st.guests <= 180 ? 4 : 5;
    const changed = need !== st.tiers; st.tiers = need; if (need > 2 && st.shape === "heart") st.shape = "round";
    if (changed) all(true); else { guestsHint(); drawCake(false); summary(); persist(); }
  });
  $("#plaque").addEventListener("input", e => { st.plaque = e.target.value; drawCake(false); persist(); });
  $("#notes").addEventListener("input", e => { st.notes = e.target.value; persist(); });
  $("#files").addEventListener("change", e => {
    [...e.target.files].slice(0, 6).forEach(f => { const r = new FileReader(); r.onload = () => { st.files.push({ name: f.name, src: r.result }); thumbs(); summary(); }; r.readAsDataURL(f); });
  });
  function thumbs() { $("#thumbs").innerHTML = st.files.map((f, i) => `<figure><img src="${f.src}" alt="${esc(f.name)}"><button aria-label="Remove ${esc(f.name)}" data-rmf="${i}">×</button></figure>`).join(""); }
  $("#thumbs").addEventListener("click", e => { const b = e.target.closest("[data-rmf]"); if (b) { st.files.splice(+b.dataset.rmf, 1); thumbs(); summary(); } });
  ["dragover", "dragenter"].forEach(ev => $("#drop").addEventListener(ev, e => { e.preventDefault(); $("#drop").classList.add("is-over"); }));
  ["dragleave", "drop"].forEach(ev => $("#drop").addEventListener(ev, e => { e.preventDefault(); $("#drop").classList.remove("is-over"); if (ev === "drop" && e.dataTransfer.files.length) { const dt = new DataTransfer(); [...e.dataTransfer.files].forEach(f => dt.items.add(f)); $("#files").files = dt.files; $("#files").dispatchEvent(new Event("change")); } }));

  function addToBag() {
    if (!st.date) {
      const el = $('[data-step="7"]'); U.lenis ? U.lenis.scrollTo(el, { offset: -100 }) : el.scrollIntoView({ behavior: "smooth" });
      U.toast(`<div><b>Pick a date first</b><small>Choose a day the kitchen has room for this design.</small></div>`); el.classList.add("pulse"); setTimeout(() => el.classList.remove("pulse"), 1600); return;
    }
    const pr = pricing(), sz = sizes(), r = ref();
    const fin = OPT.finish.find(o => o[0] === st.finish)[1], col = OPT.colour.find(o => o[0] === st.colour)[1];
    const decs = st.decor.map(d => OPT.decor.find(x => x[0] === d)[1].toLowerCase());
    const summaryText = `${sz.length} tier${sz.length > 1 ? "s" : ""} (${sz.map(z => z + "″").join("/")}) · ${fin.toLowerCase()}, ${col.toLowerCase()}${decs.length ? " · " + decs.join(", ") : ""} · ${st.flavours[0]}${st.flavours.length > 1 ? " +" + (st.flavours.length - 1) : ""} · serves ${serves()}${st.files.length ? ` · ${st.files.length} inspiration photo${st.files.length > 1 ? "s" : ""}` : ""}`;
    U.add(r, { custom: { name: `Atelier commission · ${OPT.occasion.find(o => o[0] === st.occasion)[1]}`, summary: summaryText, price: pr.total, tiers: sz.length, leadDays: leadDays(), img: S.byId[r].img, date: st.date, notes: st.notes, setup: sz.length >= 3 } });
    try { sessionStorage.setItem("cch.prefDate", st.date); } catch (e) {}
    setTimeout(() => { location.href = "checkout.html"; }, 900);
  }
  ["#stAdd", "#sumAdd", "#barAdd"].forEach(s => $(s).addEventListener("click", addToBag));
  $("#sumAsk").addEventListener("click", () => CCHConcierge.open(`Is ${st.date ? S.fmtDate(st.date, { day: "numeric", month: "short" }).toLowerCase() : "saturday"} available for a ${sizes().length} tier cake?`));

  // preset from a menu product: atelier.html?from=wed-cantonments
  const from = new URLSearchParams(location.search).get("from");
  if (from === "wedding") Object.assign(st, { occasion: "wedding", tiers: 3, guests: 100, finish: "combed", decor: ["flowers"] });
  $("#guests").value = st.guests; $("#plaque").value = st.plaque; $("#notes").value = st.notes;
  all(true);
})();
