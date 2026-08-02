# Design Language: FreshBox — Fast Food & Restaurant Framer Template

> Extracted from `https://freshbox.framer.website` on July 30, 2026
> 1540 elements analyzed

This document describes the complete design language of the website. It is structured for AI/LLM consumption — use it to faithfully recreate the visual design in any framework.

## Color Palette

### Primary Colors

| Role | Hex | RGB | HSL | Usage Count |
|------|-----|-----|-----|-------------|
| Primary | `#5f070d` | rgb(95, 7, 13) | hsl(356, 86%, 20%) | 19 |
| Secondary | `#fc9e25` | rgb(252, 158, 37) | hsl(34, 97%, 57%) | 12 |
| Accent | `#920711` | rgb(146, 7, 17) | hsl(356, 91%, 30%) | 27 |

### Neutral Colors

| Hex | HSL | Usage Count |
|-----|-----|-------------|
| `#000000` | hsl(0, 0%, 0%) | 2272 |
| `#ffffff` | hsl(0, 0%, 100%) | 208 |
| `#e9e9e9` | hsl(0, 0%, 91%) | 154 |
| `#7f675c` | hsl(19, 16%, 43%) | 36 |
| `#fff7e8` | hsl(39, 100%, 95%) | 12 |

### Background Colors

Used on large-area elements: `#fff7e8`, `#920711`, `#ffffff`

### Text Colors

Text color palette: `#000000`, `#0000ee`, `#920711`, `#482820`, `#ffffff`, `#7f675c`, `#e9e9e9`, `#5f070d`

### Gradients

```css
background-image: linear-gradient(rgba(146, 7, 17, 0) 0%, rgb(44, 2, 5) 100%);
```

### Full Color Inventory

| Hex | Contexts | Count |
|-----|----------|-------|
| `#000000` | text, border, background | 2272 |
| `#0000ee` | text, border | 372 |
| `#ffffff` | text, border, background | 208 |
| `#e9e9e9` | text, border | 154 |
| `#482820` | text, border, background | 89 |
| `#7f675c` | text, border | 36 |
| `#920711` | text, border, background | 27 |
| `#5f070d` | background, text, border | 19 |
| `#fff7e8` | background | 12 |
| `#fc9e25` | background | 12 |

## Typography

### Font Families

- **Inter Display** — used for body (163 elements)
- **Tanker** — used for headings (60 elements)
- **Times** — used for body (29 elements)

### Type Scale

| Size (px) | Size (rem) | Weight | Line Height | Letter Spacing | Used On |
|-----------|------------|--------|-------------|----------------|---------|
| 80px | 5rem | 400 | 92px | -2px | h1 |
| 72px | 4.5rem | 400 | 82.8px | -0.936px | h2 |
| 48px | 3rem | 400 | 57.6px | normal | h2 |
| 32px | 2rem | 400 | 38.4px | normal | h3 |
| 24px | 1.5rem | 400 | 28.8px | 0.48px | h4 |
| 20px | 1.25rem | 600 | 34px | normal | p |
| 18px | 1.125rem | 400 | 27px | normal | p |
| 16px | 1rem | 400 | normal | normal | html, head, meta, script |
| 14px | 0.875rem | 400 | 23.8px | normal | p |
| 12px | 0.75rem | 400 | normal | normal | body, script, div, style |

### Heading Scale

```css
h1 { font-size: 80px; font-weight: 400; line-height: 92px; }
h2 { font-size: 72px; font-weight: 400; line-height: 82.8px; }
h2 { font-size: 48px; font-weight: 400; line-height: 57.6px; }
h3 { font-size: 32px; font-weight: 400; line-height: 38.4px; }
h4 { font-size: 24px; font-weight: 400; line-height: 28.8px; }
```

### Body Text

```css
body { font-size: 16px; font-weight: 400; line-height: normal; }
```

### Font Weights in Use

`400` (1518x), `500` (18x), `600` (4x)

## Spacing

**Base unit:** 2px

