# Bluven Energy — CMS Backend

Payload CMS 2.x backend serving the Bluven Energy website. Powers all
content (news, projects, FAQ, brands, team) and captures all leads
(quotes, free assessments, testimonials). The Next.js frontend in
`../frontend` talks to this server over REST.

## Stack

| Layer | Choice |
|---|---|
| CMS | Payload 2.32 (REST + GraphQL + Admin UI) |
| Database | PostgreSQL 16 (via `@payloadcms/db-postgres`) |
| Admin bundler | Webpack (`@payloadcms/bundler-webpack`) |
| Email | Resend (transactional) |
| AI chat proxy | Google Gemini |
| Runtime | Node 20 · TypeScript · ts-node + nodemon in dev |

---

## Local development — first-time setup

The CMS needs a running Postgres instance. Easiest path: Docker.

### 1. Start a local Postgres in Docker

```powershell
docker run -d --name bluven-pg -p 5432:5432 `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=bluven `
  -v bluven-pg-data:/var/lib/postgresql/data `
  postgres:16
```

- Container name: `bluven-pg`
- Persistent data: docker volume `bluven-pg-data` (survives container delete)
- Already exists? `docker start bluven-pg`

Verify it's accepting connections:
```powershell
docker exec bluven-pg pg_isready -U postgres
```

### 2. Create `.env` from the template

```powershell
Copy-Item .env.example .env
```

Then edit `.env` and set the **required** values:

| Var | Required? | Notes |
|---|---|---|
| `SERVER_URL` | ✓ | `http://localhost:3001` in dev |
| `PORT` | ✓ | `3001` |
| `PAYLOAD_SECRET` | ✓ | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `DATABASE_URL` | ✓ | `postgres://postgres:postgres@localhost:5432/bluven` for the Docker container above |
| `RESEND_API_KEY` | optional in dev | Lead-capture emails won't send without it, but the server still runs (hook is lazy-init and logs the error). Get a free key at resend.com. |
| `EMAIL_FROM` | optional | Sender address (must be on a Resend-verified domain) |
| `NOTIFY_EMAIL` | optional | Where business notifications go (defaults to `info@bluven.com.au`) |
| `GEMINI_API_KEY` | optional | Only needed for the AI chat proxy |
| `NEXT_PUBLIC_SITE_URL` | optional | Used in sitemap / OG tags |

> ⚠️ `.env` is gitignored (see repo `.gitignore`). Never commit real secrets.

### 3. Install + run

```powershell
npm install
npm run dev
```

On first boot Payload introspects the schema, builds the admin UI with
webpack (~30s), and starts on **http://localhost:3001**.

| URL | What |
|---|---|
| http://localhost:3001/admin | Payload admin panel |
| http://localhost:3001/api | REST API root |
| http://localhost:3001/api/chat | AI chat proxy |

### 4. Create the first admin user

Visit `/admin` — Payload's "Welcome" page asks you to create the first
user. Pick Role = **admin**. After that, login at `/admin` with that
email + password.

---

## Collections & Globals

| Collection | Slug | Group | Purpose |
|---|---|---|---|
| Quotes | `quotes` | 📥 Leads | `/quote` form submissions |
| Assessments | `assessments` | 📥 Leads | Free Assessment quiz submissions (contact + 8 answers + computed result) |
| Testimonials | `testimonials` | 📥 Leads | Customer reviews (public submit, admin-only approval) |
| News | `news` | 📰 Content | Industry articles |
| Projects | `projects` | 📰 Content | Installation case studies |
| FAQ | `faq` | 📰 Content | Frequently asked questions |
| Brands | `brands` | 📰 Content | Partner brand logos |
| Team | `team` | 📰 Content | Team members |
| Users | `users` | 🛠 System | Admin accounts |
| Media | `media` | 🛠 System | Image library |

Globals: **Site Settings** (`/admin/globals/site-settings`) — phone,
email, address, social URLs.

---

## REST API reference

All read endpoints are public; collection access rules in code govern
write access. Lead collections accept anonymous POSTs but require auth
to read/update/delete.

```
GET  /api/news[?where[category][equals]=policy]
GET  /api/projects
GET  /api/faq?where[published][equals]=true
GET  /api/brands
GET  /api/team
GET  /api/globals/site-settings
POST /api/quotes            Public — /quote form submission
POST /api/assessments       Public — Free Assessment quiz submission
POST /api/testimonials      Public — review (pending approval)
POST /api/chat              AI chat proxy (Gemini)
```

Both `POST /api/quotes` and `POST /api/assessments` trigger an
`afterChange` hook that sends two Resend emails: business notification
(to `NOTIFY_EMAIL`) and customer confirmation/report (to the submitted
email). Hooks live in `src/hooks/`.

---

## Frontend integration

The Next.js app in `../frontend` uses `src/api/client.ts`, which in dev
proxies `/api/*` to this server. Server-side calls go direct to
`CMS_URL`; client-side calls go through Next.js rewrites to `/api`.

---

## Troubleshooting

### `Cannot use GraphQLScalarType "EmailAddress" from another module`

Two `graphql` versions in `node_modules`. `cms/package.json` pins
`graphql: 16.8.1` (matching what Payload bundles); if you ever bump it,
make sure `npm ls graphql` shows a single deduped version.

### `Cannot read properties of undefined (reading 'dev')` at `initAdmin`

Payload v2 requires an explicit admin UI bundler. Make sure
`@payloadcms/bundler-webpack` is installed and `admin.bundler` is set
in `src/payload.config.ts`:

```ts
import { webpackBundler } from '@payloadcms/bundler-webpack'
// ...
admin: { bundler: webpackBundler(), ... }
```

### Server starts but `/admin` 404s in production

Make sure `NODE_ENV=production` and you ran `npm run build` before
`npm start` — the production admin assets are served from the
pre-built bundle, not webpack-dev-middleware.

### Resend errors in console but quotes/assessments still save

That's by design — the email hooks are lazy-init and wrap each `send`
in try/catch. A lead submission never fails over an email API hiccup.
Check `RESEND_API_KEY` and verify your sender domain in Resend.

---

## Production deployment

Two pieces to host: this CMS (Express + Payload + Postgres) and the
Next.js frontend (`../frontend`, already on Vercel). Suggested split:

- **CMS** → Railway / Render / Fly.io as a long-running Node service
  + a managed Postgres (Neon, Supabase, or Railway-provided)
- **Frontend** → Vercel (already configured)

Steps:
1. Provision Postgres (Neon free tier or Railway's Postgres plugin).
2. Deploy this `cms/` directory as a Node service.
3. Set env vars on the host:
   - `DATABASE_URL` — the managed Postgres URL (with `?sslmode=require` if needed)
   - `PAYLOAD_SECRET` — fresh 64-char random (do NOT reuse the dev secret)
   - `SERVER_URL` — the public URL of the CMS (e.g. `https://cms.bluven.com.au`)
   - `RESEND_API_KEY` / `EMAIL_FROM` / `NOTIFY_EMAIL` — real values
   - `NODE_ENV=production`
4. Start command: `npm run build && npm start` (build runs `tsc`,
   start runs `node dist/server.js`).
5. On Vercel for the frontend, set `NEXT_PUBLIC_CMS_URL` and `CMS_URL`
   to the deployed CMS URL.
6. First-visit to the deployed `/admin` creates the first admin user
   on the production DB (the dev account does not carry over).

---

## Scripts reference

```
npm run dev       # ts-node + nodemon (watches src/)
npm run build     # tsc → dist/
npm start         # node dist/server.js (production)
npm run payload   # Payload CLI (migrations, codegen, etc.)
```
