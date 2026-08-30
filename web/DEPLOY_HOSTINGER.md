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
| `ADMIN_EMAILS` | Manager email(s), comma-separated |
| `NEXT_PUBLIC_SITE_URL` | `https://www.bottomzupbarandgrill.com` |

## Supabase Auth URLs

Authentication → URL configuration:

- Site URL: `https://www.bottomzupbarandgrill.com`
- Redirect allow list:
  - `https://www.bottomzupbarandgrill.com/**`
  - `https://bottomzupbarandgrill.com/**`
  - `http://localhost:3000/**`

Create the manager user under Authentication → Users, then match `ADMIN_EMAILS`.

## After deploy smoke check

- `https://www.bottomzupbarandgrill.com/` → Bottomz Up home
- `https://www.bottomzupbarandgrill.com/events` → React calendar
- `https://www.bottomzupbarandgrill.com/admin/login` → manager login
- `https://www.bottomzupbarandgrill.com/menu` → menu

## Common mistakes

1. Deploying as **Parcel** / Vite static instead of **Next**
2. Root directory left as repo root instead of **`web`**
3. Domain still on old/wrong nameservers (current breakage)
4. Missing Supabase env vars on Hostinger
