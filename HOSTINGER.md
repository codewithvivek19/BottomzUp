# Hostinger production — bottomzupbargrill.com

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
