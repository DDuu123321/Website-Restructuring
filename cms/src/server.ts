import 'dotenv/config'
import express from 'express'
import payload from 'payload'
import path from 'path'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

const app = express()

// ── Security headers (relaxed for CMS admin) ──────────────
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
)

// ── CORS — allow Next.js frontend ─────────────────────────
const allowedOrigins = [
  'http://localhost:3000',           // Next.js dev
  'http://localhost:3001',           // Same-origin (CMS itself)
  process.env.FRONTEND_URL || '',    // Production frontend URL
  process.env.SERVER_URL || '',
].filter(Boolean)

app.use(cors({ origin: allowedOrigins, credentials: true }))

// ── Anti-spam: 10 POST submissions per minute per IP ──────
// GETs (admin list views, UnreadBadges polling, frontend ISR) are
// not counted thanks to the `skip` filter.
// Shared bucket across all three lead endpoints — an attacker
// spreading their requests across quotes/assessments/testimonials
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
app.use('/api/testimonials', submitLimiter)

// ── AI Chat proxy — keeps Gemini API key server-side ──────
app.post('/api/chat', express.json(), async (req, res) => {
  const { messages } = req.body
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages required' })
  }
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(503).json({ error: 'Chat service unavailable' })
  }
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{
              text: `You are Sunny, the friendly AI assistant for Bluven Energy, an Australian solar energy company.
Your role is to help customers with questions about solar panels, battery storage, EV charging, rebates, and pricing.
Always be helpful, concise, and guide users towards getting a free quote when appropriate.
For technical specifics or exact pricing, encourage them to request a quote or call 1300 BLUVEN.
Keep responses under 150 words. Do not make up specific prices or rebate amounts.`
            }]
          },
          contents: messages.map((m: any) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
          generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
        }),
      }
    )
    if (!response.ok) {
      const err = await response.text()
      console.error('[chat] Gemini error:', err)
      return res.status(502).json({ error: 'AI service error' })
    }
    const data: any = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.'
    return res.json({ reply: text })
  } catch (err) {
    console.error('[chat] proxy error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// ── Serve uploaded media ───────────────────────────────────
app.use('/uploads', express.static(path.resolve(__dirname, '../../uploads')))

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
