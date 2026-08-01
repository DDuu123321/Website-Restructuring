# Bluven Energy — Website

Full-stack website for Bluven Energy — Australian solar, battery and EV charging.

```
bluven/
├── frontend/                Next.js 14 (App Router) · TypeScript · React 18
├── cms/                     Payload CMS 2 backend · Express · PostgreSQL
└── uploads/                 Payload media in local dev (production uses Cloudflare R2)
```

(The original static HTML site was removed from HEAD — recover it with
`git checkout legacy-archive-2026-07-27 -- legacy/` if ever needed.)

## Architecture

```
                ┌─────────────────────────────────┐
                │  Next.js 14 frontend            │
                │  - SSG / ISR for SEO            │
                │  - Server Components for data   │
                │  - sitemap.xml · robots.txt     │
                │  - JSON-LD · OG images          │
                └────────────────┬────────────────┘
                                 │  fetch /api/*
                                 ▼
                ┌─────────────────────────────────┐
                │  Payload CMS  (Express)         │
                │  /admin   ← client edits here   │
                │  /api/*   ← REST API            │
                │  /api/chat ← Gemini AI proxy    │
                └────────────────┬────────────────┘
                                 │
                ┌────────────────┴────────────────┐
                │  PostgreSQL  (data)             │
                │  Zoho SMTP  (email)             │
                │  Gemini  (AI chat)              │
                └─────────────────────────────────┘
```

## Quick start (development)

You need **PostgreSQL** running locally (or a managed service like Neon / Supabase / Railway).

```bash
# 1. CMS backend (Terminal 1)
cd cms
cp .env.example .env       # fill DATABASE_URL, PAYLOAD_SECRET, SMTP_* (Zoho)
npm install
npm run dev                # → http://localhost:3001/admin

# 2. Next.js frontend (Terminal 2)
cd frontend
cp .env.example .env       # CMS_URL=http://localhost:3001
npm install
npm run dev                # → http://localhost:3000
```

First time: visit http://localhost:3001/admin and create your admin user.

## SEO infrastructure (built-in)

- ✅ **Per-page metadata** via `generateMetadata` — title, description, OG, Twitter cards
- ✅ **`/sitemap.xml`** — auto-generated, includes all CMS articles & projects
- ✅ **`/robots.txt`** — links to sitemap, blocks `/admin/` and `/api/`
- ✅ **`/manifest.webmanifest`** — PWA-ready
- ✅ **JSON-LD structured data**:
  - LocalBusiness on every page (homepage)
  - Article on each news article (rich snippets in Google)
  - CreativeWork on each project
  - FAQPage on /faq (rich Q&A snippets in Google)
  - BreadcrumbList everywhere
- ✅ **Dynamic OG images** for /, /news/[slug] (generated at request time)
- ✅ **Most pages SSG'd** — pre-rendered to static HTML at build time
- ✅ **ISR** — pages revalidate every 60s when CMS data changes

## Production build

```bash
cd frontend && npm run build && npm start         # Next.js on :3000
cd cms      && npm run build && npm start         # Payload + Express on :3001
```

## Deployment (production)

| Service | Platform | What it serves |
|---------|----------|----------------|
| Frontend | **Netlify** | www.bluven.com.au (bare domain 301s to www) — Next.js via @netlify/plugin-nextjs |
| CMS backend | **Railway** | Payload + Express on the Railway-issued domain; media on Cloudflare R2 |

Schema changes reach production ONLY through migrations — Railway runs
`npm run migrate:prod` as its pre-deploy command (see cms/railway.json).

Set in frontend env (Netlify):
- `NEXT_PUBLIC_SITE_URL=https://www.bluven.com.au`
- `CMS_URL=<railway CMS origin>`             (server-side fetches)
- `NEXT_PUBLIC_CMS_URL=<railway CMS origin>` (client-side fetches)

Set in CMS env (Railway):
- `FRONTEND_URL=https://www.bluven.com.au`   (CORS allow-list)
- `DATABASE_URL=postgres://...?sslmode=require`

## Routes

| Route | Type | Data source |
|-------|------|-------------|
| `/` | Static + ISR (60s) | Featured projects/news from CMS |
| `/products` | Static | Hardcoded 4 packs |
| `/projects` | ISR | CMS · filter by system type |
| `/projects/[slug]` | SSG | CMS · pre-built for all projects |
| `/who-we-are` | Static | Hardcoded (no team collection) |
| `/news` | ISR | CMS · filter by category, Load More pagination |
| `/news/[slug]` | SSG | CMS · with article JSON-LD |
| `/faq` | ISR | CMS · with FAQPage JSON-LD |
| `/contact` | ISR | Site Settings from CMS |
| `/quote` | Client | Single-page contact form, submits to CMS |
| `/privacy` `/terms` `/cookies` | Static | Legal pages |

## What the client manages from `/admin`

| Section | What they edit |
|---------|----------------|
| News | Articles — Lexical rich text, AI-article import, Page Builder blocks |
| Projects | Installation case studies + photo galleries |
| FAQ | Questions + answers, drag to reorder |
| Quotes | Incoming quote leads (status workflow, CSV export/import) |
| Assessments | Free Assessment quiz leads |
| Subscribers | Newsletter signups (CSV export for mail-outs) |
| Site Settings | Phone, email, notification toggles |

## Tech stack

- **Frontend**: Next.js 14, App Router, TypeScript, React 18, TanStack Query
- **CMS**: Payload 2.32, Express, PostgreSQL (`@payloadcms/db-postgres` 0.8.10)
- **Editor**: Lexical richtext
- **Email**: Zoho SMTP via Nodemailer
- **AI**: Gemini 2.0 Flash via backend proxy (API key never exposed)
- **i18n**: Custom React Context (English-only; bilingual scaffolding retained but hidden)
- **Styling**: CSS variables design system (preserved from legacy site)
