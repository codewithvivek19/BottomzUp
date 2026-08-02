# Bottomz Up Bar & Grill — Project Context

**File purpose:** Single source of truth for continuing work (including Antigravity or other AI tools).  
**Last updated:** 2026-07-30  
**Workspace:** `/Users/vivekdutta/websites/bottomzup-website`  
**Stack:** Static HTML / CSS / JS (no framework, no backend)

---

## 1. Project Overview

### Restaurant

| Field | Value |
|--------|--------|
| **Name** | Bottomz Up Bar & Grill |
| **Location** | 2001 Seymour Dr, South Boston, VA 24592 |
| **Concept** | Local bar & grill — Back Alley Burgers, bone-in wings (mild → Xtra Hot), full bar. Irreverent house naming (Garbage Burger, Plantastic, Trash Can cocktail, etc.), premium-casual dive-bar energy — **not** a polished chain or template “American restaurant.” |
| **Local shorthand** | SoBo (South Boston) — use sparingly, only when it feels natural |

### Website goals

1. **Marketing** — Appetite, brand presence, local trust.
2. **Conversion** — Menu → visit (walk-in, directions, or call/reserve when phone is live).
3. **Menu-first** — Full interactive menu is the primary product path; home teases and converts.

**Success:** Visitor browses the real menu, then acts (menu, maps, plan visit / call). No dead-end CTAs. No online ordering system.

### Target audience

| Priority | Who | Job to be done |
|----------|-----|----------------|
| Primary | South Boston locals | Check menu, get hungry, confirm location, decide to head over tonight |
| Primary | First-timers / visitors | Read the place quickly (burgers, wings, bar), address, confidence to walk in |
| Secondary | Groups | Shareable menu, party-size reserve flow, directions |

---

## 2. Brand Identity

### Color palette (exact hex — do not invent new primaries)

```text
Cream           #F5E8B7   --color-cream / page base
Cream light     #FBF6E3   --color-cream-light
Cream dark      #E8D9A0   --color-cream-dark

Amber           #E7931E   --color-amber (primary accent)
Amber bright    #F19F0F   --color-amber-bright (hovers, highlights)
Amber deep      #C67A12   --color-amber-deep
Amber soft      rgba(231, 147, 30, 0.12)
Amber glow      rgba(241, 159, 15, 0.22)

Charcoal        #2E2C2C   --color-charcoal
Charcoal soft   #3F3C3C
Ink             #1A1919   --color-ink

White           #FFFFFF
Off-white       #FEFDF9

Text muted      #5C5850
```

**Extended (footer / lifestyle accents — used intentionally):**

```text
Footer terracotta   #C45A2A   (impact footer base, with amber blend)
Footer deep         #A8481F
Footer hot          #D46832
Lifestyle MENU badge #C45A2A  (dashed circular badges)
```

**Semantic tokens:** `--bg-primary`, `--bg-elevated`, `--bg-dark`, `--text-primary`, `--text-on-dark`, `--text-muted`, `--accent`, `--accent-hover`.

### Typography

| Role | Family | Usage |
|------|--------|--------|
| Display / headlines | **Lemon Milk** (local woff2/otf) | H1–H3, big CTAs, price stamps, section titles |
| Body / UI | **Poppins** (Google Fonts 400–700) | Nav, body, labels, buttons |
| Mono | SF Mono / ui-monospace | Promo codes (e.g. scratch coupon) |

CSS variables:

```css
--font-display: "Lemon Milk", "Arial Black", Impact, system-ui, sans-serif;
--font-body: "Poppins", system-ui, -apple-system, sans-serif;
```

Fonts load via `css/fonts.css` (Lemon Milk) + Google Poppins in page `<head>`.  
**Note:** Lemon Milk free build is personal-use; commercial deploy should use a licensed cut.

### Personality & voice

- Warm, bold, appetizing, **premium-casual dive-bar polish**
- Direct, local, honest — never generic “AI restaurant” copy
- **Do not invent:** star ratings, fake reviews, awards, “#1 in town,” customer names, phone number, or hours
- Missing phone/hours → explicit “coming soon” / “call for hours,” not invented data

### Visual style references

1. **Print menu brand** — cream / amber / charcoal (source of truth for colors)
2. **FreshBox Framer template** — structure only (black/cream plate wave, ticket buttons, food conveyor, cream nav pill) remapped to Bottomz tokens  
   Extract: `design-extract-output/freshbox-framer-website-*`
