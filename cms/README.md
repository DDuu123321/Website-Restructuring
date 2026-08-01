# Bluven Energy — CMS Backend

Payload CMS 2.x backend serving the Bluven Energy website. Powers all
content (news, projects, FAQ) and captures all leads (quotes, free
assessments, newsletter subscribers). The Next.js frontend in
`../frontend` talks to this server over REST.

## Stack

| Layer | Choice |
|---|---|
| CMS | Payload 2.32 (REST + Admin UI; GraphQL disabled) |
| Database | PostgreSQL 16 (via `@payloadcms/db-postgres`) |
| Admin bundler | Webpack (`@payloadcms/bundler-webpack`) |
| Email | Zoho SMTP via Nodemailer |
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
| `SMTP_HOST` | ✓ for email | `smtp.zoho.com` (worldwide) or `smtp.zoho.com.au` (AU) |
| `SMTP_PORT` | ✓ for email | `465` (SSL, recommended) or `587` (STARTTLS) |
| `SMTP_USER` | ✓ for email | Full Zoho address, e.g. `system@bluven.com.au` |
| `SMTP_PASS` | ✓ for email | Zoho **App Password** — not the login password. Generate at Mail → Settings → Security → App Passwords. |
| `EMAIL_FROM` | optional | Sender address shown on outgoing mail. Defaults to `SMTP_USER`. Must match an alias on the same Zoho account or Zoho rejects with 550. |
| `NOTIFY_EMAIL` | optional | Inbox that receives business notifications. Defaults to `SMTP_USER`. |
| `GEMINI_API_KEY` | optional | Only needed for the AI chat proxy |

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
| Subscribers | `subscribers` | 📥 Leads | Newsletter signups (via `/api/subscribe`) |
| News | `news` | 📰 Content | Articles (AI import, Page Builder blocks) |
| Projects | `projects` | 📰 Content | Installation case studies |
| FAQ | `faq` | 📰 Content | Frequently asked questions |
| Users | `users` | 🛠 System | Admin accounts |
| Media | `media` | 🛠 System | Image library |

Globals: **Site Settings** (`/admin/globals/site-settings`) — phone,
email, notification toggles.

---

## REST API reference

All read endpoints are public; collection access rules in code govern
write access. Lead collections accept anonymous POSTs but require auth
to read/update/delete.

```
GET  /api/news[?where[category][equals]=policy]
GET  /api/projects
GET  /api/faq?where[published][equals]=true
GET  /api/globals/site-settings
POST /api/quotes            Public — /quote form submission
POST /api/assessments       Public — Free Assessment quiz submission
POST /api/subscribe         Public — newsletter signup (idempotent, anti-enumeration)
POST /api/chat              AI chat proxy (Gemini)
POST /api/bulk-import       Admin-only — CSV lead import channel
```

`POST /api/quotes` and `POST /api/assessments` trigger an `afterChange`
hook that sends the customer confirmation/report unconditionally and the
internal business notification (to `NOTIFY_EMAIL`) when its Site Settings
toggle is on. New subscribers fire an internal notification only. Hooks
live in `src/hooks/`.

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

### SMTP errors in console but quotes/assessments still save

That's by design — the email helpers wrap each `send` in try/catch.
A lead submission never fails over an SMTP hiccup. Common causes:
- `SMTP_PASS` is the account login password (use **App Password** instead)
- Wrong `SMTP_HOST` region (`.com` vs `.com.au` — check your Zoho admin)
- Sender (`EMAIL_FROM`) doesn't match `SMTP_USER` or a verified alias

---

## Production deployment

Production runs on **Railway** (this CMS + its Postgres, media on
Cloudflare R2) with the Next.js frontend on **Netlify**
(www.bluven.com.au). `railway.json` documents the real build and
pre-deploy commands.

⚠️ Schema changes reach production ONLY through migrations: Railway's
pre-deploy command is `npm run migrate:prod` — dev-mode schema push is
never used against the production DB. Create migrations with
`npm run payload -- migrate:create <name>`.

Key env vars on Railway:
- `DATABASE_URL` — Railway Postgres URL
- `PAYLOAD_SECRET` — fresh 64-char random (do NOT reuse the dev secret)
- `SERVER_URL` + `PAYLOAD_PUBLIC_SERVER_URL` — the CMS public origin (Railway domain), both set
- `FRONTEND_URL=https://www.bluven.com.au` — CORS/CSRF allow-list
- `SMTP_*` / `EMAIL_FROM` / `NOTIFY_EMAIL` — Zoho SMTP (App Password)
- R2 storage vars (see `src/lib/storage.ts`)
- `NODE_ENV=production`

On Netlify (frontend), `NEXT_PUBLIC_CMS_URL` and `CMS_URL` point at the
Railway CMS origin.

---

## Scripts reference

```
npm run dev           # ts-node + nodemon (watches src/)
npm run build         # payload build + tsc → dist/
npm start             # node dist/server.js (production)
npm run payload       # Payload CLI (use -- to pass args, e.g. migrate:create)
npm run migrate       # apply migrations against DATABASE_URL (dev config)
npm run migrate:prod  # apply migrations using the compiled config (Railway pre-deploy)
```
