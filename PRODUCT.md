# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

static HTML/CSS/JS (existing codebase). Pages: `index.html`, `pages/menu.html`. Shared tokens in `css/tokens.css`. Local preview via simple static server. No framework.

## Users

**Primary:** A mix of South Boston (SoBo) locals and first-time visitors, with locals slightly primary.

- **Locals:** Already know the area; open the site to check the menu, heat up appetite, confirm location, or decide to call/head over tonight.
- **First-timers / visitors:** Deciding where to eat in South Boston; need a clear read of the place (burgers, wings, full bar), address, and confidence to walk in or call.

**Secondary:** Groups planning a night out — need shareable menu, party-size awareness, and an easy call path.

**Job in the moment:** Decide whether Bottomz Up is the right place tonight, get hungry from the real menu, then act (show up, call, or get directions).

## Product Purpose

Official marketing + conversion website for **Bottomz Up Bar & Grill** (2001 Seymour Dr, South Boston, VA 24592).

The site exists to:

1. Present the real house menu (food + full bar) in a scannable, premium way.
2. Build appetite and local trust without generic restaurant clichés.
3. Convert interest into a visit: open menu → call/reserve or get directions.

**Success:** Visitor browses the full menu (primary path), then either calls to reserve, gets directions, or walks in with confidence. No single dead-end CTA — menu-first, then call and location.

## Positioning

A South Boston bar & grill with irreverent house naming and a full plate + full bar — not a polished chain or a template “American restaurant.”

**Differentiating truths a neighbor cannot copy:**

- Real menu identity: Back Alley Burgers, Garbage Burger, Plantastic, 10 tossed wing sauces mild→Xtra Hot, signature cocktail “Bottomz Up,” Trash Can, etc.
- Official print-menu brand system: cream `#F5E8B7`, amber `#E7931E` / `#F19F0F`, charcoal `#2E2C2C`.
- Location and name: Bottomz Up on Seymour Drive, South Boston, VA.

## Operating Context

- **Physical business:** Bar & Grill; walk-ins welcome; large groups should call ahead.
- **Digital surfaces:** Homepage (marketing + teaser) and full interactive menu night experience (filter, search, wing heat bottle, drinks collapsible).
- **Conversion rituals:** “Call to Reserve” panel (party size chips, SMS draft, hours note); sticky CTA after hero; floating chip on menu page; Get Directions to Google Maps.
- **Assets in repo:** BTUP horizontal logo, burger photos, Lemon Milk local fonts, full menu data from official A3 PDF extraction (`js/menu-data.js`).
- **Undecided / not yet real:** Business phone number (`tel:+1` / `sms:+1` placeholders), public hours (copy says call for hours).

## Capabilities and Constraints

**Capabilities (shipped or in progress):**

- Static multi-page site with brand tokens, atmosphere mesh/grain, Freshbox-inspired nav + ticket CTAs.
- Full menu: Starters, Salads, Burgers, Kitchen, Wings, Kids, Desserts, Sides, Drinks (cocktails, shots, martinis, wine, beer).
- Interactive wing heat bottle (mild / medium / hot / xtra) with live sauce filtering; deep-link `?heat=`.
- Reserve drawer with party size and call/SMS hooks.
- Tonight’s pick rotation on home/menu (product feature; may be refined).

**Constraints:**

- No backend, no online ordering, no real-time reservation system — phone/SMS is the reserve path.
- Alcohol prices are not printed on the source menu; UI uses “Ask” / in-house pricing.
- Lemon Milk free build is personal-use; commercial deploy should use a licensed cut.
- Prefer purposeful motion; respect `prefers-reduced-motion`.

**Terminology:** Bottomz Up (brand spelling); Back Alley Burgers; Bone-In wings; “Tossed in sauce”; SoBo as optional local shorthand.

## Brand Commitments

Binding identity for all future work:

| Token | Value |
|--------|--------|
| Name | Bottomz Up Bar & Grill |
| Location | 2001 Seymour Dr, South Boston, VA 24592 |
| Cream | `#F5E8B7` (and related cream hierarchy) |
| Amber | `#E7931E`, bright `#F19F0F` |
| Charcoal | `#2E2C2C` |
| Display type | Lemon Milk |
| Body / UI type | Poppins |
| Voice | Warm, bold, appetizing, premium-casual dive-bar polish — never generic “AI restaurant” copy |
| Visual references in project | Freshbox-style nav geometry + ticket buttons mapped to Bottomz colors; menu PDF personality |

Do not invent a new palette, type pairing, or brand name.

## Evidence on Hand

| Asset | Path / note |
|--------|-------------|
| Logo | `assets/images/logo-horizontal.png` |
| Burger photos | `assets/images/burger-*.jpg`, `hero-burger.jpg` |
| Fonts | `assets/fonts/lemon-milk-*.woff2` |
| Full menu data | `js/menu-data.js` (from official 2-page A3 PDF extraction) |
| Favicon / OG | `assets/icons/`, `assets/images/og-share.jpg` |
| Address | Confirmed in site copy and logo blob on print menu |

**Must not fabricate:** star ratings, review quotes, awards, “#1 in town” claims, customer names, real phone number, or hours until the owner provides them. Menu items and prices should stay faithful to the PDF extraction (typos may be lightly cleaned for readability, not invented).

## Product Principles

1. **Menu-first conversion** — Appetite and scanability beat decorative chrome; primary path is the full menu.
2. **Local truth over template polish** — SoBo location, real plates, real bar list; no fake social proof.
3. **Brand fidelity** — Cream / amber / charcoal + Lemon Milk / Poppins are non-negotiable.
4. **Purposeful interaction** — Heat bottle, filters, and CTAs earn their place by helping someone choose and act.
5. **Honest incompleteness** — Missing phone/hours stay clearly “call for…” rather than invented details.

## Accessibility & Inclusion

- Target WCAG-minded defaults: focus-visible rings, keyboard heat control, `prefers-reduced-motion` respected.
- Consumer advisory for undercooked items remains visible near the menu (legal/disclaimer copy from print menu).
- No product-specific assistive requirement beyond general web accessibility was established; improve rather than regress contrast and hit targets (esp. nav and CTAs).
