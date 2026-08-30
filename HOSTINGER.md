# Hostinger deployment (bottomzupbarandgrill.com)

This repo is a **monorepo**. The Next.js app that must run in production is:

```text
web/
```

## Required hPanel Node.js Web App settings

| Field | Value |
|-------|--------|
| Application type | **next** (do **not** choose Parcel) |
| Root directory | **web** |
| Build script | `build` |
| Output directory | `.next` |
| Node.js | 20 or 22 |

Full guide: [`web/DEPLOY_HOSTINGER.md`](web/DEPLOY_HOSTINGER.md)

## Critical: DNS

`bottomzupbarandgrill.com` must use **Hostinger nameservers** (or A/CNAME records Hostinger provides for this website).

If nameservers still show `domainnamedns.com` (or any non-Hostinger DNS), the domain will **not** serve this app — it can even show an unrelated site.
