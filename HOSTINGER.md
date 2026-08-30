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

`web/public/legacy/` and `web/public/{css,js,pages}` are **generated copies**.  
They are overwritten by `npm run sync:public` on every `predev` / `prebuild` / `postinstall`.  
**Do not hand-edit them.**

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
2. Commit + push `main`.
3. Let Hostinger rebuild (auto or manual Redeploy).
4. Hard-refresh the phone (cache can keep old CSS for a few minutes).

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

See `web/.env.example`. Minimum: Supabase URL/key, `DATABASE_URL`, `DIRECT_URL`, `ADMIN_EMAILS`.
