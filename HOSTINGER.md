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

## Env vars

See `web/.env.example`. Minimum:

| Name | Example |
|------|---------|
| `DATABASE_URL` | Supabase **Transaction** pooler URI (`…pooler.supabase.com:6543/postgres?pgbouncer=true`) |
| `DIRECT_URL` | Supabase **Session** pooler URI (`…pooler.supabase.com:5432/postgres`) — avoid `db.*.supabase.co` on Hostinger (IPv6-only) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon/publishable key |
| `ADMIN_EMAILS` | `Manager@bottomzupbargrill.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://bottomzupbargrill.com` |

### Critical Hostinger facts

1. **hPanel → Database → Connect → Supabase** only injects `SUPABASE_URL` + `SUPABASE_ANON_KEY` (Auth). It does **not** configure Prisma’s `DATABASE_URL` / `DIRECT_URL`. You must paste those yourself.
2. Paste the **raw URI only** — no wrapping quotes, no `DATABASE_URL=` prefix. Password special chars must be URL-encoded (`#` → `%23`). Easiest: copy the two URLs from a working `web/.env`.
3. **IPv4 vs IPv6:** Direct `db.*.supabase.co` is IPv6-only; Hostinger is typically IPv4. Use the **shared pooler** host. If `/api/health` shows `databaseTcp: "open"` and still fails, it is **not** an IP-version block — on the pooler Prisma often reports a **wrong password** as “Can’t reach database server”.
4. **`DATABASE_URL` must include `?pgbouncer=true`** when using port **6543** (transaction pooler). Without it Prisma prepared statements fail. The app now auto-appends this flag if missing.
5. If you **reset the Supabase DB password**, update **both** Hostinger env **and** local `web/.env` — otherwise local “stops working” while production uses the new password.
6. Smoke test: `https://bottomzupbargrill.com/api/health` must return `"ok": true` and a numeric `eventCount`. If `/api/events` returns `"error":"unavailable"`, Postgres is still wrong.
