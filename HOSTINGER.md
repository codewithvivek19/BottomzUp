# Hostinger production — bottomzupbargrill.com

## One site. One source of truth.

There is **no separate “local design” vs “production design”.**

| What to edit (ONLY these) | What Hostinger actually serves |
|---------------------------|--------------------------------|
| Repo root `index.html` | `/` → `web/public/legacy/index.html` |
| Repo root `css/` | `/css/*` (copied from root on every build) |
| Repo root `js/` | `/js/*` |
| Repo root `pages/` | `/menu`, `/about`, `/contact`, `/catering` |
| Repo root `assets/` | `/assets/*` |

`web/public/{css,js,pages}` are generated on every sync.  
`web/public/legacy/` is a **committed deploy fallback** (Hostinger Root Directory=`web` often cannot see `../css`).  
When repo-root `css/` exists locally, `npm run sync:public` refreshes legacy from the monorepo parent.  
**Do not hand-edit legacy for long** — edit repo-root sources, then sync.

Flow:

```
repo root (edit here)
    ↓  sync-public-assets.mjs
web/public/legacy/   +   web/public/css|js|pages
    ↓  Hostinger build (app root = web/)
bottomzupbargrill.com
```

Local `npm run dev` in `web/` uses the **same** files production uses.

## Deploy settings (hPanel → Node.js Web App)

| Field | Required value |
|-------|----------------|
| Application type | **`next`** (never Parcel) |
| Root directory | **`web`** |
| Branch | `main` |
| Node.js | **20** or **22** |
| Build script | `build` |
| Output directory | `.next` |

Full checklist: [`web/DEPLOY_HOSTINGER.md`](web/DEPLOY_HOSTINGER.md)

## After every client change

1. Edit **repo root** files only (`index.html`, `css/`, `js/`, `pages/`).
2. If you changed CSS/JS, bump the `?v=` query on those `<link>` / `<script>` tags in the HTML (so hCDN cannot keep serving yesterday’s file).
3. Commit + push `main`.
4. Let Hostinger rebuild (auto or manual Redeploy).
5. Hard-refresh the phone once after deploy finishes.

### Why designs used to “roll back” after ~5 minutes

Hostinger’s CDN (`hCDN`) was caching `/css/*.css` while HTML updated sooner.  
Browsers then mixed **new HTML + old CSS** (or the reverse) — it looked like the dock/hero reverted.  

Mitigations now in place:
- `web/public/legacy/` is **generated only** (not a second editable copy in git)
- `Cache-Control: max-age=0, must-revalidate` on `/css` and `/js`
- HTML cache-bust `?v=30` on stylesheets/scripts

## Routes that must work after deploy

| URL | Serves |
|-----|--------|
| `/` | Home |
| `/menu` | Menu |
| `/about` | About |
| `/contact` | Contact |
| `/catering` | Catering |
| `/events` | React events calendar |
| `/admin/login` | Manager login (Supabase Auth) |
| `/css/base.css` | Styles |
| `/js/main.js` | Scripts |

Nav links are absolute (`/menu`, `/about`, …) so they work from every page.

## Env vars + database (Hostinger-supported path)

**App data now uses Supabase HTTPS** (`@supabase/supabase-js` → PostgREST), which is what Hostinger’s **Database → Connect → Supabase** wizard is built for. It sets:

| Hostinger injects | Also accepted |
|-------------------|---------------|
| `SUPABASE_URL` | `NEXT_PUBLIC_SUPABASE_URL` |
| `SUPABASE_API_KEY` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `PUBLISHABLE_KEY` |

Also set:

| Name | Example |
|------|---------|
| `ADMIN_EMAILS` | `Manager@bottomzupbargrill.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://bottomzupbargrill.com` |

`DATABASE_URL` / `DIRECT_URL` (Prisma TCP) are **optional** on Hostinger now — kept for local migrate/seed only.

### One-time Supabase SQL (required for HTTPS data)

Prisma created tables `"Event"`, `"CouponSetting"`, `"Lead"`. The anon key needs grants/RLS policies:

1. Open Supabase → **SQL Editor**
2. Run `web/supabase/hostinger-grants.sql`
3. Redeploy Hostinger

### Connect wizard checklist (matches Hostinger docs)

1. `@supabase/supabase-js` is already in `web/package.json` (^2.112)
2. `web/db.js` exists for Hostinger’s sample connection test
3. Push → Hostinger redeploys → wizard env vars apply
4. Smoke test: `/api/health` → `"ok": true`, `"dataPath": "supabase_https"`
