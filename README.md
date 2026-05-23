# Bluven Energy — Website

Full-stack website for Bluven Energy — Australian solar, battery and EV charging.

```
bluven/
├── frontend/                Next.js 14 (App Router) · TypeScript · React 18
├── cms/                     Payload CMS 2 backend · Express · PostgreSQL
├── uploads/                 Payload-managed media (gitignored in prod, S3-mounted)
├── legacy/                  Original static HTML — for reference only
└── frontend-vite-archive/   Previous Vite SPA — for reference only
```

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
                │  Resend  (email)                │
                │  Gemini  (AI chat)              │
                └─────────────────────────────────┘
```

## Quick start (development)

You need **PostgreSQL** running locally (or a managed service like Neon / Supabase / Railway).

```bash
# 1. CMS backend (Terminal 1)
cd cms
cp .env.example .env       # fill DATABASE_URL, PAYLOAD_SECRET, RESEND_API_KEY
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

## Deployment

Recommended: **2-service deploy**

| Service | Platform | What it serves |
|---------|----------|----------------|
| Frontend | **Vercel** (or Railway) | bluven.com.au — Next.js, auto SSL, edge CDN |
| CMS backend | **Railway** | cms.bluven.com.au — Payload + Postgres |

Set in frontend env:
- `NEXT_PUBLIC_SITE_URL=https://bluven.com.au`
- `CMS_URL=https://cms.bluven.com.au`        (server-side fetches)
- `NEXT_PUBLIC_CMS_URL=https://cms.bluven.com.au`  (client-side fetches)

Set in CMS env:
- `FRONTEND_URL=https://bluven.com.au`       (CORS allow-list)
- `DATABASE_URL=postgres://...?sslmode=require`

## Routes

| Route | Type | Data source |
|-------|------|-------------|
| `/` | Static + ISR (60s) | Featured projects/news from CMS |
| `/products` | Static | Hardcoded 4 packs |
| `/projects` | ISR | CMS · filter by system type |
| `/projects/[slug]` | SSG | CMS · pre-built for all projects |
| `/brands` | ISR | CMS · grouped by category |
| `/who-we-are` | ISR | Static + Team from CMS |
| `/news` | ISR | CMS · filter by category |
| `/news/[slug]` | SSG | CMS · with article JSON-LD |
| `/faq` | ISR | CMS · with FAQPage JSON-LD |
| `/contact` | ISR | Site Settings from CMS |
| `/quote` | Client | 5-step wizard, submits to CMS |
| `/privacy` `/terms` `/cookies` | Static | Bilingual legal pages |

## What the client manages from `/admin`

| Section | What they edit |
|---------|----------------|
| News | Industry articles, with Lexical rich-text editor |
| Projects | Installation case studies + photo galleries |
| FAQ | Questions + answers, EN + ZH, drag to reorder |
| Brands | Brand logos and categorization |
| Team | Who We Are page members |
| Quotes | View incoming leads (read-only inbox) |
| Testimonials | Approve customer reviews before they appear |
| Site Settings | Phone, email, social links, announcement bar |

## Tech stack

- **Frontend**: Next.js 14, App Router, TypeScript, React 18, TanStack Query, Framer Motion
- **CMS**: Payload 2.32, Express, PostgreSQL (`@payloadcms/db-postgres` 0.8.10)
- **Editor**: Lexical richtext
- **Email**: Resend
- **AI**: Gemini 2.0 Flash via backend proxy (API key never exposed)
- **i18n**: Custom React Context (EN / ZH)
- **Styling**: CSS variables design system (preserved from legacy site)