| Token | Value | Rem |
|-------|-------|-----|
| spacing-1 | 1px | 0.0625rem |
| spacing-30 | 30px | 1.875rem |
| spacing-40 | 40px | 2.5rem |
| spacing-52 | 52px | 3.25rem |
| spacing-60 | 60px | 3.75rem |
| spacing-88 | 88px | 5.5rem |
| spacing-100 | 100px | 6.25rem |
| spacing-120 | 120px | 7.5rem |
| spacing-130 | 130px | 8.125rem |
| spacing-150 | 150px | 9.375rem |
| spacing-416 | 416px | 26rem |
| spacing-436 | 436px | 27.25rem |

## Border Radii

| Label | Value | Count |
|-------|-------|-------|
| md | 10px | 29 |
| lg | 16px | 48 |
| xl | 20px | 111 |
| full | 30px | 1 |
| full | 40px | 27 |
| full | 999px | 26 |

## Box Shadows

**sm (inset)** — blur: 0px
```css
box-shadow: rgb(0, 0, 0) 0px 0px 0px 1px inset;
```

**xs** — blur: 1.56569px
```css
box-shadow: rgba(0, 0, 0, 0.17) 0px 0.602187px 1.56569px -1.5px, rgba(0, 0, 0, 0.14) 0px 2.28853px 5.95019px -3px, rgba(0, 0, 0, 0.02) 0px 10px 26px -4.5px;
```

## CSS Custom Properties

### Other

```css
--one-if-corner-shape-supported: 1;
```

### Semantic

```css
success: [object Object];
warning: [object Object];
error: [object Object];
info: [object Object];
```

## Breakpoints

| Name | Value | Type |
|------|-------|------|
| md | 767px | max-width |
| md | 768px | min-width |
| 1199px | 1199px | max-width |
| 1200px | 1200px | max-width |

## Transitions & Animations

### Common Transitions

```css
transition: all;
```

### Keyframe Animations

**__framer-loading-spin**
```css
@keyframes __framer-loading-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

## Component Patterns

Detected UI component patterns and their most common styles:

### Buttons (6 instances)

```css
.button {
  background-color: rgb(146, 7, 17);
  color: rgb(0, 0, 0);
  font-size: 12px;
  font-weight: 400;
  padding-top: 4px;
  padding-right: 24px;
  border-radius: 40px;
}
```

### Cards (1 instances)

```css
.card {
  background-color: rgb(255, 255, 255);
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.17) 0px 0.602187px 1.56569px -1.5px, rgba(0, 0, 0, 0.14) 0px 2.28853px 5.95019px -3px, rgba(0, 0, 0, 0.02) 0px 10px 26px -4.5px;
  padding-top: 0px;
  padding-right: 0px;
}
```

### Links (38 instances)

```css
.link {
  color: rgb(0, 0, 238);
  font-size: 12px;
  font-weight: 400;
}
```

### Navigation (1 instances)

```css
.navigatio {
  background-color: rgb(255, 247, 232);
  color: rgb(0, 0, 0);
  padding-top: 16px;
  padding-bottom: 16px;
  padding-left: 32px;
  padding-right: 32px;
  position: relative;
}
```

### Footer (1 instances)

```css
.foote {
  color: rgb(0, 0, 0);
  padding-top: 130px;
  padding-bottom: 24px;
  font-size: 12px;
}
```

## Component Clusters

Reusable component instances grouped by DOM structure and style similarity:

### Button — 2 instances, 2 variants

**Variant 1** (1 instance)

```css
  background: rgb(255, 255, 255);
  color: rgb(0, 0, 0);
  padding: 4px 24px 4px 24px;
  border-radius: 40px;
  border: 0px outset rgb(0, 0, 0);
  font-size: 12px;
  font-weight: 400;
```

**Variant 2** (1 instance)

```css
  background: rgb(252, 158, 37);
  color: rgb(0, 0, 0);
  padding: 4px 24px 4px 24px;
  border-radius: 40px;
  border: 0px outset rgb(0, 0, 0);
  font-size: 12px;
  font-weight: 400;
