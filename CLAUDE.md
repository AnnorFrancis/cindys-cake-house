# CLAUDE.md: handoff for Cindy's Cake House

## What this is
A pitch sample for luxury bakeries and cake studios in Accra (target: Cantonments, East Legon, Airport Hills). A static site plus an owner dashboard that behave like a real business system. It is used in cold outreach as a screen recording. Plain HTML, CSS and JS with no build step, ready for GitHub Pages and working from `file://`.

## The business (fictional)
Cindy's Cake House, 12 Nii Sai Road, Cantonments. Couture celebration cakes, wedding and knocking-ceremony cakes, pâtisserie and viennoiserie, macarons and Ghana-cocoa chocolates, dessert tables, gifting and corporate. Luxury tier, priced in GHS. Opening hours: Monday 9–15 (short counter); Tuesday to Friday 7:30–19; Saturday 8–20; Sunday 10–17. Every placeholder is listed in README.md.

## Design system
- **Palette** (`:root` in `assets/css/style.css`): cocoa `#24130f` (Ghana chocolate, dark sections), sobolo `#6e1a35` (hibiscus wine, accents and CTAs on light), meringue `#f7edef` (light base, pinkish, deliberately not cream), blush `#ebc9cf` / `#f3dde1`, pistachio `#b3c697` (CTAs on dark, eyebrows on dark).
- **Type**: Gilda Display (display, sizes only, never italic accents), Albert Sans (body and uppercase labels at 12px+, weight 600), IBM Plex Mono (prices, references, times: the "order ticket" voice).
- **Signature motif, "the slice"**: a diagonal knife cut. It appears in the intro (a pistachio line cuts the cocoa veil, then the halves part), the page-transition curtain (a diagonal sobolo wipe), the hero slideshow wipe inside an arched "cake dome", and the wedge glyph before every eyebrow.
- **Sections alternate backgrounds**: meringue, cocoa+grain, blush, sobolo+grain, photo. Never put two plain sections of the same colour next to each other.
- **Glass**: the nav, drawers, chat, hero card and overlays use backdrop blur. Product cards deliberately use tinted pills, not blur, for scroll performance on phones (100+ blurred layers stutter).
- **Motion**: GSAP + ScrollTrigger + Lenis (local copies in `assets/vendor`). Reveals use `[data-reveal]` / `[data-reveal="clip"]` and `data-split` headings (lines separated by `|`). `prefers-reduced-motion` and `?pose=1` disable motion.

## Architecture
- `assets/js/data.js` (`window.CCH`): ALL business content. `PRODUCTS` are built with `p(id, name, cat, occasions, line, price, extra)`. `img` defaults to `id`, and the image must exist in both `img/full` and `img/thumb`.
- `assets/js/store.js` (`window.CCHStore`): the localStorage db (`cch.v1`) and cart (`cch.cart.v1`). It seeds about 140 customers and 460 orders relative to today, and reseeds daily while keeping `own:true` orders, own customers, own messages and capacity overrides. It also handles capacity (`capacityByDay` × "units": 1 per celebration cake, 1 per tier), pricing, `placeOrder`, `updateOrder`, `upcomingOccasions`. A `storage` listener re-reads the db when another tab writes, which is what keeps the tracking page live.
- `assets/js/site.js` (`window.CCHUI`): injects the nav, mobile menu, cart and quick-view drawers, toasts, curtain and footer (`<div data-footer>`). Also the product `card()`, Lenis, reveals, the intro (home only, once per session) and the curtain on internal links.
- `assets/js/concierge.js`: Ama (`window.CCHConcierge.answer(text)` returns HTML). Rule-based on purpose, so it is reliable on camera.
- Page scripts: `home.js`, `menu.js`, `atelier.js` (CSS-drawn cake, pricing model at the top), `checkout.js`, `inner.js` (weddings, gallery, about). `track.html` has inline JS.
- `admin/index.html` + `assets/js/admin.js`: the hash-routed Studio (`#today #orders #kitchen #counter #calendar #clients #insights #assistant #inbox`). Charts are inline SVG. The categorical palette `#9b2c52 / #d99a3a / #3f7fbf` was validated for colour-blind separation; the caramel is low-contrast, so charts always carry a legend, a tooltip and a table view.

## Conventions & gotchas
- Every body has `data-page`. Inner pages load scripts in this order: gsap → ScrollTrigger → lenis → data → store → site → concierge → page script.
- Use `minmax(0, 1fr)` for grid columns (plain `1fr` caused overflow at 375px).
- `[hidden]` is forced to `display:none !important` in style.css. Use the attribute, not inline styles.
- Price formatting: `CCHStore.money(n)`. Dates are ISO `YYYY-MM-DD` strings; use `S.parse` / `S.iso` / `S.fmtDate`.
- Testing in the Claude browser pane while it's hidden: rAF, IntersectionObserver and CSS transitions pause. Drive GSAP with `setInterval(() => gsap.ticker.tick(), 16)` and force `.is-in` on reveals before screenshots.
- No emoji icons. No cream + serif-italic look. No lorem ipsum. Never collect card details; payments stay simulated.

## Rebrand checklist
data.js → photos (full + thumb, same name) → `:root` colours → logo SVGs (site.js, admin/index.html, favicon) → hero slides in home.js → README placeholders → CREDITS.md.
