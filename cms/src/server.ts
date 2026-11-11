import 'dotenv/config'
import express from 'express'
import payload from 'payload'
import path from 'path'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { SUNNY_SYSTEM_PROMPT } from './lib/sunnyPrompt'
import { extractHandover, recordChatTurn } from './lib/chatHandover'
import crypto from 'crypto'
import { r2Enabled } from './lib/storage'

const app = express()

// Trust the first proxy hop (Vercel / load balancer / nginx) so express-rate-limit
// keys on the real client IP from X-Forwarded-For. Without this, every request
// looks like it comes from the proxy and the IP in XFF can be freely spoofed to
// dodge the per-IP submission limit below.
app.set('trust proxy', 1)

// ── Security headers (relaxed for CMS admin) ──────────────
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    // Allow the Next.js frontend (different origin) to embed /uploads images.
    // Helmet defaults CORP to same-origin, which blocks cross-origin <img>
    // (ERR_BLOCKED_BY_RESPONSE.NotSameOrigin) once real media is served.
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
)

// ── CORS — allow Next.js frontend ─────────────────────────
const isDev = process.env.NODE_ENV !== 'production'
const allowedOrigins = [
  ...(isDev ? ['http://localhost:3000', 'http://localhost:3001'] : []),
  process.env.FRONTEND_URL || '',    // Production frontend URL
  process.env.SERVER_URL || '',
].filter(Boolean)

app.use(cors({ origin: allowedOrigins, credentials: true }))

// ── Anti-spam: 10 POST submissions per minute per IP ──────
// GETs (admin list views, UnreadBadges polling, frontend ISR) are
// not counted thanks to the `skip` filter.
// Shared bucket across all public form endpoints — an attacker
// spreading their requests across quotes/assessments/support
// still gets only 10 POSTs/min total.
const submitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many submissions. Please try again in a moment.' },
  skip: (req) => req.method !== 'POST',
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/quotes',       submitLimiter)
app.use('/api/assessments',  submitLimiter)
app.use('/api/subscribers',  submitLimiter)
app.use('/api/subscribe',    submitLimiter)   // public newsletter endpoint
app.use('/api/support-requests', submitLimiter)

// ── Partner import: 30 batches/min per IP ─────────────────
// A leaked partner key must not become an unmetered firehose into `quotes`
// (and on into the CRM sync). 30 × 200 rows/min is far above any real feed;
// the public 10/min bucket above is deliberately not shared so a partner's
// server never competes with website visitors.
app.use(
  '/api/partner-import',
  rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: { error: 'Too many requests. Send at most 30 batches per minute.' },
    standardHeaders: true,
    legacyHeaders: false,
  }),
)

// ── Partner API keys: one door only ───────────────────────
// Users.auth.useAPIKey makes Payload accept `Authorization: users API-Key x`
// on EVERY route, and each collection's access rule is a plain `!!req.user` —
// so a partner's key would otherwise read all leads and content. Refuse the
// header anywhere except the partner-import endpoint (which re-checks the
// role itself). Runs before payload.init() so the key is never even looked up.
app.use('/api', (req, res, next) => {
  const auth = req.header('authorization') || ''
  if (/^users API-Key /i.test(auth) && req.path !== '/partner-import') {
    return res.status(403).json({ error: 'API keys may only be used with POST /api/partner-import.' })
  }
  return next()
})

// ── AI Chat proxy — keeps Gemini API key server-side ──────
// Rate-limited and size-capped: each call costs real money on the Gemini
// quota, so an unthrottled proxy is an open billing-drain endpoint.
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: { error: 'Too many messages. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
})
// 60, not 20: the knowledge-base intake (contact → home basics → equipment)
// runs to a couple of dozen turns, and the old cap cut those chats off mid-flow.
const MAX_CHAT_MESSAGES = 60
const MAX_CHAT_CHARS = 2000


// Remembers the last Gemini model id that answered successfully so the
// fallback chain doesn't pay a failed round-trip on every request.
let workingGeminiModel: string | null = null