```

### Button — 2 instances, 1 variant

**Variant 1** (2 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(0, 0, 0);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px none rgb(0, 0, 0);
  font-size: 12px;
  font-weight: 400;
```

### Button — 2 instances, 1 variant

**Variant 1** (2 instances)

```css
  background: rgb(146, 7, 17);
  color: rgb(0, 0, 0);
  padding: 12px 40px 12px 40px;
  border-radius: 40px;
  border: 0px outset rgb(0, 0, 0);
  font-size: 12px;
  font-weight: 400;
```

## Layout System

**3 grid containers** and **599 flex containers** detected.

### Container Widths

| Max Width | Padding |
|-----------|---------|
| 1120px | 0px |
| 664px | 0px |
| 696px | 0px |
| 100% | 0px |
| 572px | 24px |
| 600px | 0px |
| 510px | 0px |
| 466px | 0px |

### Grid Column Patterns

| Columns | Usage Count |
|---------|-------------|
| 3-column | 2x |
| 2-column | 1x |

### Grid Templates

```css
grid-template-columns: 550px 550px;
gap: 20px;
grid-template-columns: 362.656px 362.672px 362.656px;
gap: 16px;
grid-template-columns: 357.328px 357.328px 357.344px;
gap: 24px;
```

### Flex Patterns

| Direction/Wrap | Count |
|----------------|-------|
| column/nowrap | 424x |
| row/nowrap | 175x |

**Gap values:** `100px`, `102px`, `10px`, `12px`, `16px`, `19px`, `20px`, `24px`, `32px`, `34px`, `3px`, `40px`, `436px`, `4px`, `52px`, `54px`, `60px`, `64px`, `88px`, `8px`

## Accessibility (WCAG 2.1)

**Overall Score: 100%** — 0 passing, 0 failing color pairs

## Design System Score

**Overall: 89/100 (Grade: B)**

| Category | Score |
|----------|-------|
| Color Discipline | 100/100 |
| Typography Consistency | 80/100 |
| Spacing System | 100/100 |
| Shadow Consistency | 100/100 |
| Border Radius Consistency | 90/100 |
| Accessibility | 100/100 |
| CSS Tokenization | 50/100 |

**Strengths:** Tight, disciplined color palette, Well-defined spacing scale, Clean elevation system, Consistent border radii, Strong accessibility compliance

**Issues:**
- 17 !important rules — prefer specificity over overrides
- 59% of CSS is unused — consider purging
- 3581 duplicate CSS declarations

## Gradients

**1 unique gradients** detected.

| Type | Direction | Stops | Classification |
|------|-----------|-------|----------------|
| linear | — | 2 | brand |

```css
background: linear-gradient(rgba(146, 7, 17, 0) 0%, rgb(44, 2, 5) 100%);
```

## Z-Index Map

**6 unique z-index values** across 3 layers.

| Layer | Range | Elements |
|-------|-------|----------|
| modal | 2147483647,2147483647 | div, iframe.s.t.a.t.u.s._.h.i.d.d.e.n |
| sticky | 10,10 | header.f.r.a.m.e.r.-.1.y.u.6.0.f.u |
| base | 0,4 | div.f.r.a.m.e.r.-.1.a.p.g.8.t.2, div.f.r.a.m.e.r.-.1.t.u.y.p.m.s, div.f.r.a.m.e.r.-.1.o.n.9.u.t.u |

**Issues:**
- [object Object]

## SVG Icons

**5 unique SVG icons** detected. Dominant style: **filled**.

| Size Class | Count |
|------------|-------|
| xs | 2 |
| md | 3 |

**Icon colors:** `rgb(0, 0, 0)`

## Font Files

| Family | Source | Weights | Styles |
|--------|--------|---------|--------|
| Inter | self-hosted | 400, 700 | normal, italic |
| Inter Display | self-hosted | 400, 500, 600, 700 | normal, italic |
| Tanker | self-hosted | 400 | normal |

## Image Style Patterns

