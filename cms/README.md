# Bluven Energy — CMS Backend

Payload CMS 2.x backend that serves the Bluven Energy website.

## Quick start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Edit `.env` and fill in:
- `MONGODB_URI` — MongoDB Atlas connection string (free at mongodb.com/cloud/atlas)
- `PAYLOAD_SECRET` — random 64-char string (generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- `RESEND_API_KEY` — free at resend.com
- `NOTIFY_EMAIL` — email address to receive quote notifications
- `GEMINI_API_KEY` — Google Gemini API key for AI chat

### 3. Start development server
```bash
npm run dev
```

The server starts on **http://localhost:3001**

| URL | Description |
|-----|-------------|
| http://localhost:3001 | Frontend (HTML pages) |
| http://localhost:3001/admin | CMS Admin panel |
| http://localhost:3001/api/news | REST API example |
| http://localhost:3001/api/chat | AI Chat proxy |

### 4. Create first admin user
On first launch, visit http://localhost:3001/admin and create your admin account.

## Collections (what the client can manage)

| Collection | URL | Purpose |
|-----------|-----|---------|
| News | /admin/collections/news | Industry articles & insights |
| Projects | /admin/collections/projects | Installation case studies |
| FAQ | /admin/collections/faq | Frequently asked questions |
| Brands | /admin/collections/brands | Partner brands & logos |
| Team | /admin/collections/team | Team members |
| Quotes | /admin/collections/quotes | Quote requests (leads) |
| Testimonials | /admin/collections/testimonials | Customer reviews |
| Media | /admin/collections/media | Image library |

## Globals

| Global | URL | Purpose |
|--------|-----|---------|
| Site Settings | /admin/globals/site-settings | Phone, email, address, social |

## REST API reference

All endpoints are public (read-only) unless noted.

```
GET  /api/news                    List published articles
GET  /api/news?where[category][equals]=policy
GET  /api/projects                List published projects
GET  /api/faq?where[published][equals]=true
GET  /api/brands
GET  /api/team
GET  /api/globals/site-settings
POST /api/quotes                  Submit a quote request (public)
POST /api/testimonials            Submit a review (public, pending approval)
POST /api/chat                    AI chat proxy (proxies Gemini)
```

## Production deployment (Railway)

1. Create a new Railway project
2. Add a MongoDB plugin (or use Atlas)
3. Set all environment variables from `.env`
4. Set `START_COMMAND` to `npm run build && npm start`
5. Set `SERVER_URL` to your Railway domain

## Frontend integration

The HTML pages use `scripts/api.js` to fetch data:

```html
<script src="scripts/api.js"></script>
<script>
  bvApi.news({ limit: 6 }).then(({ docs }) => {
    docs.forEach(article => {
      // render article cards
    })
  })
</script>
```
