/* Checkout: bag, delivery or collection, date & window (capacity-aware),
   details, occasion reminder, simulated payment, confirmation. */
(function () {
  const D = CCH, S = CCHStore, U = CCHUI, B = D.BUSINESS, { $, $$, esc, img } = U;
  const M = U.MOTION && window.gsap;
  const f = id => document.getElementById(id);
  let payFull = false;

  function lines() { return S.cartLines(); }
  const needsDeposit = () => lines().some(l => l.opts.custom || (l.p.leadDays || 0) > 0 || l.p.booking);
  const counterOnly = () => !needsDeposit();
  const method = () => ($('input[name="method"]:checked') || {}).value || "delivery";
  const zone = () => D.ZONES.find(z => z.id === f("zone").value);
  function earliest() {
    let d = S.addDays(S.today(), S.cartLeadDays());
    if (counterOnly() && new Date().getHours() >= 16) d = S.addDays(d, 1);
    for (let i = 0; i < 14 && !S.capFor(S.iso(d)); i++) d = S.addDays(d, 1); // skip closed days
    return d;
  }
  function fees() {
    const del = method() === "delivery";
    const z = zone();
    const area = del && z ? z.fee : 0;
    const setup = del && (S.cartNeedsSetup() || lines().some(l => l.opts.custom && l.opts.custom.setup)) ? D.SETUP_FEE : 0;
    const sub = S.cartSubtotal();
    const total = sub + area + setup;
    const dueNow = needsDeposit() && !payFull ? Math.round(total * B.depositRate / 10) * 10 : total;
    return { sub, area, setup, total, dueNow, balance: total - dueNow };
  }

  /* ---------- bag ---------- */
  function renderLines() {
    const L = lines();
    if (!L.length) {
      $("#co").innerHTML = `<div class="wrap"><div class="empty" style="padding:120px 0"><p class="h3" style="margin-bottom:10px">Your bag is empty</p><p>Choose something from the menu, or design a cake in the Atelier.</p><div style="display:flex;gap:10px;justify-content:center"><a class="btn" href="menu.html">Browse the menu</a><a class="btn btn-ghost" href="atelier.html">Design a cake</a></div></div></div>`;
      return false;
    }
    $("#coLines").innerHTML = L.map(l => `<div class="line-item">
      <img src="${img(l.opts.custom ? l.opts.custom.img : l.p.img)}" alt="">
      <div><h4>${esc(l.opts.custom ? l.opts.custom.name : l.p.name)}</h4><div class="opts">${l.opts.custom ? esc(l.opts.custom.summary) : esc([l.opts.size && (D.SIZES.find(s => s.id === l.opts.size) || {}).name, l.opts.flavour, l.opts.message && `“${l.opts.message}”`, l.opts.date && `${S.fmtDate(l.opts.date)} · ${l.opts.time}`].filter(Boolean).join(" · ") || l.p.unit)}</div>
        <div class="qty"><button type="button" aria-label="Fewer" data-q="${esc(l.key)}" data-d="-1">−</button><span>${l.qty}</span><button type="button" aria-label="More" data-q="${esc(l.key)}" data-d="1">+</button></div></div>
      <span class="price">${S.money(l.total)}</span></div>`).join("");
    return true;
  }

  /* ---------- when & where ---------- */
  function initWhen() {
    f("zone").innerHTML = `<option value="">Choose your area</option>` + D.ZONES.map(z => `<option value="${z.id}">${esc(z.name)} · ${z.fee ? S.money(z.fee) : "free"}</option>`).join("");
    const e = earliest(); f("date").min = S.iso(e);
    let pref = null; try { pref = sessionStorage.getItem("cch.prefDate"); } catch (x) {}
    const custom = lines().find(l => l.opts.custom && l.opts.custom.date); if (custom) pref = custom.opts.custom.date;
    const booking = lines().find(l => l.opts.date); if (!pref && booking) pref = booking.opts.date;
    f("date").value = pref && S.parse(pref) >= e ? pref : S.iso(e);
    renderWhen();
  }
  function renderWhen() {
    const del = method() === "delivery";
    f("delFields").hidden = !del;
    f("dateLbl").textContent = del ? "Delivery date" : "Collection date";
    f("slotLbl").textContent = del ? "Delivery window" : "Collection time";
    const dv = f("date").value;
    const units = S.cartUnits();
    let msg = "", ok = true;
    if (!dv) { msg = "Choose a date"; ok = false; }
    else {
      const dt = S.parse(dv);
      if (dt < earliest()) { msg = `The earliest we can make this is ${S.fmtDate(S.iso(earliest()), { weekday: "long", day: "numeric", month: "short" })}.`; ok = false; }
      else {
        const s = S.dayState(dv, Math.max(1, units));
        if (s.state === "closed") { msg = "The kitchen is closed that day. Please choose another date."; ok = false; }
        else if (s.state === "full" && units > 0) { msg = s.left ? `Only ${s.left} cake slot${s.left === 1 ? "" : "s"} left on ${S.fmtDate(dv, { weekday: "long" })}, and this order needs ${units}. Choose another day, or ask Esi about splitting it.` : `${S.fmtDate(dv, { weekday: "long" })} is fully booked for cakes. Try another day.`; ok = false; }
        else msg = units ? `<b>${s.left} cake slot${s.left === 1 ? "" : "s"} left</b> that day${s.state === "limited" ? ", filling up" : ""}. We'll hold one for you.` : "Counter items, baked that morning.";
      }
    }
    f("capMsg").innerHTML = msg; f("capMsg").className = "cap-msg " + (ok ? "ok" : "bad");
    // slots
    const now = new Date(), isToday = dv === S.iso(S.today());
    const cur = (($(".slots .is-on") || {}).dataset || {}).v;
    const day = dv ? S.parse(dv).getDay() : 2;
    const close = day === 0 ? 17 : day === 6 ? 20 : 19, open = day === 0 ? 10 : 8;
    f("slots").innerHTML = S.SLOTS.map(s => { const h = +s.slice(0, 2), end = h + 2; const dis = h < open || end > close || isToday && h <= now.getHours() + 1; return `<button type="button" class="chip ${cur === s && !dis ? "is-on" : ""}" data-v="${s}" ${dis ? "disabled" : ""}>${s}</button>`; }).join("");
    if (!$(".slots .is-on")) { const first = $(".slots .chip:not([disabled])"); first && first.classList.add("is-on"); }
    renderPay(); renderSum();
    return ok;
  }

  /* ---------- payment ---------- */
  function renderPay() {
    const fe = fees(), dep = needsDeposit();
    const arrivalOK = counterOnly() && method() === "collection";
    f("arrivalChoice").classList.toggle("is-disabled", !arrivalOK);
    f("arrivalChoice").querySelector("input").disabled = !arrivalOK;
    if (!arrivalOK && $('input[name="pay"]:checked').value === "arrival") $('input[name="pay"][value="momo"]').checked = true;
    f("payAmt").innerHTML = dep ? `<div class="opt-row"><button type="button" class="chip ${payFull ? "" : "is-on"}" data-full="0">Deposit 50% · ${S.money(Math.round(fe.total * B.depositRate / 10) * 10)}</button><button type="button" class="chip ${payFull ? "is-on" : ""}" data-full="1">Pay in full · ${S.money(fe.total)}</button></div><p class="muted small">${payFull ? "Nothing more to pay." : `Balance of ${S.money(fe.balance)} is due 72 hours before ${method() === "delivery" ? "delivery" : "collection"}.`}</p>` : `<p class="muted small">Counter orders are paid in full.</p>`;
    const pm = $('input[name="pay"]:checked').value;
    f("momoFields").hidden = pm !== "momo";
    f("payBtn").textContent = pm === "arrival" ? "Place order, pay on collection" : `Pay ${S.money(fe.dueNow)} ${pm === "momo" ? "with Mobile Money" : "by card"}`;
  }

  /* ---------- summary ---------- */
  function renderSum() {
    const fe = fees(), L = lines();
    const dv = f("date").value, slot = (($(".slots .is-on") || {}).dataset || {}).v;
    $("#coSum").innerHTML = `<h2 class="h4">Order summary</h2>
      <ul class="sum-lines">${L.map(l => `<li><img src="${img(l.opts.custom ? l.opts.custom.img : l.p.img)}" alt=""><span>${esc(l.opts.custom ? l.opts.custom.name : l.p.name)}${l.qty > 1 ? ` <em>× ${l.qty}</em>` : ""}</span><span class="price">${S.money(l.total)}</span></li>`).join("")}</ul>
      <div class="sum-row"><span>Subtotal</span><span class="price">${S.money(fe.sub)}</span></div>
      ${method() === "delivery" ? `<div class="sum-row"><span>Delivery${zone() ? " · " + esc(zone().name) : ""}</span><span class="price">${zone() ? (fe.area ? S.money(fe.area) : "Free") : "—"}</span></div>` : `<div class="sum-row"><span>Collection</span><span class="price">Free</span></div>`}
      ${fe.setup ? `<div class="sum-row"><span>Set-up at the venue</span><span class="price">${S.money(fe.setup)}</span></div>` : ""}
      <div class="sum-row total"><span>Total</span><span class="price">${S.money(fe.total)}</span></div>
      <div class="sum-row due"><span>Due now</span><span class="price">${S.money(fe.dueNow)}</span></div>
      <div class="sum-when"><span class="label">${method() === "delivery" ? "Delivery" : "Collection"}</span><b>${dv ? S.fmtDate(dv, { weekday: "long", day: "numeric", month: "long" }) : "Choose a date"}</b><span class="mono">${slot || ""}</span></div>
      <p class="muted small" style="margin:12px 0 0">Questions? <a href="https://wa.me/${B.whatsapp}" target="_blank" rel="noopener"><u>WhatsApp Esi</u></a> or ask Ama, bottom right.</p>`;
  }

  /* ---------- validation ---------- */
  function bad(el, on) { el.classList.toggle("is-bad", on); return on; }
  function validate() {
    let first = null; const mark = (el, cond) => { if (bad(el, cond) && !first) first = el; };
    const del = method() === "delivery";
    if (del) { mark(f("zone"), !f("zone").value); mark(f("addr"), f("addr").value.trim().length < 4); }
    const whenOK = renderWhen(); if (!whenOK && !first) first = f("date"); bad(f("date"), !whenOK);
    if (!$(".slots .is-on")) { f("whenErr").hidden = false; f("whenErr").textContent = "No windows left that day. Choose another date."; if (!first) first = f("date"); } else f("whenErr").hidden = true;
    mark(f("name"), f("name").value.trim().length < 2);
    mark(f("phone"), f("phone").value.replace(/\D/g, "").length < 9);
    if (f("email").value && !/^\S+@\S+\.\S+$/.test(f("email").value)) mark(f("email"), true); else bad(f("email"), false);
    if (f("isGift").checked) mark(f("rName"), f("rName").value.trim().length < 2);
    const pm = $('input[name="pay"]:checked').value;
    if (pm === "momo") { const v = (f("momo").value || f("phone").value).replace(/\D/g, ""); mark(f("momo"), v.length < 9); }
    const termsBad = !f("terms").checked; f("terms").closest(".toggle").classList.toggle("is-bad", termsBad); if (termsBad && !first) first = f("terms");
    f("formErr").hidden = !first; f("formErr").textContent = first ? "A few details need attention. They're highlighted above." : "";
    if (first) { const y = first.getBoundingClientRect().top + scrollY - 140; U.lenis ? U.lenis.scrollTo(y) : window.scrollTo({ top: y, behavior: "smooth" }); setTimeout(() => first.focus({ preventScroll: true }), 500); }
    return !first;
  }

  /* ---------- submit ---------- */
  f("coForm").addEventListener("submit", e => {
    e.preventDefault();
    if (!validate()) return;
    const pm = $('input[name="pay"]:checked').value, fe = fees();
    const go = () => finish(pm, fe);
    if (pm === "arrival") return go();
    const ov = f("paying"); ov.hidden = false;
    f("payingT").textContent = pm === "momo" ? `Sending a prompt to ${f("momo").value || f("phone").value}…` : "Opening our payment partner…";
    f("payingS").textContent = pm === "momo" ? `Approve ${S.money(fe.dueNow)} with your ${f("network").value} PIN.` : "In the live site this is a hosted, PCI-compliant card page. Nothing is charged in this demo.";
    setTimeout(() => { f("payingT").textContent = "Payment approved"; f("payingS").textContent = `${S.money(fe.dueNow)} received. Confirming with the kitchen…`; ov.classList.add("ok"); }, U.POSE ? 10 : 2300);
    setTimeout(() => { ov.hidden = true; ov.classList.remove("ok"); go(); }, U.POSE ? 20 : 3600);
  });

  function finish(pm, fe) {
    const dv = f("date").value, slot = $(".slots .is-on").dataset.v, del = method() === "delivery";
    const L = lines();
    const order = {
      channel: "web", customer: { name: f("name").value.trim(), phone: f("phone").value.trim(), email: f("email").value.trim() },
      recipient: f("isGift").checked ? { name: f("rName").value.trim(), phone: f("rPhone").value.trim(), card: f("card").value.trim() } : null,
      method: del ? "delivery" : "collection", zone: del ? f("zone").value : null, address: del ? [f("addr").value.trim(), f("gps").value.trim(), f("landmark").value.trim()].filter(Boolean).join(" · ") : "",
      date: dv, slot, fee: fe.area + fe.setup,
      items: L.map(l => ({ id: l.id, qty: l.qty, opts: l.opts })), subtotal: fe.sub, total: fe.total,
      payment: { method: pm, status: pm === "arrival" ? "pending" : fe.balance > 0 ? "deposit" : "paid", paid: pm === "arrival" ? 0 : fe.dueNow },
      notes: [f("notes").value.trim(), ...L.filter(l => l.opts.custom && l.opts.custom.notes).map(l => l.opts.custom.notes)].filter(Boolean).join(" · "),
      occasion: f("remind").checked ? { type: f("occType").value, who: f("occWho").value.trim() || "Self", md: dv.slice(5), last: L[0].id } : null
    };
    const o = S.placeOrder(order);
    S.clearCart();
    try { sessionStorage.removeItem("cch.atelier"); sessionStorage.removeItem("cch.prefDate"); } catch (e) {}
    showDone(o, fe);
  }

  function showDone(o, fe) {
    const first = o.customer.name.split(" ")[0];
    const when = `${S.fmtDate(o.date, { weekday: "long", day: "numeric", month: "long" })}, ${o.slot}`;
    const z = o.zone ? D.ZONES.find(x => x.id === o.zone) : null;
    const items = o.items.map(it => { const p = S.byId[it.id]; return `${it.qty} × ${it.opts.custom ? it.opts.custom.name : p.name}`; });
    const wa = `Hello Cindy's! I've just placed order ${o.ref}.\n\n${items.join("\n")}\n\n${o.method === "delivery" ? `Delivery to ${z ? z.name : ""}` : "Collection at the house"}: ${when}\nTotal ${S.money(o.total)} · paid ${S.money(o.payment.paid)} (${o.payment.method === "momo" ? "MoMo" : o.payment.method === "card" ? "card" : "pay on collection"})\n\nTrack: ${location.origin}${location.pathname.replace("checkout.html", "")}track.html?ref=${o.ref}`;
    const [y, m, d] = o.date.split("-"); const h = o.slot.slice(0, 2), h2 = o.slot.slice(8, 10);
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Cindys Cake House//EN\nBEGIN:VEVENT\nUID:${o.ref}@cindyscakehouse\nDTSTART:${y}${m}${d}T${h}0000\nDTEND:${y}${m}${d}T${h2}0000\nSUMMARY:${o.method === "delivery" ? "Cake delivery" : "Collect cake"} · ${o.ref}\nLOCATION:${o.method === "delivery" ? (o.address || "").replace(/[,;]/g, " ") : B.address.replace(/,/g, " ")}\nEND:VEVENT\nEND:VCALENDAR`;
    $("#co").hidden = true; $(".co-hero").hidden = true;
    const done = f("done"); done.hidden = false;
    done.innerHTML = `<div class="wrap done-grid on-dark">
      <div>
        <p class="eyebrow">Order confirmed</p>
        <h1 class="h1 done-t" data-split>Thank you,|${esc(first)}.</h1>
        <p class="lede" style="margin-top:20px">${o.method === "delivery" ? "It's in the kitchen diary." : "We'll have it boxed and waiting."} Esi will WhatsApp you within the hour${o.items.some(it => it.opts.custom) ? " with a sketch of your design" : ""}. Your reference is below.</p>
        <div class="ref-card glass"><span class="label">Reference</span><b class="mono" id="refTxt">${o.ref}</b><button class="btn btn-ghost btn-sm on-dark" id="copyRef">Copy</button></div>
        <div class="done-actions">
          <a class="btn btn-pist" href="https://wa.me/${B.whatsapp}?text=${encodeURIComponent(wa)}" target="_blank" rel="noopener">${U.I.wa} Send to Cindy's on WhatsApp</a>
          <a class="btn btn-light" href="track.html?ref=${o.ref}">Track this order</a>
          <a class="btn btn-ghost on-dark" href="data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}" download="${o.ref}.ics">Add to calendar</a>
        </div>
      </div>
      <div class="done-card glass">
        <div class="kv"><span>${o.method === "delivery" ? "Delivery" : "Collection"}</span><span>${esc(when)}</span></div>
        ${o.method === "delivery" ? `<div class="kv"><span>To</span><span>${esc(o.recipient ? o.recipient.name + ", " : "")}${esc(o.address)}</span></div>` : `<div class="kv"><span>Where</span><span>${esc(B.address)}</span></div>`}
        ${o.items.map(it => { const p = S.byId[it.id]; return `<div class="done-item"><img src="${img(it.opts.custom ? it.opts.custom.img : p.img)}" alt=""><span>${it.qty} × ${esc(it.opts.custom ? it.opts.custom.name : p.name)}</span></div>`; }).join("")}
        <div class="kv"><span>Total</span><span class="price">${S.money(o.total)}</span></div>
        <div class="kv"><span>Paid</span><span class="price">${S.money(o.payment.paid)}${o.payment.status === "deposit" ? ` · balance ${S.money(o.total - o.payment.paid)} due 72h before` : ""}</span></div>
        ${o.occasion ? `<p class="muted small" style="margin:12px 0 0">We'll remind you on WhatsApp three weeks before ${S.fmtDate(o.date, { day: "numeric", month: "long" })} next year.</p>` : ""}
      </div></div>`;
    U.splitLines(done); U.reveals(done);
    f("copyRef").addEventListener("click", () => { try { navigator.clipboard.writeText(o.ref); } catch (e) {} f("copyRef").textContent = "Copied"; });
    window.scrollTo(0, 0); if (U.lenis) U.lenis.scrollTo(0, { immediate: true });
    if (M) gsap.from(".ref-card, .done-actions > *, .done-card", { y: 26, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.08, delay: 0.3 });
  }

  /* ---------- events ---------- */
  document.addEventListener("click", e => {
    const s = e.target.closest(".slots .chip"); if (s && !s.disabled) { $$(".slots .chip").forEach(c => c.classList.toggle("is-on", c === s)); f("whenErr").hidden = true; renderSum(); }
    const pf = e.target.closest("[data-full]"); if (pf) { payFull = pf.dataset.full === "1"; renderPay(); renderSum(); }
  });
  f("coForm").addEventListener("change", e => {
    if (e.target.name === "method" || e.target.id === "zone" || e.target.id === "date") { renderWhen(); if (e.target.id === "zone") bad(f("zone"), false); }
    if (e.target.name === "pay") renderPay();
    if (e.target.id === "isGift") f("giftFields").hidden = !e.target.checked;
    if (e.target.id === "remind") f("remindFields").hidden = !e.target.checked;
    if (e.target.id === "terms") e.target.closest(".toggle").classList.remove("is-bad");
  });
  f("coForm").addEventListener("input", e => { if (e.target.classList.contains("is-bad")) bad(e.target, false); });
  window.addEventListener("cch:cart", () => { if (!renderLines()) return; initWhen(); });
  // steps indicator follows the section in view
  const secs = $$(".co-sec");
  const onScroll = () => { let k = 0; secs.forEach((s, i) => { if (s.getBoundingClientRect().top < innerHeight * 0.45) k = i; }); $$("#coSteps li").forEach((li, i) => { li.classList.toggle("is-on", i === k); li.classList.toggle("is-done", i < k); }); };
  window.addEventListener("scroll", onScroll, { passive: true });

  if (renderLines()) initWhen();
})();
