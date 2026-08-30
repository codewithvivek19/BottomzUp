# Deploy Bottomz Up (`web/`) on Vercel + Supabase Auth

## Project settings

1. Import the GitHub repo in Vercel.
2. Set **Root Directory** to `web`.
3. Framework: **Next.js**.

## Environment variables

| Name | Value |
|------|--------|
| `DATABASE_URL` | Supabase pooled Postgres URI |
| `DIRECT_URL` | Supabase direct Postgres URI |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public key |
| `ADMIN_EMAILS` | Manager email(s), comma-separated |

## Create the manager user (Supabase Auth)

1. Supabase Dashboard → **Authentication** → **Users** → **Add user**
2. Email + password (confirm email if your project requires it)
3. Optional but recommended: set **App Metadata**:
   ```json
   { "role": "manager" }
   ```
4. Put the same email in `ADMIN_EMAILS` on Vercel and local `.env`

Site URL / redirect allow list in Supabase Auth settings should include:

- `http://localhost:3000`
- `https://YOUR_VERCEL_DOMAIN`
- your custom domain

## Smoke check

- `/events` — public calendar (no login)
- `/admin/login` — Supabase email/password
- `/admin` — dashboard after sign-in
- Sign out returns to `/admin/login`
