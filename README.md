# Cindy's Cake House: website + studio system (pitch sample)

A complete sample for a luxury cake house and pâtisserie in Cantonments, Accra. It is built to be shown to bakery and cake-studio owners as "what we would build for you". It is not a brochure site. It is a working front end for the whole business:

| Part | What it does |
|---|---|
| **Website** (`index.html`, `menu.html`, `weddings.html`, `gallery.html`, `about.html`, `policies.html`) | 134 priced creations in 7 categories, with filters, photography and quick-add |
| **Cake Atelier** (`atelier.html`) | Customers design a cake (tiers, shape, sponge per tier, finish, colour, decoration, inspiration photos). The cake redraws live, the price updates, and the calendar only offers dates the kitchen can actually make |
| **Checkout** (`checkout.html`) | One combined bag: delivery or collection, zone fees, set-up fee, two-hour windows, gift orders, an "occasion memory" opt-in, 50% deposit or full payment (MoMo / card / pay on collection, all simulated), a reference number, a pre-filled WhatsApp message and a calendar file |
| **Order tracking** (`track.html`) | A live timeline. It updates by itself when the owner moves the order on the kitchen board |
| **Ama, the AI concierge** (every page) | Answers from the real catalogue, zones, capacity and order book: recommendations by occasion, guest count and budget, wedding quotes, date availability, delivery fees and order status |
| **Cindy's Studio** (`admin/`) | The owner's dashboard: a morning briefing, orders from every channel, a drag-and-drop kitchen board, a walk-in counter (POS) that recognises returning customers, capacity calendar, client list with **occasion reminders**, insights (channels, best sellers, areas, website funnel, search terms), an assistant that answers business questions, and an inbox |

Everything shares one browser "database" (`localStorage`), so an order placed on the website appears in the Studio at once, and a status change in the Studio shows up on the customer's tracking page in another tab.

## Run it

- **Easiest:** double-click `OPEN-WEBSITE.bat` (Windows). It starts a tiny local server and opens the site.
- **Or** open `index.html` directly in Chrome or Edge. Everything works offline from `file://`.
- **Or** any static server: `npx http-server . -c-1`, then open the address it prints.
- **GitHub Pages:** push the folder as-is (there is a `.nojekyll`). No build step.

The Studio is at `admin/index.html` (also "Owner login" in the footer). Click **Enter as Cindy**; it's demo access, with no password.

### Recording a demo video
- Clear the site data, or use **Reset demo data** in the Studio sidebar, to replay the intro and start with an empty bag.
- The intro plays once per browser session. Open a new private window to see it again.
- Add `?pose=1` to any URL to freeze all motion and autoplay, for clean screenshots.
- Add `?chat` to any URL to open Ama automatically.
- A strong 90-second story: Home intro → Atelier (build a 3-tier cake, pick a date) → Checkout → WhatsApp confirmation → Studio "Today" → Kitchen board (drag the order) → back to the tracking tab, which updates by itself → Clients (occasion reminders) → Assistant ("What should we bake more of tomorrow?").

## Rebrand it for a real client

1. **`assets/js/data.js`**: the only file most rebrands need. Business details, hours, delivery zones and fees, weekly kitchen capacity, flavours, sizes, every product (name, line, price, unit, notice, image), team, reviews, FAQ.
2. **Photos**: put each image in `assets/img/full/<name>.jpg` (max ~1600px) **and** `assets/img/thumb/<name>.jpg` (max ~640px). A product's `img` (defaults to its `id`) is the file name. Replace the stock photos with the client's own work before going live, and update `CREDITS.md`.
3. **Colours & type**: CSS custom properties at the top of `assets/css/style.css` (`--cocoa`, `--sobolo`, `--meringue`, `--blush`, `--pistachio`; fonts in `assets/fonts/`).
4. **Logo**: the `logo()` SVG in `assets/js/site.js`, the copies in `admin/index.html`, and `assets/icons/favicon.svg`.
5. **Copy**: page headlines live in each HTML file; the hero slides are at the top of `assets/js/home.js`.
6. **Demo history**: the seeded customers and orders are generated in `assets/js/store.js` (`seed()`).

## Placeholders to replace before using for a real business

All of these are invented for the sample:

- **Business**: name "Cindy's Cake House", address "12 Nii Sai Road, Cantonments, Accra", GhanaPost GPS "GA-090-1462", landmark text, phone "+233 30 291 4400", WhatsApp "+233 55 012 3400", email `hello@cindyscakehouse.com.gh`, Instagram `@cindyscakehouse`, founded 2016, MoMo merchant numbers.
- **Team**: Cindy Asamoah-Larbi, Efua Mensah-Bonsu, Nana Ama Kyei, Esi Badu, and their bios. The portraits are stock photos of models, not those people.
- **Reviews**: Adwoa A., Efua D., Nadia K., Kojo M., Akua S. All are fictional.
- **Prices, delivery fees, hours, capacity and lead times**: realistic for upmarket Accra in 2026, but set them with the client.
- **Couples and captions in the gallery**: fictional names and venues.
- **Studio data**: about 140 customers and 460 orders, generated fresh each day so the dashboard always looks current. Orders placed on the site are kept.
- **Search terms and website funnel** in Insights are illustrative, not real analytics.

## What is simulated (and what a live build adds)

| In the sample | In production |
|---|---|
| Data in the browser's `localStorage` | A database and API (e.g. Supabase or Postgres), with staff accounts and roles |
| Payments simulated; no card fields anywhere | Paystack or Hubtel for MTN MoMo, Telecel Cash, AT Money and cards (hosted pages) |
| WhatsApp links open a pre-filled chat | WhatsApp Business API for confirmations, status updates and the yearly occasion reminders |
| Ama and the Studio assistant are rule-based and answer from live data | An LLM with the same data exposed as tools, plus hand-off to staff |
| Inspiration photos stay in the browser | File storage, attached to the order |

## Files

```
index.html  menu.html  atelier.html  weddings.html  gallery.html  about.html
checkout.html  track.html  policies.html  admin/index.html
assets/
  css/  style.css (design system) · pages.css (home, menu) · atelier.css · checkout.css · inner.css · admin.css
  js/   data.js (content) · store.js (data & cart) · site.js (chrome & motion) · concierge.js (Ama)
        home.js · menu.js · atelier.js · checkout.js · inner.js · admin.js
  vendor/  gsap, ScrollTrigger, lenis (local copies)
  fonts/   Gilda Display, Albert Sans, IBM Plex Mono (woff2)
  img/full, img/thumb   216 photos (see CREDITS.md)
```

Photo credits: see `CREDITS.md` (Unsplash License).