3. **Conversion footer** — loud terracotta/amber full-bleed CTA (Smash-style energy)
4. **Lifestyle editorial** — asymmetric photo grid, dark overlays, dashed MENU badges

---

## 3. Current Site Structure

### Pages

| Page | Path |
|------|------|
| Homepage | `index.html` |
| Full menu | `pages/menu.html` |

### Homepage sections (top → bottom)

| # | ID / class | Purpose |
|---|------------|---------|
| — | `header#header` | Fixed Freshbox-style cream nav panel + mobile drawer |
| — | `aside#stickyCta` | Sticky conversion bar after hero scroll |
| 1 | `#hero` `.fbx-hero` | Hero: amber/cream wave plate, static type, food carousel, deco produce |
| 2 | `#menu-preview` marquee | Infinite dish marquee — “Explore Our Popular Dishes” |
| 3 | `.house-strip` | Utility facts: address, walk-ins, 12 sauces, full bar |
| 4 | `#burgers` | Featured burgers (mobile snap scroller / desktop grid) |
| 5 | `#vibe` `.lifestyle` | Lifestyle editorial (Grill Ritual / Main Event / Built for Sharing) |
| 6 | `#drinks` `.wings-beer` | Wing sizes, interactive heat bottle, beer panel |
| 7 | `#visit` | Address, hours note, directions CTA, map card |
| 8 | `#promo` scratch | Scratch-to-reveal **10% off** code `ZUP10` |
| 9 | `#reserve` | Final CTA band — plan visit / browse menu |
| — | `#reservePanel` | Modal: party size, honest phone state, maps |
| — | `footer.site-footer--impact` | Conversion footer: marquee, burgers, ORDER NOW, social, copyright |

### Menu page (`pages/menu.html`)

- Compact menu hero + tonight’s pick
- Sticky category chips / filters
- Full sections from `js/menu-data.js`
- Interactive heat bottle (wing sauces)
- Collapsible drinks
- Reserve panel + simpler footer (not yet the impact footer)

### Section contents (homepage detail)

**Hero**

- Cream page canvas + SVG wave plate filled with **menu amber** gradient (`#C67A12` → `#E7931E` → cream), animated stops
- Tag: “Burgers · Beers · Wings”
- H1: “Crafted for Cravings / Served with Perfection”
- CTA: View Full Menu (above food)
- Food conveyor (float PNG cutouts) lower on wave; autoplay, dots, swipe
- FreshBox cutout deco: chilis / tomatoes (not dish hero food)

**Marquee dishes**

- Cards: Classic House, Bacon Cheese, Double Decker, Wings, Buffalo Chicken, Full Bar, Full Menu (48+)
- Prices on cards; dual group seamless loop; pause on hover/focus

**House strip**

- Address (maps), Walk-ins, 12 sauces, Full pour — tappable where relevant

**Burgers**

- Classic $14, Bacon Cheese $16, Double Decker $18 (Heavy hitter), Buffalo Chicken $13
- Whole card = link to menu burgers

**Lifestyle**

- Tall left: **Grill Ritual** (placeholder image)
- Top right: **The Main Event**
- Bottom right: **Built for Sharing**
- Two dashed terracotta **MENU** badges → `pages/menu.html`
- Motion: staggered inview + Ken Burns + light image parallax (`data-lifestyle`)

**Wings / beer**

- Sizes Small 6pc $10 / Medium 12 $16 / Large 24 $29
- Heat bottle lab (mild → xtra)
- Domestic + import beer lists

**Visit**

- 2001 Seymour Dr; hours honesty; Get Directions + Plan your visit
- Clickable map card

**Scratch promo**

- Code **ZUP10** = 10% off food (show staff); canvas scratch foil; localStorage remember

**Footer impact**

- Marquee: ORDER NOW · SMASHED FRESH DAILY
- Headline: “Hungry? Get here.” / sub: “Smashed fresh · full bar · right now”
- ORDER NOW → menu; flanking float burgers
- Social: Instagram, TikTok, X, Threads (placeholder root URLs)
- 2026 Copyright pill; legal line

---

## 4. Design System & Technical Details

### CSS architecture

