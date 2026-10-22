/* ==========================================================================
   Cindy's Cake House: all business content lives in this one file.
   To rebrand: change BUSINESS, ZONES, FLAVOURS, PRODUCTS, TEAM and REVIEWS.
   Prices are in Ghana cedis (GHS). Images: assets/img/full/<img>.jpg and
   assets/img/thumb/<img>.jpg (see CREDITS.md).
   ========================================================================== */
window.CCH = (function () {
  const BUSINESS = {
    name: "Cindy's Cake House",
    short: "Cindy's",
    tagline: "Pâtisserie, bakery & cakes",
    city: "Accra",
    address: "12 Nii Sai Road, Cantonments, Accra",
    gps: "GA-090-1462",
    landmark: "Two streets behind the Cantonments roundabout, white gate with the hibiscus hedge",
    phone: "+233 30 291 4400",
    whatsapp: "233550123400",
    whatsappDisplay: "+233 55 012 3400",
    email: "hello@cindyscakehouse.com.gh",
    instagram: "@cindyscakehouse",
    founded: 2016,
    momo: "MTN MoMo merchant 404112 · Telecel Cash 22871",
    depositRate: 0.5,
    hours: [
      { d: "Monday", h: "9:00 – 15:00 · counter & consultations" },
      { d: "Tuesday – Friday", h: "7:30 – 19:00" },
      { d: "Saturday", h: "8:00 – 20:00" },
      { d: "Sunday", h: "10:00 – 17:00" }
    ],
    // production capacity in "cake units" per weekday, Sunday first (a celebration cake = 1, each wedding tier = 1)
    capacityByDay: [6, 4, 8, 8, 8, 10, 12]
  };

  const ZONES = [
    { id: "cantonments", name: "Cantonments", fee: 0, eta: "45 min" },
    { id: "airport-res", name: "Airport Residential", fee: 40, eta: "50 min" },
    { id: "labone", name: "Labone", fee: 40, eta: "50 min" },
    { id: "ridge", name: "Ridge & Ministries", fee: 50, eta: "1 hr" },
    { id: "osu", name: "Osu", fee: 50, eta: "1 hr" },
    { id: "airport-hills", name: "Airport Hills", fee: 60, eta: "1 hr" },
    { id: "east-airport", name: "East Airport", fee: 60, eta: "1 hr" },
    { id: "roman-ridge", name: "Roman Ridge & Dzorwulu", fee: 60, eta: "1 hr" },
    { id: "east-legon", name: "East Legon", fee: 70, eta: "1 hr 15" },
    { id: "trasacco", name: "Trasacco Valley", fee: 90, eta: "1 hr 30" },
    { id: "spintex", name: "Spintex", fee: 90, eta: "1 hr 30" },
    { id: "tema", name: "Tema Community 25", fee: 150, eta: "2 hr" },
    { id: "aburi", name: "Aburi & Peduase", fee: 250, eta: "2 hr 30" }
  ];
  const SETUP_FEE = 450; // white-glove wedding / tiered set-up within Accra

  const CATEGORIES = [
    { id: "patisserie", name: "Pâtisserie", line: "Éclairs, tarts and entremets, made every morning" },
    { id: "viennoiserie", name: "Bakery & viennoiserie", line: "Croissants, danishes, loaves and cookies from 7:10" },
    { id: "couture", name: "Celebration cakes", line: "Couture cakes, baked to order in 48 hours" },
    { id: "wedding", name: "Weddings", line: "Tiered cakes, knocking cakes and tastings" },
    { id: "confection", name: "Macarons & chocolates", line: "Single-origin Ghanaian cocoa from Ashanti" },
    { id: "events", name: "Dessert tables", line: "Styled tables for 20 to 400 guests" },
    { id: "gifting", name: "Gifting & corporate", line: "Ribboned boxes and branded orders" }
  ];

  const OCCASIONS = [
    { id: "birthday", name: "Birthdays" },
    { id: "wedding", name: "Weddings" },
    { id: "engagement", name: "Engagements" },
    { id: "baby", name: "Baby & naming" },
    { id: "romance", name: "Anniversaries" },
    { id: "kids", name: "Children" },
    { id: "corporate", name: "Corporate" },
    { id: "everyday", name: "Just because" }
  ];

  const FLAVOURS = [
    "Ghana cocoa 70% & ganache",
    "Madagascar vanilla bean",
    "Red velvet & cream cheese",
    "Pistachio & rose",
    "Sobolo hibiscus & raspberry",
    "Volta mango & passion fruit",
    "Salted caramel & groundnut praline",
    "Coconut & lime",
    "Lemon & ginger curd",
    "Coffee & cardamom",
    "Carrot, spice & pecan"
  ];

  // size multipliers for couture cakes (base price = 6 inch)
  const SIZES = [
    { id: "6", name: "6 inch", serves: "10–12", mult: 1 },
    { id: "8", name: "8 inch", serves: "20–24", mult: 1.65 },
    { id: "10", name: "10 inch", serves: "35–40", mult: 2.4 }
  ];

  // p(id, name, cat, occasions, line, price, img, extra)
  const P = [];
  function p(id, name, cat, occ, line, price, extra) {
    P.push(Object.assign({ id, name, cat, occ, line, price, img: id }, extra || {}));
  }
  const cake = { sizes: true, flavours: true, message: true, unit: "6 inch · serves 10–12", leadDays: 2 };
  const tier = (t, serves, lead) => ({ from: true, unit: `${t} tiers · serves ${serves}`, tiers: t, leadDays: lead || 21, flavours: true, message: true, setup: true });

  /* ---------------- Couture celebration cakes ---------------- */
  p("cel-lambeth-rose", "The Lambeth Rosé", "couture", ["birthday", "romance"], "Vintage over-piping in blush meringue, gold-leaf cherries", 1350, Object.assign({ badge: "Signature" }, cake, { leadDays: 3 }));
  p("cel-pearl-sculpture", "Pearl Sculpture", "couture", ["birthday", "romance", "engagement"], "Sculpted ivory fondant, sugar peony, mirrored gold stand", 2800, Object.assign({}, cake, { unit: "8 inch · serves 20–24", sizes: false, leadDays: 5, badge: "Signature" }));
  p("cel-petite-bow", "Petite Bow", "couture", ["romance", "birthday"], "A four-portion ivory cake piped with satin bows", 480, { unit: "4 inch · serves 4", flavours: true, message: true, leadDays: 1, badge: "Bestseller" });
  p("cel-lilac-indulgence", "Lilac Indulgence", "couture", ["birthday", "kids"], "Lavender buttercream piled with macarons and white chocolate", 1650, cake);
  p("cel-pearl-bubbles", "Pearl Bubbles", "couture", ["birthday", "baby"], "Two peach tiers, isomalt pearls and edible shimmer", 2450, Object.assign({}, cake, { unit: "2 tiers · serves 30", sizes: false, leadDays: 4 }));
  p("cel-cookies-cream", "Cookies & Cream Drip", "couture", ["birthday", "kids", "everyday"], "Vanilla sponge, cookie crumb buttercream, dark drip", 1150, cake);
  p("cel-meringue-crown", "Meringue Crown", "couture", ["birthday", "everyday"], "Cocoa sponge, caramel drip, a crown of torched meringue kisses", 1250, Object.assign({ badge: "Bestseller" }, cake));
  p("cel-ganache-noir", "Ganache Noir", "couture", ["birthday", "everyday", "corporate"], "70% Ghana cocoa ganache, glossy shards, cocoa nib crunch", 1300, cake);
  p("cel-milestone", "The Milestone", "couture", ["birthday"], "Two chocolate tiers dressed with truffles and your number", 2200, Object.assign({}, cake, { unit: "2 tiers · serves 35", sizes: false, leadDays: 3 }));
  p("cel-hazelnut-praline", "Hazelnut Praline Drip", "couture", ["birthday", "everyday"], "Milk chocolate buttercream, praline wafer, ganache drip", 1150, cake);
  p("cel-espresso-caramel", "Espresso Caramel", "couture", ["birthday", "corporate", "everyday"], "Coffee & cardamom sponge, salted caramel, brown-butter rosettes", 1100, cake);
  p("cel-tropical", "Tropical Naked Cake", "couture", ["birthday", "everyday"], "Vanilla sponge, passion-fruit curd, Volta mango, pawpaw and berries", 1050, cake);
  p("cel-blood-orange-mango", "Blood Orange & Mango", "couture", ["everyday", "birthday"], "Semi-naked sponge with mango glaze and candied citrus", 980, cake);
  p("cel-raspberry-victoria", "Raspberry Victoria", "couture", ["everyday"], "Two vanilla layers, vanilla bean cream, a crown of raspberries", 850, cake);
  p("cel-red-velvet", "Red Velvet Signature", "couture", ["birthday", "romance", "everyday"], "Three layers of cocoa-tinted velvet, whipped cream cheese", 950, Object.assign({ badge: "Bestseller" }, cake));
  p("cel-rose-garden", "Rose Garden", "couture", ["romance", "birthday"], "Smooth ivory buttercream with a spray of hand-made sugar roses", 1400, cake);
  p("cel-strawberries-cream", "Strawberries & Cream", "couture", ["birthday", "everyday"], "White chocolate drip, fresh strawberries, meringue kisses", 1100, cake);
  p("cel-funfetti", "Pink Funfetti Drip", "couture", ["kids", "birthday"], "Sprinkle sponge, strawberry drip, whipped cream swirls", 1050, cake);
  p("cel-rosette-ombre", "Rosette Ombré", "couture", ["birthday", "romance"], "Hand-piped rosettes shading from ivory to raspberry", 1150, cake);
  p("cel-peony-donut", "Peony & Doughnut", "couture", ["birthday"], "Chocolate drip, sugar peonies, glazed mini doughnuts, gold topper", 1600, cake);
  p("cel-hexagon-garden", "Hexagon Garden", "couture", ["birthday", "romance", "engagement"], "Two hexagonal tiers painted with piped buttercream florals", 3200, { unit: "2 tiers · serves 45", leadDays: 5, flavours: true, message: true, badge: "Signature" });
  p("cel-buttercream-florist", "The Buttercream Florist", "couture", ["birthday", "romance"], "Ombré sponge crowned with piped dahlias and roses", 1450, cake);
  p("cel-carnation-gold", "Carnation & Gold", "couture", ["birthday", "baby"], "Pink carnations, gold-leaf flecks, lemon & ginger sponge", 1350, cake);
  p("cel-watercolour", "Watercolour", "couture", ["birthday", "baby", "everyday"], "Palette-knife buttercream in pastel washes", 1250, cake);
  p("cel-peony-crown", "Peony Crown", "couture", ["birthday", "romance"], "A domed crown of buttercream peonies over a pistachio sleeve", 1500, cake);
  p("cel-lilac-atelier", "Lilac Atelier", "couture", ["romance", "birthday"], "Ivory cake under a cascade of lilac sugar flowers", 1800, Object.assign({}, cake, { leadDays: 4 }));
  p("cel-emerald-orbit", "Emerald Orbit", "couture", ["birthday", "corporate"], "Green and bronze chocolate spheres, monogram plaque", 2300, Object.assign({}, cake, { leadDays: 3 }));
  p("cel-gilded-rose", "Gilded Rose", "couture", ["romance", "birthday", "engagement"], "Torn gold leaf, ivory roses, vanilla & raspberry layers", 1950, cake);
  p("cel-golden-heart", "Golden Heart", "couture", ["romance", "birthday"], "Vintage heart in gold lustre, piped frills, your message", 1250, { unit: "heart · serves 10", flavours: true, message: true, leadDays: 2 });
  p("cel-harvest-drip", "Harvest Drip", "couture", ["birthday", "everyday"], "Caramel drip, dried florals and a cedar slice board", 1200, cake);
  p("cel-lemon-meringue", "Lemon Meringue Tower", "couture", ["birthday", "everyday"], "Tall lemon & ginger sponge, curd, torched meringue peaks", 1150, cake);
  p("cel-fraisier", "Fraisier", "couture", ["everyday", "romance"], "Genoise, mousseline cream, halved strawberries, rose marzipan", 1100, { unit: "serves 10", leadDays: 1 });
  p("cel-chocolate-mousse", "Triple Chocolate Mousse", "couture", ["birthday", "everyday"], "Dark, milk and white mousse with a chocolate pearl glaze", 1200, cake);
  p("cel-bento", "Bento Love Note", "couture", ["romance", "birthday", "everyday"], "A two-person lunchbox cake with a hand-piped note", 280, { unit: "4 inch · serves 2", flavours: true, message: true, leadDays: 1, badge: "Bestseller" });
  p("cel-love-heart", "Vintage Love Heart", "couture", ["romance"], "Coral frills and a pink heart that says what you can't", 750, { unit: "heart · serves 8", flavours: true, message: true, leadDays: 1 });
  p("cel-candlelight-heart", "Candlelight Heart", "couture", ["romance", "birthday"], "Ivory heart with lambeth piping, made for the lights-off moment", 750, { unit: "heart · serves 8", flavours: true, message: true, leadDays: 1 });
  p("cel-pink-gilded", "Pink Gilded Fault-line", "couture", ["birthday", "baby"], "Ombré pink with a gold fault-line and fresh roses", 1550, cake);
  p("cel-coconut-cloud", "Coconut Cloud", "couture", ["everyday"], "Coconut & lime tres leches with toasted flakes", 850, { unit: "tray · serves 12", leadDays: 1 });
  p("cel-carrot-coconut", "Carrot, Pecan & Coconut", "couture", ["everyday", "birthday"], "Spiced carrot layers, cream cheese, toasted coconut", 950, cake);
  p("cel-basque", "Burnt Basque Cheesecake", "couture", ["everyday"], "Caramelised outside, barely set inside", 780, { unit: "whole · serves 10", leadDays: 1, badge: "Bestseller" });
  p("cel-strawberry-cheesecake", "Strawberry Cheesecake", "couture", ["everyday", "romance"], "Vanilla cheesecake under strawberry glaze and fresh berries", 820, { unit: "whole · serves 10", leadDays: 1 });
  p("cel-chocolate-curl", "Chocolate Ribbon", "couture", ["birthday", "romance"], "Mocha buttercream with tempered chocolate curls", 1350, cake);
  p("cel-berry-ribbon", "Fig & Berry Ribbon", "couture", ["birthday", "everyday"], "Strawberries, figs and pomegranate, tied with a gingham ribbon", 1150, cake);
  // children
  p("kid-under-the-sea", "Under the Sea", "couture", ["kids", "birthday"], "Ocean blue buttercream, sugar coral and little clownfish", 1450, Object.assign({}, cake, { leadDays: 3 }));
  p("kid-rainbow-tier", "Rainbow Party", "couture", ["kids", "birthday"], "Two tiers of rainbow, bunting and a sugar teddy", 1850, { unit: "2 tiers · serves 35", flavours: true, message: true, leadDays: 3 });
  p("kid-princess-castle", "The Princess Castle", "couture", ["kids", "birthday"], "Four turrets, a sugar carriage and a working drawbridge (almost)", 3800, { unit: "3 tiers · serves 60", flavours: true, message: true, leadDays: 7, badge: "Signature" });
  p("kid-first-birthday", "First Birthday Smash", "couture", ["kids", "baby", "birthday"], "A small, sugar-light cake for a first birthday smash", 650, { unit: "5 inch · serves 6", flavours: true, message: true, leadDays: 2 });
  p("kid-rainbow-layer", "Rainbow Layer Cake", "couture", ["kids", "birthday"], "Six coloured vanilla layers inside, sprinkles outside", 1150, cake);
  // baby & naming
  p("baby-oh-baby", "Oh Baby Plaque", "couture", ["baby"], "Rose-gold buttercream plaque cake for the announcement", 750, { unit: "7 inch · serves 12", flavours: true, message: true, leadDays: 2 });
  p("baby-pink-bow", "Pink Bow Tower", "couture", ["baby", "kids"], "Tall blush tiers wrapped in a sugar bow, for a naming day", 2600, { unit: "2 tiers · serves 40", flavours: true, message: true, leadDays: 5 });
  p("baby-moon-clouds", "Moon & Clouds", "couture", ["baby"], "Two powder-blue tiers, sugar clouds, a sleepy moon", 2400, { unit: "2 tiers · serves 40", flavours: true, message: true, leadDays: 5 });
  p("baby-reveal", "Boy or Girl?", "couture", ["baby"], "Ivory outside; pink or blue inside, known only to us and your doctor's envelope", 850, { unit: "6 inch · serves 12", flavours: true, leadDays: 2 });

  /* ---------------- Wedding & engagement ---------------- */
  p("wed-cantonments", "The Cantonments", "wedding", ["wedding"], "Five ivory tiers of combed buttercream with a cascade of garden roses and ivy", 18500, Object.assign({ badge: "Signature" }, tier(5, 220)));
  p("wed-monogram", "The Monogram", "wedding", ["wedding"], "Four tiers, hand-gilded initials and sugar roses in blush and cream", 14500, tier(4, 150));
  p("wed-candlelight-rose", "Candlelight Rose", "wedding", ["wedding"], "Four tiers wrapped in hundreds of blush sugar petals", 15800, tier(4, 160));
  p("wed-ivory-garden", "Ivory Garden", "wedding", ["wedding"], "Three textured tiers with white garden roses and olive leaves", 8800, tier(3, 90));
  p("wed-rouge", "Rouge", "wedding", ["wedding"], "Three ivory tiers, deep red roses, gold monogram topper", 8200, tier(3, 90));
  p("wed-berries-peonies", "Berries & Peonies", "wedding", ["wedding"], "Four tiers with fresh berries, figs and pink peonies", 11500, tier(4, 140));
  p("wed-dusty-rose", "Dusty Rose", "wedding", ["wedding", "engagement"], "Three semi-naked tiers dressed in dried lavender and dusty roses", 7600, tier(3, 85));
  p("wed-harmattan", "Harmattan", "wedding", ["wedding"], "Tall ivory tiers with pampas, wheat and dried blooms, for dry-season weddings", 9400, tier(3, 100));
  p("wed-midnight", "Midnight Semi-Naked", "wedding", ["wedding"], "Five semi-naked tiers on a gold-rimmed board, rosemary crown", 12000, tier(5, 200));
  p("wed-fig-honey", "Fig & Honey", "wedding", ["wedding", "engagement"], "Three tiers of honey sponge, mascarpone, figs and blackberries", 8400, tier(3, 90));
  p("wed-sage-gold", "Sage & Gold", "wedding", ["wedding"], "Sage fondant, a gold band and sculpted sugar camellias", 10800, tier(3, 110));
  p("wed-noir-botanica", "Noir Botanica", "wedding", ["wedding", "engagement"], "Matte black fondant, white sugar succulents, fresh olive", 6800, tier(2, 60, 14));
  p("wed-lily-pavilion", "Lily Pavilion", "wedding", ["wedding"], "Two tiers split by a glass pavilion of white lilies", 7200, tier(2, 70, 14));
  p("wed-rose-garland", "Rose Garland", "wedding", ["wedding"], "Three tiers circled by a garland of peach roses, Mr & Mrs topper", 9600, tier(3, 100));
  p("wed-sunflower", "Sunflower Cascade", "wedding", ["wedding"], "A waterfall of bright sugar flowers: sunflowers, roses, hydrangea", 12800, tier(4, 150, 28));
  p("wed-marigold", "Marigold", "wedding", ["wedding", "engagement"], "Sugar marigolds and daisies in kente-bright yellows", 10200, tier(3, 110, 28));
  p("wed-painted-bloom", "Painted Bloom", "wedding", ["wedding"], "Four tiers hand-painted with watercolour florals", 9200, tier(4, 120));
  p("eng-knocking", "Knocking Ceremony Cake", "wedding", ["engagement"], "Two ivory tiers with white roses and blackberries, sized for the family table", 4600, { from: true, unit: "2 tiers · serves 50", tiers: 2, leadDays: 7, flavours: true, message: true, setup: true });
  p("evt-tasting", "Private Tasting Flight", "wedding", ["wedding", "engagement"], "Six sponges, four fillings, one hour with Cindy. Fully credited to your order", 650, { unit: "for two · 60 min at the house", leadDays: 2, booking: true, badge: "Book first" });

  /* ---------------- Pâtisserie ---------------- */
  p("pat-eclair-cocoa", "Ghana Cocoa Éclair", "patisserie", ["everyday"], "Dark chocolate crémeux, cocoa glaze, toasted pecan", 75, { unit: "each", badge: "Bestseller" });
  p("pat-eclair-strawberry", "Strawberry Éclair", "patisserie", ["everyday"], "Vanilla diplomat cream, fresh strawberries, freeze-dried dust", 75, { unit: "each" });
  p("pat-eclair-praline", "Groundnut Praline Éclair", "patisserie", ["everyday"], "Paris-Brest cream made with Ghanaian groundnut praline", 80, { unit: "each" });
  p("pat-eclair-raspberry", "Raspberry Éclair", "patisserie", ["everyday"], "Raspberry cream, icing sugar, a single berry", 75, { unit: "each" });
  p("pat-tartelettes", "Tartelette Selection", "patisserie", ["everyday", "corporate"], "Nine jewel tartelettes: berries, kiwi, blueberry, rose apple", 690, { unit: "box of 9" });
  p("pat-pistachio-tartelette", "Pistachio & Raspberry Tartelette", "patisserie", ["everyday"], "Raspberry compote, pistachio ganache montée", 95, { unit: "each", badge: "New" });
  p("pat-lemon-meringue-tart", "Lemon Meringue Tart", "patisserie", ["everyday"], "Lemon & ginger curd under Italian meringue", 620, { unit: "whole · serves 8" });
  p("pat-tropical-tart", "Tropical Fruit Tart", "patisserie", ["everyday"], "Pineapple, kiwi, strawberries and blackberries on vanilla custard", 690, { unit: "whole · serves 8" });
  p("pat-mango-tart", "Mango Tarte Fine", "patisserie", ["everyday"], "Volta mango fanned over almond cream", 640, { unit: "whole · serves 8" });
  p("pat-chocolate-fig-tart", "Chocolate & Fig Tart", "patisserie", ["everyday", "romance"], "70% Ghana cocoa ganache, fresh figs, pistachio, orange", 720, { unit: "whole · serves 10", badge: "Signature" });
  p("pat-millefeuille", "Mille-Feuille Fraise", "patisserie", ["everyday"], "Caramelised puff pastry, vanilla cream, strawberries", 95, { unit: "each" });
  p("pat-pistachio-millefeuille", "Pistachio Mille-Feuille", "patisserie", ["everyday"], "Pistachio crémeux between three leaves of caramelised puff", 105, { unit: "each", badge: "Bestseller" });
  p("pat-opera", "Opéra", "patisserie", ["everyday"], "Coffee-soaked joconde, ganache, coffee buttercream", 95, { unit: "slice" });
  p("pat-passion-entremet", "Passion & Hibiscus Entremet", "patisserie", ["everyday"], "Passion-fruit mousse, sobolo jelly, almond dacquoise", 110, { unit: "each" });
  p("pat-raspberry-entremet", "Dark Raspberry Entremet", "patisserie", ["everyday", "romance"], "Dark chocolate mousse, raspberry heart, mirror glaze", 110, { unit: "slice" });
  p("pat-noir-cube", "Noir Cube", "patisserie", ["everyday", "romance"], "A 70% chocolate cube with a caramel heart, plated", 120, { unit: "each" });
  p("pat-lemon-dome", "Golden Lemon Dome", "patisserie", ["everyday"], "Lemon mousse, yuzu glaze, white chocolate sail", 115, { unit: "each" });
  p("pat-red-heart", "Red Heart Entremet", "patisserie", ["romance"], "Strawberry mousse heart, vanilla insert, red velvet glaze", 130, { unit: "each" });
  p("pat-ny-cheesecake", "New York Cheesecake", "patisserie", ["everyday"], "Dense vanilla cheesecake, berry compote", 95, { unit: "slice" });
  p("pat-speculoos-cheesecake", "Speculoos Cheesecake", "patisserie", ["everyday"], "Spiced biscuit base, caramelised biscuit cream", 95, { unit: "slice" });
  p("pat-tiramisu", "Tiramisu", "patisserie", ["everyday"], "Espresso-soaked savoiardi, mascarpone, cocoa", 95, { unit: "slice" });
  p("pat-red-velvet-slice", "Red Velvet Slice", "patisserie", ["everyday"], "A tall slice of the house red velvet", 95, { unit: "slice", badge: "Bestseller" });
  p("pat-carrot-slice", "Carrot Cake Slice", "patisserie", ["everyday"], "Spiced carrot, walnut, cream cheese", 90, { unit: "slice" });
  p("pat-shortcake", "Strawberry Shortcake", "patisserie", ["everyday"], "Japanese-style chiffon, whipped cream, strawberries", 95, { unit: "slice" });
  p("pat-trifle", "Tropical Trifle Cup", "patisserie", ["everyday"], "Mango, passion fruit, sponge and vanilla cream", 85, { unit: "cup" });
  p("pat-lemon-loaf", "Lemon Drizzle Loaf", "viennoiserie", ["everyday", "corporate"], "Lemon & ginger loaf, crackling glaze, candied peel", 320, { unit: "whole loaf" });
  p("pat-red-velvet-cupcake", "Red Velvet Cupcakes", "viennoiserie", ["everyday", "birthday", "kids"], "Cream cheese swirl, velvet crumb", 270, { unit: "box of 6" });
  p("pat-hazelnut-cupcake", "Hazelnut Praline Cupcakes", "viennoiserie", ["everyday", "birthday"], "Chocolate cupcake, praline buttercream, hazelnut truffle", 300, { unit: "box of 6" });
  p("pat-madeleines", "Glazed Madeleines", "viennoiserie", ["everyday", "corporate"], "Brown-butter madeleines dipped in mango, hibiscus and pistachio glaze", 210, { unit: "box of 9" });
  p("pat-brownies", "Ghana Cocoa Brownies", "viennoiserie", ["everyday", "corporate"], "Fudgy 70% cocoa brownies with sea salt", 240, { unit: "box of 6" });
  p("pat-cookies", "Brown-Butter Cookies", "viennoiserie", ["everyday", "kids"], "Chunky chocolate cookies, crisp edge, soft middle", 220, { unit: "box of 8" });

  /* ---------------- Viennoiserie ---------------- */
  p("pat-croissant", "Butter Croissant", "viennoiserie", ["everyday"], "Three days of lamination with cultured butter", 55, { unit: "each", badge: "Bestseller" });
  p("pat-bicolour-croissant", "Raspberry Bicolour Croissant", "viennoiserie", ["everyday"], "Striped raspberry dough, vanilla custard inside", 70, { unit: "each", badge: "New" });
  p("pat-pain-chocolat", "Pain au Chocolat", "viennoiserie", ["everyday"], "Two batons of 70% Ghana chocolate", 65, { unit: "each" });
  p("pat-danish-berry", "Strawberry & Raspberry Danish", "viennoiserie", ["everyday"], "Vanilla custard, roasted berries, pistachio", 70, { unit: "each" });
  p("pat-danish-blueberry", "Blueberry Danish", "viennoiserie", ["everyday"], "Cream cheese and blueberry compote", 70, { unit: "each" });
  p("pat-babka-knot", "Chocolate Babka Knot", "viennoiserie", ["everyday"], "Brioche twisted with chocolate and cinnamon", 65, { unit: "each" });
  p("pat-cinnamon-swirl", "Cinnamon Swirl", "viennoiserie", ["everyday"], "Cardamom brioche, brown sugar, cream cheese glaze", 55, { unit: "each" });

  /* ---------------- Macarons & chocolates ---------------- */
  p("conf-macaron-12", "Signature Macaron Coffret", "confection", ["everyday", "romance", "corporate"], "Twelve macarons: pistachio, rose, sobolo, mango, vanilla, cocoa", 420, { unit: "box of 12", badge: "Bestseller" });
  p("conf-macaron-6", "Petite Macaron Box", "confection", ["everyday", "romance"], "Six macarons in a golden sleeve", 230, { unit: "box of 6" });
  p("conf-pistachio-macarons", "Pistachio Macarons", "confection", ["everyday"], "Sicilian pistachio ganache, twelve to a box", 440, { unit: "box of 12" });
  p("conf-noir-24", "The Noir Collection", "confection", ["corporate", "romance"], "Twenty-four macarons in dark chocolate and raspberry", 790, { unit: "box of 24" });
  p("conf-truffles", "Single-Origin Truffles", "confection", ["romance", "corporate", "everyday"], "Ghana cocoa truffles rolled in cocoa, from one Ashanti cooperative", 520, { unit: "box of 16", badge: "Signature" });
  p("conf-bonbons", "Painted Bonbons", "confection", ["romance", "corporate"], "Six hand-painted bonbons: passion fruit, groundnut, rose, coffee", 380, { unit: "box of 6" });

  /* ---------------- Dessert tables & events ---------------- */
  p("evt-orchid-table", "The Orchid Table", "events", ["wedding", "engagement", "corporate"], "Our grandest table: orchids, gold stands and 12 kinds of dessert", 14500, { from: true, unit: "serves 100", leadDays: 21, setup: true, badge: "Signature" });
  p("evt-ivory-table", "Ivory Dessert Table", "events", ["wedding"], "A three-tier centre cake surrounded by petits fours in white and gold", 12000, { from: true, unit: "serves 100", leadDays: 21, setup: true });
  p("evt-engagement-table", "Engagement Sweet Table", "events", ["engagement"], "Engaged cake, monogram cookies, macarons and cupcakes in blush", 9800, { from: true, unit: "serves 80", leadDays: 14, setup: true });
  p("evt-silver-table", "Silver Pâtisserie Table", "events", ["corporate", "wedding"], "Crystal stands of tartelettes, choux and mini cheesecakes", 8500, { from: true, unit: "serves 80", leadDays: 10, setup: true });
  p("evt-petits-fours-tower", "Petits Fours Tower", "events", ["wedding", "corporate", "engagement"], "Sixty petits fours on a three-tier gilded stand", 2400, { unit: "60 pieces", leadDays: 4 });
  p("evt-macaron-tower", "Macaron Tower", "events", ["wedding", "engagement", "corporate"], "A 90-piece croquembouche of macarons in your colours", 3200, { unit: "90 macarons", leadDays: 5 });
  p("evt-midnight-minis", "Midnight Mini Desserts", "events", ["corporate", "wedding"], "Eighty one-bite chocolate cups and choux for evening receptions", 3600, { unit: "80 pieces", leadDays: 5 });
  p("evt-cake-pops", "Cake Pop Stand", "events", ["kids", "wedding", "baby"], "Thirty-six white chocolate cake pops on a gold rail", 1350, { unit: "36 pops", leadDays: 3 });
  p("evt-tiramisu-verrines", "Tiramisu Verrines", "events", ["corporate", "everyday"], "Twenty-four glass verrines of tiramisu and chocolate mousse", 1900, { unit: "24 glasses", leadDays: 3 });
  p("evt-afternoon-tea", "Afternoon Tea Tower", "events", ["everyday", "baby", "romance"], "Three tiers of finger slices, tartelettes and choux, to take home", 1250, { unit: "serves 4", leadDays: 2 });
  p("evt-high-tea", "High Tea for Two", "events", ["romance", "everyday"], "Verrines, opéra, tea and the garden table at the house", 780, { unit: "for two · at the house", leadDays: 1, booking: true });
  p("evt-corporate-canapes", "Corporate Dessert Canapés", "events", ["corporate"], "One hundred bite-size desserts, boxed for the boardroom", 5500, { unit: "100 pieces", leadDays: 5 });

  /* ---------------- Gifting & corporate ---------------- */
  p("gift-pistachio-ribbon", "The Pistachio Ribbon Box", "gifting", ["corporate", "romance", "everyday"], "Six petits gâteaux in our white box, tied in pistachio silk", 650, { unit: "6 pieces", message: true, badge: "Signature" });
  p("gift-hatbox", "Hatbox Cake", "gifting", ["birthday", "romance"], "A 6 inch couture cake delivered in a round gift hatbox", 1450, { unit: "serves 10–12", flavours: true, message: true, leadDays: 2 });
  p("gift-petite-box", "Petite Slice Gift", "gifting", ["everyday", "corporate"], "One slice of the day's cake in a ribboned box, with a card", 180, { unit: "1 slice", message: true });
  p("gift-breakfast", "Breakfast in Bed Box", "gifting", ["romance", "birthday", "everyday"], "Croissants, danishes, babka and two coffees, delivered before 9", 480, { unit: "serves 2", message: true, leadDays: 1 });
  p("gift-brunch", "Sunday Brunch Box", "gifting", ["everyday", "corporate"], "Waffles, viennoiserie, cheese, fruit and preserves", 890, { unit: "serves 4", message: true, leadDays: 1 });
  p("gift-biscuits", "Butter Biscuit Assortment", "gifting", ["corporate", "everyday"], "Fifty shortbreads, sablés and nut biscuits, gift-wrapped", 360, { unit: "50 pieces", message: true });
  p("gift-corporate-cookies", "Branded Cookie Box", "gifting", ["corporate"], "Eight cookies with your logo sleeve. Minimum 20 boxes", 160, { unit: "per box · min. 20", message: true, leadDays: 5 });

  const TEAM = [
    { name: "Cindy Asamoah-Larbi", role: "Founder & creative director", img: "team-cindy", bio: "Trained in London, came home in 2016 with one oven and a list of Accra clients who were flying their wedding cakes in from abroad." },
    { name: "Efua Mensah-Bonsu", role: "Head pâtissière", img: "team-efua", bio: "Runs the overnight lamination and every entremet on the counter. Twelve years in hotel kitchens from Lagos to Dubai." },
    { name: "Nana Ama Kyei", role: "Sugar-flower artist", img: "team-nana-ama", bio: "Makes every sugar rose, orchid and marigold by hand. A Hexagon Garden takes her two days." },
    { name: "Esi Badu", role: "Events & client concierge", img: "team-esi", bio: "Plans the tastings, the dessert tables and the delivery routes. If you've WhatsApped us, you've met Esi." }
  ];

  const REVIEWS = [
    { q: "Guests photographed the cake more than they photographed me. Five tiers, delivered to Aburi, not a petal out of place.", n: "Adwoa A.", a: "The Cantonments, wedding in Peduase" },
    { q: "Ordered at eleven at night, picked a slot, paid with MoMo. It arrived at four o'clock exactly and they set it on the table.", n: "Efua D.", a: "Airport Residential" },
    { q: "They sent me a note three weeks before my daughter's birthday with last year's cake. I had honestly forgotten to plan.", n: "Nadia K.", a: "Trasacco Valley" },
    { q: "The pistachio mille-feuille is the best thing I have eaten in Accra this year. I now pass Cantonments on purpose.", n: "Kojo M.", a: "East Legon" },
    { q: "Sixty gift boxes every December, one link, one invoice, and every box arrives at a different office on time.", n: "Akua S.", a: "HR director, Ridge" }
  ];

  const FAQ = [
    { q: "How far ahead should I order?", a: "Pâtisserie and viennoiserie: same day, while the counter lasts. Couture cakes: 48 hours to five days. Wedding cakes: three weeks or more, and we take a limited number of weddings each weekend." },
    { q: "How does the deposit work?", a: "Cakes and tables are confirmed with a 50% deposit by Mobile Money or card. The balance is due 72 hours before delivery. Counter items are paid in full." },
    { q: "Do you deliver tiered cakes?", a: "Yes, in our own air-conditioned van with two staff who set the cake up at the venue. Set-up within Accra is GHS 450." },
    { q: "Can you match a photo I found?", a: "Upload it in the Cake Atelier. We never copy another artist's cake exactly, but we will design something in the same spirit and tell you honestly what is possible." },
    { q: "Do you cater for allergies?", a: "We can make eggless and nut-free cakes on request, but our kitchen handles nuts, gluten, dairy and eggs, so we cannot promise a trace-free cake." }
  ];

  return { BUSINESS, ZONES, SETUP_FEE, CATEGORIES, OCCASIONS, FLAVOURS, SIZES, PRODUCTS: P, TEAM, REVIEWS, FAQ };
})();