app.post('/api/chat', chatLimiter, express.json({ limit: '200kb' }), async (req, res) => {
  const { messages, conversationId } = req.body
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages required' })
  }
  if (messages.length > MAX_CHAT_MESSAGES) {
    return res.status(400).json({ error: 'Conversation too long' })
  }
  if (!messages.every((m: any) =>
    m && typeof m.content === 'string' && m.content.length <= MAX_CHAT_CHARS
    && (m.role === 'user' || m.role === 'assistant'))) {
    return res.status(400).json({ error: 'Invalid message format' })
  }

  // Respect the admin's AI-chat toggle (SiteSettings → AI Chat → Enable AI chat
  // widget). Fail open if settings can't be read, so a transient DB blip doesn't
  // silently kill chat.
  try {
    const settings: any = await payload.findGlobal({ slug: 'site-settings' })
    if (settings?.chat?.enabled === false) {
      return res.status(503).json({ error: 'Chat is currently unavailable.' })
    }
  } catch { /* fail open */ }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(503).json({ error: 'Chat service unavailable' })
  }
  try {
    // Model fallback chain: GEMINI_MODEL env override first, then the rolling
    // alias, then pinned current ids. Google retires model ids on a schedule —
    // in July 2026 BOTH 2.0-flash and (for new keys) 2.5-flash were gone, which
    // killed chat in prod. `gemini-flash-latest` is Google's own moving alias
    // for the current flash model, so it survives retirements; the pinned ids
    // behind it only matter if the alias itself ever misbehaves.
    const models = [
      ...(process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL] : []),
      'gemini-flash-latest',
      'gemini-3.6-flash',
      'gemini-3.5-flash',
    ].filter((m, i, a) => a.indexOf(m) === i)
    const startIdx = Math.max(0, models.indexOf(workingGeminiModel || models[0]))

    let response: Awaited<ReturnType<typeof fetch>> | null = null
    for (let i = startIdx; i < models.length; i++) {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${models[i]}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SUNNY_SYSTEM_PROMPT }] },
            contents: messages.map((m: any) => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }],
            })),
            // Gemini 3.x are thinking models: reasoning tokens count against
          // maxOutputTokens (measured ~800+ per reply) and the old 400 budget
          // truncated every answer mid-sentence. Visible length is still
          // capped by the prompt's "under 150 words" rule.
          generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
          }),
        }
      )
      if (response.ok) {
        workingGeminiModel = models[i]
        break
      }
      const err = await response.text()
      console.error(`[chat] Gemini error (model ${models[i]}):`, err)
      // Only a missing/retired model id is worth retrying with the next id;
      // key/quota/safety errors will fail identically on every model.
      const modelGone = response.status === 404 || /not found|is not supported|unknown model/i.test(err)
      if (!modelGone) break
      response = null
    }
    if (!response || !response.ok) {
      return res.status(502).json({ error: 'AI service error' })
    }
    const data: any = await response.json()
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.'
    const { reply, handover } = extractHandover(raw)
    // Store the transcript on every turn and, on a hand-over, save the summary,
    // create the quote and email the owning team. Fire-and-forget: the visitor's
    // reply must never wait on the database or the mail relay.
    void recordChatTurn(payload, { conversationId, messages, reply, handover }).catch((e) =>
      payload.logger.error(`[chat] failed to record conversation: ${e?.message || e}`),
    )
    return res.json({ reply })
  } catch (err) {
    console.error('[chat] proxy error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// ── CRM lead sync (one-way pull) ───────────────────────────
// The standalone CRM polls this for new leads. Read-only, guarded by a shared
// secret. Returns quotes + assessments created at/after ?since=<ISO>, in a
// normalised shape so the CRM never couples to Payload's internal fields.
// Inert until CRM_SYNC_KEY is set (returns 503), so it ships safely.
const CRM_SYNC_KEY = process.env.CRM_SYNC_KEY
if (!CRM_SYNC_KEY) {
  console.warn('[crm-sync] CRM_SYNC_KEY not set — GET /api/crm/leads is disabled (503).')
}

// Constant-time Bearer check (compare SHA-256 digests so length never leaks and
// timingSafeEqual always gets equal-length buffers).
function crmSyncAuthOk(header: string | undefined): boolean {
  if (!CRM_SYNC_KEY) return false
  const a = crypto.createHash('sha256').update(header ?? '').digest()
  const b = crypto.createHash('sha256').update(`Bearer ${CRM_SYNC_KEY}`).digest()
  return crypto.timingSafeEqual(a, b)
}

app.get('/api/crm/leads', async (req, res) => {
  if (!CRM_SYNC_KEY) {
    return res.status(503).json({ error: 'CRM sync not configured' })
  }
  if (!crmSyncAuthOk(req.header('authorization'))) {
    return res.status(401).json({ error: 'unauthorized' })
  }

  const sinceRaw = typeof req.query.since === 'string' ? req.query.since : ''
  const since =
    sinceRaw && !Number.isNaN(Date.parse(sinceRaw))
      ? sinceRaw
      : '1970-01-01T00:00:00.000Z'
  // `>=` (not `>`) + the CRM's idempotent upsert-by-externalId means re-pulling
  // boundary records is harmless and nothing is ever skipped.
  const where = { createdAt: { greater_than_equal: since } } as any
  const limit = 200

  try {
    const [quotes, assessments] = await Promise.all([
      payload.find({ collection: 'quotes', where, sort: 'createdAt', limit, depth: 0 }),
      payload.find({ collection: 'assessments', where, sort: 'createdAt', limit, depth: 0 }),
    ])

    const items = [
      ...quotes.docs.map((q: any) => ({
        kind: 'quote',
        externalId: `quote:${q.id}`,
        createdAt: q.createdAt,
        firstName: q.firstName || '',
        lastName: q.lastName || '',
        email: q.email || '',
        phone: q.phone || '',
        address: q.address || '',
        suburb: q.suburb || '',
        state: q.state || '',
        postcode: q.postcode || '',
        source:
          q?.source?.referrer === 'ai-chat'
            ? 'AI_CHAT'
            : String(q?.source?.referrer || '').startsWith('partner:')
              ? 'PARTNER'
              : 'WEBSITE_QUOTE',
        title:
          Array.isArray(q.components) && q.components.length
            ? q.components.join(' + ')
            : 'Website quote',
        // Partner-supplied context (2026-09-12); empty for website-form quotes.
        householdSize: q.householdSize || '',
        goals: q.goals || '',
        productPreference: q.productPreference || '',
      })),
      ...assessments.docs.map((a: any) => ({
        kind: 'assessment',
        externalId: `assessment:${a.id}`,
        createdAt: a.createdAt,
        firstName: a.firstName || '',
        lastName: a.lastName || '',
        email: a.email || '',
        phone: a.phone || '',
        address: a.address || '',
        suburb: a.suburb || '',
        state: a.state || '',
        postcode: a.postcode || '',
        source: 'WEBSITE_ASSESSMENT',
        title: 'Free assessment',
      })),
    ].sort((x, y) => String(x.createdAt).localeCompare(String(y.createdAt)))

    return res.json({ items, count: items.length })
  } catch (err) {
    payload.logger.error(`[crm-sync] query failed: ${err}`)
    return res.status(500).json({ error: 'sync query failed' })
  }
})

// ── Serve uploaded media (local-disk mode only) ────────────
// In R2 mode the cloud-storage plugin registers its own /uploads handler during
// payload.init(); mounting express.static here would shadow it and 404 files
// that aren't on Railway's ephemeral disk.
if (!r2Enabled) {
  app.use('/uploads', express.static(path.resolve(__dirname, '../../uploads')))
}

// ── Initialise Payload ────────────────────────────────────
//
// NOTE: This server is now a pure API + admin backend.
// The Next.js frontend runs on its own port (3000) and consumes /api/*.
// In production, deploy them as two separate services:
//   - CMS backend  → cms.bluven.com.au   (this server)
//   - Frontend     → bluven.com.au        (Next.js, e.g. on Vercel)
//
const start = async () => {
  await payload.init({
    secret: process.env.PAYLOAD_SECRET as string,
    express: app,
    onInit: () => {
      payload.logger.info(`🟢 Payload Admin:   ${payload.getAdminURL()}`)
    },
  })

  const PORT = parseInt(process.env.PORT || '3001', 10)
  app.listen(PORT, () => {
    payload.logger.info(`🚀 CMS API running:  http://localhost:${PORT}`)
    payload.logger.info(`🔧 Admin panel:      http://localhost:${PORT}/admin`)
    payload.logger.info(`📡 REST API:         http://localhost:${PORT}/api`)
    payload.logger.info(`🌐 Frontend (dev):   http://localhost:3000`)
  })
}

start().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
