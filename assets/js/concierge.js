/* ==========================================================================
   "Ama", the cake concierge. A rule-based assistant that answers from the
   real catalogue, delivery zones, kitchen capacity and order book in store.js.
   In production this is where an LLM call (with the same data as tools)
   would sit; the demo runs fully offline so it never fails on camera.
   ========================================================================== */
(function () {
  const D = CCH, S = CCHStore, U = CCHUI, { $, $$, esc, img } = U, B = D.BUSINESS;
  const QUICK = ["Birthday cake for 20", "Wedding for 150 guests", "Is Saturday available?", "Delivery to East Legon", "Track my order", "Gift for my boss"];

  document.body.insertAdjacentHTML("beforeend", `
    <button class="cc-fab glass" id="ccFab" aria-controls="ccPanel" aria-expanded="false"><span class="cc-ava">A</span><span class="t">Ask Ama, our concierge</span></button>
    <section class="cc-panel" id="ccPanel" role="dialog" aria-label="Chat with Ama, the cake concierge">
      <div class="cc-head"><span class="cc-ava">A</span><div><b>Ama</b><small>Cake concierge · replies instantly</small></div><button class="close-x" id="ccClose" aria-label="Close chat">${U.I.x}</button></div>
      <div class="cc-log" id="ccLog" aria-live="polite"></div>
      <div class="cc-quick" id="ccQuick">${QUICK.map(q => `<button>${esc(q)}</button>`).join("")}</div>
      <form class="cc-form" id="ccForm"><label class="sr-only" for="ccIn">Message</label><input id="ccIn" autocomplete="off" placeholder="Ask about cakes, dates, delivery…"><button aria-label="Send">${U.I.send}</button></form>
    </section>`);
  const fab = $("#ccFab"), panel = $("#ccPanel"), log = $("#ccLog"), input = $("#ccIn");
  let greeted = false;

  function openChat(prefill) {
    panel.classList.add("is-open"); fab.setAttribute("aria-expanded", "true");
    if (!greeted) { greeted = true; bot(greeting()); }
    if (prefill) { setTimeout(() => send(prefill), 350); } else setTimeout(() => input.focus({ preventScroll: true }), 200);
  }
  function closeChat() { panel.classList.remove("is-open"); fab.setAttribute("aria-expanded", "false"); }
  fab.addEventListener("click", () => panel.classList.contains("is-open") ? closeChat() : openChat());
  $("#ccClose").addEventListener("click", closeChat);
  $("#ccQuick").addEventListener("click", e => { const b = e.target.closest("button"); b && send(b.textContent); });
  $("#ccForm").addEventListener("submit", e => { e.preventDefault(); const v = input.value.trim(); if (v) { input.value = ""; send(v); } });
  log.addEventListener("click", e => {
    const a = e.target.closest("[data-cc-add]"); if (a) { U.quickView(a.dataset.ccAdd); return; }
  });
  ["wheel", "touchmove"].forEach(ev => log.addEventListener(ev, e => e.stopPropagation(), { passive: true }));
  log.setAttribute("data-lenis-prevent", "");

  function add(cls, html) { const m = document.createElement("div"); m.className = "msg " + cls; m.innerHTML = html; log.appendChild(m); log.scrollTop = log.scrollHeight; return m; }
  function bot(html) {
    const t = add("bot typing", "<i></i><i></i><i></i>");
    setTimeout(() => { t.className = "msg bot"; t.innerHTML = html; log.scrollTop = log.scrollHeight; }, U.POSE ? 0 : 520 + Math.min(900, html.length * 2));
  }
  function send(text) { add("me", esc(text)); bot(answer(text)); }
  const mini = p => `<div class="mini"><img src="${img(p.img)}" alt=""><div><b>${esc(p.name)}</b><small>${p.from ? "from " : ""}${S.money(p.price)} · ${esc(p.unit || "")}</small></div><button data-cc-add="${p.id}" aria-label="View ${esc(p.name)}">+</button></div>`;
  const P = t => `<p>${t}</p>`;

  function greeting() {
    const h = new Date().getHours();
    const g = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
    return P(`${g}! I'm Ama. I can suggest a cake for your occasion, check if a date is free in the kitchen, quote delivery to your area or find an order.`) + P("What are we celebrating?");
  }

  /* ---------- parsing helpers ---------- */
  const OCC = [
    ["wedding", /wedding|marry|marriage|bride|groom|reception/],
    ["engagement", /engag|knocking|kokooko|traditional|introduction/],
    ["baby", /baby|naming|outdooring|gender|reveal|christening|shower/],
    ["kids", /kid|child|son|daughter|boy|girl|princess|toddler|first birthday|1st/],
    ["romance", /anniversar|valentine|wife|husband|girlfriend|boyfriend|romantic|love|propos/],
    ["corporate", /corporate|office|staff|client|boss|team|company|colleague|launch|conference/],
    ["birthday", /birthday|bday|b-day|turning|\d+(st|nd|rd|th)\b/]
  ];
  const num = (t, re) => { const m = t.match(re); return m ? parseInt(m[1].replace(/,/g, ""), 10) : null; };
  function guests(t) { return num(t, /(\d{1,4})\s*(?:people|guests|persons|pax|heads|of us)/) || num(t, /for\s+(\d{1,4})(?!\s*(?:cedis|ghs|gh₵|th|st|nd|rd|inch))/); }
  function budget(t) { return num(t, /(?:ghs|gh₵|₵|cedis?)\s*([\d,]{2,7})/) || num(t, /([\d,]{3,7})\s*(?:ghs|cedis|gh₵)/) || num(t, /(?:under|below|budget(?: of| is)?|max(?:imum)?|less than)\s*(?:ghs|gh₵)?\s*([\d,]{3,7})/); }
  function servesOf(p) { const m = (p.unit || "").match(/serves\s+(\d+)(?:–(\d+))?/); return m ? +(m[2] || m[1]) : p.cat === "couture" ? 12 : 0; }
  function findZone(t) {
    const full = D.ZONES.find(z => t.includes(z.name.toLowerCase()) || t.includes(z.id.replace("-", " ")));
    if (full) return full;
    // fall back to a distinctive first word ("trasacco", "spintex"), never a shared one like "east" or "airport"
    return D.ZONES.find(z => { const w = z.name.toLowerCase().split(" ")[0]; return w.length > 3 && D.ZONES.filter(x => x.name.toLowerCase().startsWith(w)).length === 1 && t.includes(w); });
  }
  function findProducts(t) {
    const words = t.toLowerCase().replace(/[^a-zé\s]/g, " ").split(/\s+/).filter(w => w.length > 3 && !/cake|cakes|much|price|cost|have|your|what|with|that|this|from|want|need|does|about/.test(w));
    if (!words.length) return [];
    return D.PRODUCTS.map(p => { const n = (p.name + " " + p.line).toLowerCase(); const name = p.name.toLowerCase(); let s = 0; words.forEach(w => { if (name.includes(w)) s += 3; else if (n.includes(w)) s += 1; }); return [p, s]; }).filter(x => x[1] >= 3).sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => x[0]);
  }
  function parseDate(t) {
    const d0 = S.today();
    if (/today/.test(t)) return d0;
    if (/tomorrow/.test(t)) return S.addDays(d0, 1);
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    for (let i = 0; i < 7; i++) if (t.includes(days[i]) || t.includes(days[i].slice(0, 3) + " ")) { let n = (i - d0.getDay() + 7) % 7 || 7; if (/next/.test(t)) n += 7; return S.addDays(d0, n); }
    if (/weekend/.test(t)) return S.addDays(d0, (6 - d0.getDay() + 7) % 7 || 7);
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    let m = t.match(/(\d{1,2})(?:st|nd|rd|th)?\s*(?:of\s*)?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/) || null;
    let day, mon;
    if (m) { day = +m[1]; mon = months.indexOf(m[2]); }
    else { m = t.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(\d{1,2})/); if (m) { day = +m[2]; mon = months.indexOf(m[1]); } }
    if (!m) { m = t.match(/\b(\d{1,2})\/(\d{1,2})\b/); if (m) { day = +m[1]; mon = +m[2] - 1; } }
    if (m && day && mon >= 0) { let d = new Date(d0.getFullYear(), mon, day); if (d < d0) d = new Date(d0.getFullYear() + 1, mon, day); return d; }
    return null;
  }
  function dayLine(d, need) {
    const iso = S.iso(d), st = S.dayState(iso, need || 1), name = S.fmtDate(iso, { weekday: "long", day: "numeric", month: "long" });
    const ahead = Math.round((d - S.today()) / 864e5);
    if (st.state === "closed") return `${name} is closed in the kitchen diary, so we can't deliver that day.`;
    if (st.state === "full") return `${name} is fully booked for couture cakes, I'm sorry. Pâtisserie from the counter is still available that day. The next open day is ${nextOpen(d, need)}.`;
    return `${name}: <b>${st.left} cake slot${st.left === 1 ? "" : "s"} left</b>${st.state === "limited" ? ", it's filling up" : ""}. ${ahead < 2 ? "That's short notice, so pick a cake marked 'order a day ahead' or a counter treat." : ahead < 5 ? "Most couture cakes are possible; the sugar-flower ones need five days." : "Everything on the menu is possible, including sugar-flower designs."}`;
  }
  function nextOpen(from, need) { for (let i = 1; i < 30; i++) { const d = S.addDays(from, i); const st = S.dayState(S.iso(d), need || 1); if (st.state === "open" || st.state === "limited") return S.fmtDate(S.iso(d), { weekday: "long", day: "numeric", month: "short" }); } return "next month"; }

  /* ---------- the brain ---------- */
  function answer(raw) {
    const t = raw.toLowerCase();
    // order tracking
    const ref = raw.toUpperCase().match(/CCH-?[A-Z0-9]{5}/);
    if (ref) {
      const o = S.findOrder(ref[0].replace(/^CCH-?/, "CCH-"));
      if (!o) return P(`I couldn't find ${esc(ref[0])}. Check the reference in your confirmation message, or <a href="https://wa.me/${B.whatsapp}" target="_blank" rel="noopener"><u>WhatsApp Esi</u></a>.`);
      return P(`Order <b>${o.ref}</b> for ${esc(o.customer.name.split(" ")[0])}: <b>${S.STATUS_LABEL[o.status]}</b>.`) + P(`${o.method === "delivery" ? "Delivery" : "Collection"} on ${S.fmtDate(o.date, { weekday: "long", day: "numeric", month: "long" })}, ${esc(o.slot)}.`) + P(`<a href="${U.root}track.html?ref=${o.ref}"><u>Open live tracking →</u></a>`);
    }
    if (/track|where is my|status of|my order/.test(t)) return P("Of course. Paste your order reference (it looks like CCH-7K2QP) and I'll check the kitchen board.");
    if (/^(hi|hello|hey|good (morning|afternoon|evening)|akwaaba|ete sen)/.test(t.trim())) return P("Hello! Tell me the occasion, roughly how many guests and the date, and I'll suggest three cakes that fit.");
    if (/thank|medaase|appreciate/.test(t)) return P("My pleasure. Anything else, I'm right here. Esi on WhatsApp can help with anything unusual.");
    if (/human|person|someone|whatsapp|call|speak|talk to/.test(t)) return P(`Esi from our team is on WhatsApp from 8am to 8pm: <a href="https://wa.me/${B.whatsapp}?text=${encodeURIComponent("Hello Cindy's, I have a question about an order.")}" target="_blank" rel="noopener"><u>${B.whatsappDisplay}</u></a>, or call ${B.phone}.`);
    if (/hour|open|close|when are you|sunday|monday/.test(t) && !parseDate(t)) return P(B.hours.map(h => `<b>${h.d}</b>: ${h.h}`).join("<br>"));
    if (/where|address|location|located|direction|visit|find you/.test(t)) return P(`${B.address} (${B.gps}). ${B.landmark}.`) + P(`<a href="${U.root}about.html#visit"><u>Directions and parking →</u></a>`);
    if (/allerg|egg ?less|eggless|vegan|gluten|nut[- ]free|diabet|sugar[- ]free/.test(t)) return P(D.FAQ[4].a) + P("Tell Esi when you order and she'll note it on the kitchen ticket.");
    if (/deposit|pay|momo|mobile money|card|instal|balance/.test(t)) return P(D.FAQ[1].a) + P(`We take ${B.momo}, Visa and Mastercard.`);
    if (/flavou?r|sponge|filling|taste/.test(t) && !/tasting/.test(t)) return P("Our sponges: " + D.FLAVOURS.slice(0, 8).map(esc).join(", ") + " and more.") + P("Sobolo hibiscus & raspberry and the groundnut praline are the ones people come back for.");
    if (/tasting/.test(t)) return P("Private tastings are an hour at the house with six sponges and four fillings. GHS 650 for two, fully credited to your wedding order.") + mini(S.byId["evt-tasting"]);
    if (/how (far|long|early)|notice|lead time|in advance|last minute|urgent/.test(t)) return P(D.FAQ[0].a);

    // availability
    const d = parseDate(t);
    if (d && /avail|free|book|slot|open|can you|possible|deliver|make|order/.test(t) || d && t.split(" ").length < 4) {
      return P(dayLine(d)) + P(`Pick that date at checkout and it's held for you once the deposit is in.`);
    }

    // delivery
    const z = findZone(t);
    if (z || /deliver|delivery|ship|send to|courier|dispatch/.test(t)) {
      if (z) return P(`${esc(z.name)}: ${z.fee ? `<b>${S.money(z.fee)}</b>` : "<b>free</b>"} delivery, about ${esc(z.eta)} in our air-conditioned van. You choose a two-hour window at checkout.`) + (/wedding|tier|table/.test(t) ? P(`Tiered cakes and tables also include set-up at the venue (${S.money(D.SETUP_FEE)}).`) : "");
      return P("We deliver to " + D.ZONES.map(z => `${esc(z.name)} (${z.fee ? S.money(z.fee) : "free"})`).join(", ") + ".") + P("Tell me your area and I'll confirm the fee.");
    }

    // wedding quote
    const g = guests(t), bud = budget(t);
    const occ = (OCC.find(([, re]) => re.test(t)) || [])[0];
    if (occ === "wedding") {
      const n = g || 120; const tiers = n <= 70 ? 2 : n <= 110 ? 3 : n <= 160 ? 4 : 5;
      const list = D.PRODUCTS.filter(p => p.cat === "wedding" && p.tiers === tiers && (!bud || p.price <= bud)).sort((a, b) => a.price - b.price);
      const pool = list.length ? list : D.PRODUCTS.filter(p => p.cat === "wedding" && p.tiers >= tiers - 1 && !p.booking).sort((a, b) => a.price - b.price);
      const lo = Math.min(...pool.map(p => p.price)), hi = Math.max(...pool.map(p => p.price));
      return P(`For ${n} guests you'll want <b>${tiers} tiers</b>. Our ${tiers}-tier designs run ${S.money(lo)}${hi > lo ? ` to ${S.money(hi)}` : ""}, plus set-up (${S.money(D.SETUP_FEE)}).`) + pool.slice(0, 3).map(mini).join("") + P(`We take three weddings a weekend, so book a tasting early. <a href="${U.root}weddings.html"><u>See all wedding cakes →</u></a>`);
    }

    // recommendations by occasion / guests / budget
    if (occ || g || bud || /recommend|suggest|ideas?|what should|which cake|gift|surprise/.test(t)) {
      const o = occ || (/gift|surprise/.test(t) ? "romance" : "birthday");
      let pool = D.PRODUCTS.filter(p => p.occ.includes(o) && p.cat !== "viennoiserie" && !p.booking);
      if (/gift|boss|client|colleague/.test(t)) pool = D.PRODUCTS.filter(p => p.cat === "gifting" || p.cat === "confection");
      if (g) pool = pool.filter(p => { const s = servesOf(p); return p.sizes ? true : s === 0 || s >= g * 0.8; });
      if (bud) pool = pool.filter(p => p.price <= bud);
      // score: badges first, close to guest count
      pool.sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0) || a.price - b.price);
      const pickN = pool.slice(0, 3);
      if (!pickN.length) return P(`Nothing on the menu fits that exactly${bud ? ` under ${S.money(bud)}` : ""}. The Cake Atelier lets you build one to your budget, and you'll see the price as you go.`) + P(`<a href="${U.root}atelier.html"><u>Open the Atelier →</u></a>`);
      let sizeNote = "";
      if (g && pickN.some(p => p.sizes)) { const s = D.SIZES.find(s => +s.serves.split("–")[1] >= g) || D.SIZES[2]; sizeNote = P(`For ${g} guests choose the <b>${s.name}</b> size (serves ${s.serves})${g > 40 ? ", or two tiers in the Atelier" : ""}.`); }
      const label = { birthday: "a birthday", kids: "a child's party", baby: "a baby or naming celebration", romance: "something romantic", corporate: "the office", engagement: "an engagement" }[o] || "you";
      return P(`For ${label}${g ? ` of about ${g}` : ""}${bud ? `, under ${S.money(bud)}` : ""}, I'd look at:`) + pickN.map(mini).join("") + sizeNote + P(pickN.some(p => p.sizes || p.flavours) ? "Tap + to choose a size and sponge." : "Tap + for details, or to add it to your bag.");
    }

    // product price lookup
    const found = findProducts(t);
    if (found.length) return P(found.length === 1 ? "Here it is:" : "These match:") + found.map(mini).join("") + P(/today|now|available/.test(t) && found[0].cat === "patisserie" ? "Counter items are baked every morning; on a busy Saturday they can sell out by 2pm." : "");
    if (/price|cost|how much|expensive|cheap/.test(t)) return P("Counter pâtisserie is GHS 55 to 130. Couture cakes start at GHS 280 for a bento and GHS 850 for a 6 inch. Wedding tiers start at GHS 6,800.") + P("Name a cake and I'll give you the exact price.");
    return P("I'm not sure I followed. I'm best with occasions, guest numbers, dates, delivery areas and order references.") + P("For example: <i>“Birthday cake for 25 under 2,000 cedis”</i> or <i>“Is 14 December free?”</i>");
  }

  window.CCHConcierge = { open: openChat, answer };
  if (new URLSearchParams(location.search).has("chat")) setTimeout(() => openChat(), 1200);
})();
