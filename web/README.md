# Bottomz Up — Next.js app (`web/`)

Scale-ready App Router project beside the legacy static site at the repo root.

## Stack

- **Next.js 15** (App Router) + React
- **Prisma** + SQLite (local) — switch to Postgres for production
- **NextAuth** credentials (1–2 managers)
- Local image uploads to `public/uploads/events`

## Quick start

```bash
cd web
cp .env.example .env   # or use existing .env
npx prisma migrate dev
npm run seed
npm run dev
```

Open:

| URL | What |
|-----|------|
| http://localhost:3000 | Next home shell |
| http://localhost:3000/events | Events calendar + popup |
| http://localhost:3000/about | About (React port) |
| http://localhost:3000/contact | Contact (React port) |
| http://localhost:3000/menu | Legacy menu (rewrite) |
| http://localhost:3000/catering | Legacy catering (rewrite) |
| http://localhost:3000/admin/login | Manager admin |
| http://localhost:3000/legacy/index.html | Classic static homepage |

Default seed login (change in production):

- Email: `manager@bottomzup.local`
- Password: `BottomzUp2026!`

## Strangler status

- **React / App Router:** home, about, contact, events, admin
- **Legacy HTML via rewrite:** menu, catering (full interactive UI preserved)
- Next step when ready: port menu + catering islands into React client components

## Events UX

- Month calendar with marked event days
- Hover (desktop) / tap (mobile) opens a **popup** with details
- No `/events/[id]` page — optional `?event=id` opens the same popup

## Production notes

1. Set `DATABASE_URL` to Postgres and change `provider` in `prisma/schema.prisma`
2. Set strong `NEXTAUTH_SECRET` and rotate admin password
3. Prefer Vercel Blob for uploads on serverless (local disk uploads work on Node hosts)
4. Port remaining static pages into App Router incrementally (strangler pattern)