```text
css/tokens.css       Design tokens (colors, type, space, radius, motion, shadow)
css/fonts.css        Lemon Milk @font-face
css/base.css         Reset, typography helpers, buttons, cards, .reveal
css/nav.css          Header panel, ticket buttons, sticky CTA, drawer
css/atmosphere.css   Body mesh gradients, grain, section atmospheres
css/home.css         Homepage sections (marquee, burgers, wings, visit, reserve…)
css/hero-freshbox.css  Hero plate wave + food conveyor
css/deco-freshbox.css  Floating produce decorations
css/lifestyle.css    Lifestyle editorial grid
css/scratch-coupon.css Scratch promo card
css/footer-impact.css  Conversion footer
css/heat-bottle.css  Wing heat instrument
css/menu.css         Menu page layout
css/extras.css       Reserve panel, sticky, logo bridges
```

Import order on home roughly: `base` → `home` → `nav` → `extras` → `heat-bottle` → `atmosphere` → `hero-freshbox` → `deco-freshbox` → `scratch-coupon` → `footer-impact` → `lifestyle`.

### JS modules

```text
js/contact.js        BOTTOMZ_CONTACT config (phone empty until real)
js/contact-ui.js     Binds call/SMS/maps labels to contact state
js/main.js           Nav drawer, sticky CTA, reveals, marquee pause, lifestyle motion, footer parallax
js/hero-carousel.js  Food conveyor slots + autoplay
js/heat-bottle.js    Interactive sauce heat scale
js/scratch-coupon.js Scratch foil (ImageScratch-style destination-out)
js/menu-data.js      Full menu JSON-ish data from print PDF
js/menu.js           Menu page filters, search, rendering
```

### Spacing / radius / shadow / motion

- **Space scale:** 8pt base (`--space-1` … `--space-16`)
- **Radius:** sm 4 · md 10 · lg 16 · xl 24 · full pill
- **Ticket buttons:** diagonal corners — TL/BR **40px** (Freshbox pattern)
- **Nav bar:** cream `#fff7e8`, bottom radius **30px**, max-width ~1120px
- **Shadows:** warm charcoal, restrained; amber glow sparingly
- **Motion:** `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`; always honor `prefers-reduced-motion`
- **Z-index:** grain ~50 · sticky ~400 · header **500** · reserve panel ~210

### Key patterns / classes

| Pattern | Notes |
|---------|--------|
| `.btn-ticket` | Charcoal fill + `.btn-hover-fill` amber bloom |
| `.btn-ticket-light` | Outline ticket variant |
| `.eyebrow` | Small uppercase amber label |
| `.display` / `.heading-*` | Lemon Milk display scale |
| `.reveal` + `.is-visible` | Scroll reveal |
| `.fbx-hero` | Black/cream plate model with amber gradient fill |
| `.dish-card` | Marquee product cards |
| `.burger-scroller` | Mobile horizontal snap; desktop grid |
| `.house-fact` | Utility strip cells |
| `.lifestyle-card` | Editorial photo cards |
| `[data-scratch]` | Scratch coupon root |
| `.site-footer--impact` | Loud conversion footer |
| `data-contact="call-label"` | Dynamic CTA label from contact.js |

### Responsive approach

- Mobile-first enhancements for scroller/snap, full-width CTAs &lt; ~520px
- Hero food satellites hide on small screens; single center plate
- Marquee → static wrap under `prefers-reduced-motion`
- Footer: 3-col → CTA top + burgers → stacked utility
- Lifestyle: 1+2 → tall full-width + pair → single column
- Sticky CTA + footer padding for bottom safe area on mobile

### Local preview

```bash
# from project root
python3 -m http.server 8765
# open http://localhost:8765
```

---

## 5. Content Library

### Global / chrome

- Nav: Menu · Burgers · Wings · Visit
- Primary nav CTA: **Plan your visit**
- Sticky: “South Boston” · “Tables fill up — walk-ins welcome” · Menu · Plan your visit
- Phone empty: labels become honest variants via contact-ui (“Phone number coming soon”)

### Hero

- Tag: Burgers · Beers · Wings  
- H1: Crafted for Cravings / Served with Perfection  
- CTA: View Full Menu  

### Marquee

- Eyebrow: Categories  
- Title: Explore Our Popular Dishes  
- Lede: Hand-formed burgers, bone-in wings, and a full bar — pick a lane or scroll the house favorites.  
- CTA: Browse Full Menu  

### House strip

- Address · 2001 Seymour Dr · South Boston, VA  
- Seating · Walk-ins · Groups: give a heads up  
- Wings · 12 sauces · Mild → Xtra Hot  
- Bar · Full pour · Beer · cocktails · wine  

### Burgers section

- Eyebrow: Back Alley Burgers  
- H2: Stacked the way a burger **should** be.  
- Lede: Hand-formed patties, fries on the side. From the house classic to the double-decker.  
- CTA: See Full Menu  
- Note: Garbage Burger, Plantastic & more on the full list  

