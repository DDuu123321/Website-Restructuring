import type { Endpoint } from 'payload/config'

/**
 * POST /api/subscribe — public newsletter signup.
 *
 * WHY THIS EXISTS: the Subscribers collection has a UNIQUE email, so letting
 * the public POST straight to /api/subscribers turned it into an address
 * oracle — a duplicate returned a unique-constraint error while a new address
 * returned 201, so anyone could test whether a given person is on the list.
 * This endpoint answers `{ ok: true }` either way: already-subscribed and
 * newly-subscribed are indistinguishable from outside. Collection-level
 * `create` is now admin-only, so this is the only public way in.
 *
 * Rate limiting is applied in server.ts (shared bucket with the lead forms).
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_EMAIL_LEN = 254   // RFC 5321 practical maximum

export const subscribeEndpoint: Endpoint = {
  path: '/subscribe',
  method: 'post',
  handler: async (req, res) => {
    const { email, source, hp } = (req.body || {}) as {
      email?: unknown
      source?: unknown
      hp?: unknown
    }

    // Honeypot: real users never see this field. Answer 200 so bots can't
    // tell they were filtered.
    if (typeof hp === 'string' && hp.trim() !== '') {
      return res.json({ ok: true })
    }

    const value = typeof email === 'string' ? email.trim().toLowerCase() : ''
    if (!value || value.length > MAX_EMAIL_LEN || !EMAIL_RE.test(value)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' })
    }

    try {
      const existing = await req.payload.find({
        collection: 'subscribers',
        where: { email: { equals: value } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      if (existing.docs.length === 0) {
        await req.payload.create({
          collection: 'subscribers',
          data: {
            email: value,
            source: typeof source === 'string' ? source.slice(0, 60) : 'news-page',
          },
          overrideAccess: true,
        })
      }
    } catch (e) {
      // A racing duplicate insert lands here; it is still a success from the
      // subscriber's point of view. Anything else is logged, never echoed —
      // error text must not become a side channel.
      req.payload.logger.error(`[subscribe] ${(e as Error)?.message || e}`)
    }

    return res.json({ ok: true })
  },
}