| Pattern | Count | Key Styles |
|---------|-------|------------|
| thumbnail | 54 | objectFit: contain, borderRadius: 0px, shape: square |
| general | 31 | objectFit: cover, borderRadius: 0px, shape: square |
| hero | 10 | objectFit: cover, borderRadius: 0px, shape: square |
| gallery | 2 | objectFit: cover, borderRadius: 0px, shape: square |

**Aspect ratios:** 1:1 (33x), 4:3 (12x), 3:2 (7x), 3:4 (7x), 9:16 (6x), 16:9 (3x), 2:3 (2x), 0.08:1 (2x)

## Motion Language

**Feel:** mixed · **Scroll-linked:** yes

## Component Anatomy

### button — 6 instances

**Slots:** label

## Brand Voice

**Tone:** friendly · **Pronoun:** we→you · **Headings:** Title Case (tight)

### Top CTA Verbs

- **special** (2)
- **read** (2)

### Button Copy Patterns

- "special discount" (2×)
- "read article

book your table" (2×)

### Sample Headings

> Crafted for Cravings Served with Perfection
> Explore Our Popular Dishes
> Delicious Deals You Can’t Miss
> Freshly Prepared Served at Its Best
> Stone-Baked Melty & Flavorful
> Signature Beef Burgers Rich. Juicy. Satisfying.
> Discover Flavors You’ll Love
> Exceptional Experience with premium quality, rich flavors
> 0K
> 0K

## Page Intent

**Type:** `landing` (confidence 0.29)
**Description:** FreshBox is a modern Framer template made for grocery stores, organic shops, food delivery, supermarkets, fresh produce markets, and healthy food brands.

Alternates: legal (0.4), blog-post (0.35)

## Section Roles

Reading order (top→bottom): nav → nav → content → content → testimonial → testimonial → testimonial → content → content → testimonial → testimonial → faq → gallery → hero → faq → content → footer

| # | Role | Heading | Confidence |
|---|------|---------|------------|
| 0 | nav | — | 0.4 |
| 1 | nav | — | 0.9 |
| 2 | content | Crafted for Cravings Served with Perfection | 0.3 |
| 3 | content | Explore Our Popular Dishes | 0.3 |
| 4 | testimonial | Delicious Deals You Can’t Miss | 0.8 |
| 5 | testimonial | Discover Flavors You’ll Love | 0.8 |
| 6 | testimonial | Exceptional Experience with premium quality, rich flavors | 0.8 |
| 7 | content | Loved by Food Lovers | 0.3 |
| 8 | content | Catering for Every Celebration | 0.3 |
| 9 | testimonial | — | 0.8 |
| 10 | testimonial | — | 0.8 |
| 11 | faq | Frequently Asked Questions | 0.85 |
| 12 | gallery | A Feast for Your Eyes | 0.7 |
| 13 | hero | Insights, Trends & Food Stories | 0.4 |
| 14 | faq | Hungry? We’re Ready Come and Enjoy | 0.85 |
| 15 | content | Hungry? We’re Ready Come and Enjoy | 0.3 |
| 16 | footer | — | 0.95 |

## Material Language

**Label:** `material-you` (confidence 0.45)

| Metric | Value |
|--------|-------|
| Avg saturation | 0.465 |
| Shadow profile | soft |
| Avg shadow blur | 0px |
| Max radius | 999px |
| backdrop-filter in use | no |
| Gradients | 1 |

## Imagery Style

**Label:** `mixed` (confidence 0)
**Counts:** total 97, svg 0, icon 9, screenshot-like 0, photo-like 0
**Dominant aspect:** square-ish
**Radius profile on images:** soft

## Component Library

**Detected:** `vuetify` (confidence 0.48)

Evidence:
- 9 v-* classes

## Quick Start

To recreate this design in a new project:

1. **Install fonts:** Add `Inter Display` from Google Fonts or your font provider
2. **Import CSS variables:** Copy `variables.css` into your project
3. **Tailwind users:** Use the generated `tailwind.config.js` to extend your theme
4. **Design tokens:** Import `design-tokens.json` for tooling integration