### Lifestyle

- Eyebrow: The house  
- H2: Flavour, fire & company  
- Lede: From the grill line to the table — this is how South Boston shows up hungry.  
- **Grill Ritual** — Big flavour and messy bites. Smashing, searing and building every burger to deliver juicy layers, melting cheese and unapologetically good food.  
- **The Main Event** — Our burgers take center stage with juicy smashed patties, golden buns and big flavour in every bite.  
- **Built for Sharing** — The best meals come with noise – good friends, big laughs and burgers worth gathering around.  

### Wings / beer

- Pick a size. Set your heat.  
- Bone-in wings on the print menu scale — drag the bottle, watch the sauces light up.  
- Cold ones ready. / Full drinks list  
- Domestic: Budweiser, Bud Light, Coors Light, Miller Lite, Michelob Ultra  
- Import: Corona, Modelo, Heineken  

### Visit

- Come hungry. Leave happy.  
- Hours: Call for current hours — open when South Boston is hungry.  
- Get Directions · Plan your visit  

### Scratch

- Scratch. Save 10%.  
- Code: **ZUP10**  
- In-house only · Valid on food · Not stackable · Ask server  

### Reserve band

- Tables fill up. Walk-ins still welcome.  
- Large group? Give a heads up and we’ll hold what we can.  

### Footer impact

- Marquee: ORDER NOW · SMASHED FRESH DAILY  
- H2: Hungry? Get here.  
- Sub: Smashed fresh · full bar · right now  
- ORDER NOW  
- BOTTOMZ UP · 2026 Copyright  

### Menu data (source of truth)

Full catalog in `js/menu-data.js` — extracted from official print PDF. Categories include:

- Starters, Salads, **Back Alley Burgers**, Kitchen Creations, Wings (Bone-In + sauces by heat), Kids, Desserts, Sides, Drinks (cocktails, shots, martinis, wine, beer)

**Wing sauces (examples):** BBQ, Garlic Parmesan, Lemon Pepper, Sweet Chili Buffalo, Mango Habanero, Red Hot Buffalo, Xtra Hot, etc. with heat tiers mild / medium / hot / xtra.

**Do not invent menu items or prices** — stay faithful to menu-data / PDF.

### Primary CTAs (strings)

```text
View Full Menu
Browse Full Menu
See Full Menu
Plan your visit
Get Directions
Order now
Copy (scratch)
```

---

## 6. Assets & Placeholders

### Confirmed assets

| Asset | Path |
|--------|------|
| Logo | `assets/images/logo-horizontal.png` |
| Burger photos | `burger-classic/bacon/double/buffalo.jpg` (+ png variants) |
| Float cutouts | `float-classic/bacon/double/buffalo.png` |
| Hero legacy | `hero-burger.jpg` |
| Slides | `slide-1.jpg` … `slide-4.jpg` (lifestyle placeholders) |
| Deco (FreshBox non-food) | `deco-chilis.png`, `deco-tomatoes-chilis.png` |
| FreshBox raw extract | `assets/images/freshbox/*` |
| Fonts | `assets/fonts/lemon-milk-*.woff2` |
| Icons / OG | `assets/icons/*`, `og-share.jpg` |

### Placeholders to replace later

| Use | Current | Replace with |
|-----|---------|----------------|
| Lifestyle tall / grill | `slide-1.jpg` | Real chef/grill process photo |
| Lifestyle customers | `slide-2.jpg` | Guests eating |
| Lifestyle group | `slide-3.jpg` | Friends table shot |
| Social URLs | Root Instagram/TikTok/X/Threads | Real Bottomz handles |
| Phone | Empty in `contact.js` | E.164 + display format |
| Hours | “Call for current hours…” | Real schedule when owner provides |

### Promo

- Code **ZUP10** — 10% off food; storage key `bottomz-scratch-zup10`

### Design extracts (reference only)

- `design-extract-output/` — FreshBox designlang dump + hero snapshots  
- `design-extract-freshbox/` — earlier extract folder  

---

## 7. Built vs Missing

### Built (solid)

