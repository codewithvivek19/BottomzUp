# Deploy Bottomz Up (`web/`) on Vercel

## Project settings

1. Import the GitHub repo in Vercel.
2. Set **Root Directory** to `web` (critical — the Next app lives here, not the repo root).
3. Framework preset: **Next.js**.

If Root Directory is wrong, Vercel may serve static HTML and `/events` / `/admin` will break.

## Environment variables (Production + Preview)

| Name | Value |
|------|--------|
| `DATABASE_URL` | Supabase pooled Postgres URI |
| `DIRECT_URL` | Supabase direct Postgres URI |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://YOUR_LIVE_DOMAIN` (**never** `http://localhost:3000`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | only needed for seeding, not runtime |

Optional: omit `NEXTAUTH_URL` on Vercel — the app falls back to `https://$VERCEL_URL`.

## After first deploy

```bash
cd web
# with production DATABASE_URL in env:
npx prisma migrate deploy
npm run seed
```

## Smoke check

- `https://YOUR_DOMAIN/events` — React calendar
- `https://YOUR_DOMAIN/admin/login` — manager sign-in
- `https://YOUR_DOMAIN/admin` — redirects to login when signed out
