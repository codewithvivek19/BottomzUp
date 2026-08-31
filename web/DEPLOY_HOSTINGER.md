# Deploy Bottomz Up on Hostinger (Node.js Web App)

**Live domain:** `https://www.bottomzupbarandgrill.com`  
**App root:** `web/` (Next.js App Router)

## Why the site looks broken today

As of the last check, `bottomzupbarandgrill.com` DNS does **not** point at Hostinger:

- Nameservers: `ns1–4.domainnamedns.com` (not `dns1.hostinger.com` / `dns2.hostinger.com`)
- Homepage content: unrelated Chinese gambling site (not Bottomz Up)
- `/events` and `/admin` → **404**

Until nameservers / A records point at your Hostinger website, no code push can fix production.

### Fix DNS (required)

In the domain registrar (or Hostinger Domains):

1. Set nameservers to Hostinger’s (shown in hPanel → Domains), **or**
2. Point `A` / `CNAME` for `@` and `www` to the Hostinger website IP Hostinger shows for this site.

Prefer **www** as primary (apex already 301s to www). Keep both working.

## Create / configure the Node.js Web App

hPanel → Websites → **Node.js Apps** (or Web Apps) → Deploy from GitHub.

| Setting | Value |
|---------|--------|
| Application type | **`next`** (not Parcel, not static React) |
| Root directory | **`web`** |
| Branch | `main` |
| Node.js | **20** or **22** (LTS) |
| Build script | `build` |
| Output directory | `.next` |
| Entry file | leave empty (ignored for Next) |

> If Root Directory is `/` (repo root), Hostinger will not find the Next app correctly and you get a broken/static site.

## Environment variables (Hostinger deployment settings)

| Name | Value |
|------|--------|
| `DATABASE_URL` | Supabase pooled Postgres URI |
| `DIRECT_URL` | Supabase direct Postgres URI |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/publishable key |
| `ADMIN_EMAILS` | `Manager@bottomzupbargrill.com` (comma-separated if multiple) |
| `NEXT_PUBLIC_SITE_URL` | `https://bottomzupbargrill.com` |

Build runs `prisma migrate deploy` — `DATABASE_URL` + `DIRECT_URL` must be valid or the deploy fails (better than a blank admin crash).

## Supabase Auth URLs

Authentication → URL configuration:

- Site URL: `https://bottomzupbargrill.com`
- Redirect allow list:
  - `https://bottomzupbargrill.com/**`
  - `https://www.bottomzupbargrill.com/**`
  - `http://localhost:3000/**`

Create the manager user under Authentication → Users with email
`Manager@bottomzupbargrill.com`, then set the same value on Hostinger as
`ADMIN_EMAILS` (case-insensitive match).

## After deploy smoke check

- `https://bottomzupbargrill.com/` → Bottomz Up home
- `https://bottomzupbargrill.com/events` → React calendar
- `https://bottomzupbargrill.com/admin/login` → manager login
- `https://bottomzupbargrill.com/api/events` → JSON `{ "events": [...] }` **without** `"error":"unavailable"`
- `https://bottomzupbargrill.com/menu` → menu

## Asset paths + navigation (important)

1. **Nav links are absolute:** `/menu`, `/about`, `/contact`, `/catering`, `/events`  
   Relative links like `about.html` break when the URL is `/menu` (browser goes to `/about.html` → 404).

2. **CSS/JS:** HTML requests `/css/...` and `/js/...`.  
   **Single source of truth = repo root** (`../index.html`, `../css`, `../js`, `../pages`).  
   `npm run sync:public` (runs on `postinstall` / `prebuild`) copies:
   - repo root → `public/legacy/`
   - then `public/legacy/{css,js,pages}` → `public/{css,js,pages}`  
   Never hand-edit `public/legacy` — it is generated.

If CSS/JS 404 after deploy, check build logs for `[sync-public-assets] done` and Application type **`next`**.

## Common mistakes

1. Deploying as **Parcel** / Vite static instead of **Next**
2. Root directory left as repo root instead of **`web`**
3. Domain still on old/wrong nameservers
4. Missing Supabase env vars on Hostinger
5. Expecting `/css/*.css` without the public symlinks/rewrites above