| Area | Status |
|------|--------|
| Design tokens + fonts | Done |
| Nav (cream panel, ticket CTA, mobile drawer) | Done |
| Hero FreshBox plate + amber gradient + food conveyor | Done |
| Dish marquee | Done |
| House strip | Done |
| Featured burgers + mobile snap | Done |
| Lifestyle editorial + inview/ken burns/parallax | Done (C+D) |
| Wings sizes + heat bottle + beer | Done |
| Visit + map card | Done |
| Scratch coupon ZUP10 | Done |
| Reserve drawer + honesty for no phone | Done |
| Impact conversion footer | Done (A–D combo) |
| Full menu page + data + filters + heat | Done |
| Sticky CTA | Done |
| Atmosphere mesh / grain | Done |

### Missing / incomplete (priority)

| Priority | Item | Notes |
|----------|------|--------|
| P0 | Real phone number | `js/contact.js` `phone` + `phoneDisplay` |
| P0 | Real business hours | Replace “call for hours” when known |
| P0 | Real lifestyle photography | Swap slide placeholders in `#vibe` |
| P1 | Real social profile URLs | Footer social icons |
| P1 | Impact footer on menu page | Menu still uses older footer |
| P1 | Verify Lemon Milk license for production | |
| P2 | Online ordering (if ever) | Not in scope currently — phone/walk-in only |
| P2 | CMS / backend | Static site only |
| P2 | Real reviews / press | Only if authentic |
| P3 | OG/share image refresh | `og-share.jpg` may need update |
| P3 | Accessibility audit pass | Focus, contrast, mobile hit targets |

### Open product decisions

- Exact “Order now” semantics (menu browse vs future ordering) — currently **menu.html**
- Whether scratch promo is always-on or campaign-limited
- Hours display format when provided

---

## 8. Design Rules / Anti-Slop Guidelines

### Always

1. **Brand fidelity** — Cream / amber / charcoal + Lemon Milk / Poppins only for core UI. Terracotta is allowed for loud conversion/footer/badges, not as a new primary system.
2. **Menu-first conversion** — Appetite and scanability beat decoration.
3. **Local truth** — Real address, real plates, real bar list; SoBo is earned, not overused.
4. **Honest incompleteness** — No fake phone, hours, ratings, or reviews.
5. **Purposeful motion** — Interactions must help choose or act; respect `prefers-reduced-motion`.
6. **Ticket CTAs** — Prefer existing `.btn-ticket` geometry for primary actions (except footer ORDER pill and intentional exceptions).
7. **Mobile hit targets** — Full-card links, full-width buttons where stacked; sticky/footer padding so UI is not covered.
8. **Token-first CSS** — Prefer `var(--color-*)` / tokens over one-off hex (except documented extended accents).

### Never

1. Invent menu items, prices, or alcohol prices (use “Ask” / in-house where PDF is silent).
2. Generic AI restaurant copy: “culinary journey,” “exquisite ambiance,” “taste of heaven,” Lorem, fake testimonials.
3. Soft purple SaaS gradients, glassmorphism-for-its-own-sake, cookie-cutter card grids with no hierarchy.
4. New fonts or a redesigned logo treatment without owner approval.
5. Dead `tel:+1` or fake `tel:` links when phone is empty — use contact.js honesty.
6. Break static architecture (no React rewrite unless explicitly requested).

### Interaction checklist for new sections

- [ ] Works at ~390px and ~1280px  
- [ ] Focus-visible styles  
- [ ] Reduced-motion path  
- [ ] No invented claims  
- [ ] CTAs map to menu / maps / reserve honestly  
- [ ] Uses brand tokens and existing button patterns where possible  

### Key IDs for deep links

```text
#hero #menu-preview #burgers #vibe #drinks #visit #promo #reserve
pages/menu.html#sec-burgers  #sec-wings  (and other menu section ids from menu.js)
```

### Contact config (edit when ready)

```js
// js/contact.js
window.BOTTOMZ_CONTACT = {
  phone: '',           // e.g. '14345551234'
  phoneDisplay: '',    // e.g. '(434) 555-1234'
  mapsUrl: 'https://maps.google.com/?q=2001+Seymour+Dr,+South+Boston,+VA+24592',
  // ...
};
```

---

## Quick start for next AI session

1. Read this file fully.  
2. Read `PRODUCT.md` for product principles.  
3. Read `css/tokens.css` before adding styles.  
4. Prefer editing existing CSS modules over new frameworks.  
5. Preview with `python3 -m http.server 8765`.  
6. Do not claim phone/hours/reviews unless provided by the owner.  

**Brand one-liner:** Bottomz Up is South Boston’s bar & grill — smash burgers, wing heat, full pour, walk-ins welcome — cream, amber, charcoal, Lemon Milk, no template lies.
