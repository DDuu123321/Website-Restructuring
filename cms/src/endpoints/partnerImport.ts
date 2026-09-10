import type { Endpoint } from 'payload/config'

/**
 * POST /api/partner-import — external lead-import channel for partner companies.
 *
 * Auth: a Users account with role "partner" and an API key (admin ticks
 * "Enable API Key" on the account). Callers send
 * `Authorization: users API-Key <key>`; Payload resolves that to req.user.
 * server.ts refuses the same header on every other route, so a partner key
 * can do exactly one thing: create quotes here.
 *
 * Same write pattern as bulkImport.ts — rows are created SEQUENTIALLY
 * (Payload's concurrent bulk path loses rows on Postgres), each row gets its
 * own result, and `context.skipNotifications` keeps a 300-row import from
 * firing 300 confirmation + internal emails. Field validation (AU phone /
 * email / postcode) runs exactly as it does for the public /quote form.
 *
 * Only whitelisted contact/property/system fields are accepted: status,
 * internalNotes, source and the honeypot are never taken from the caller.
 * Numbers must be numeric (a numeric string is coerced; anything else fails
 * the row — Payload would otherwise store NaN and report ok) and a bare
 * string for the hasMany `components` is wrapped (db-postgres silently drops
 * a non-array there).
 *
 * The row cap is sized to Payload's default 100 KB JSON body limit: 200 fully
 * populated leads are ~75 KB. Bigger bodies get a 413 from body-parser
 * before this handler runs.
 * `source.referrer` is stamped with the partner's account name so the admin
 * list and the CRM sync can tell partner leads apart.
 */

const MAX_LEADS_PER_REQUEST = 200

const ALLOWED_FIELDS = [
  'firstName', 'lastName', 'email', 'phone', 'bestTime',
  'propertyType', 'address', 'suburb', 'state', 'postcode',
  'timeline', 'components', 'systemKw', 'batteryKwh', 'monthlyBill', 'notes',
] as const
const NUMERIC_FIELDS = new Set(['systemKw', 'batteryKwh', 'monthlyBill'])

export const partnerImportEndpoint: Endpoint = {
  path: '/partner-import',
  method: 'post',
  handler: async (req, res) => {
    const user = req.user as { id: string | number; name?: string; email?: string; role?: string } | undefined
    if (!user) {
      return res.status(401).json({ error: 'Missing or invalid API key.' })
    }
    if (user.role !== 'partner') {
      return res.status(403).json({ error: 'This endpoint accepts partner API keys only.' })
    }

    const { leads } = (req.body || {}) as { leads?: unknown }
    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ error: '"leads" must be a non-empty array.' })
    }
    if (leads.length > MAX_LEADS_PER_REQUEST) {
      return res.status(400).json({ error: `Max ${MAX_LEADS_PER_REQUEST} leads per request — send chunks.` })
    }

    const referrer = `partner:${user.name || user.email || user.id}`
    const results: { index: number; ok: boolean; id?: string | number; error?: string }[] = []

    for (let i = 0; i < leads.length; i++) {
      const row = leads[i]
      if (!row || typeof row !== 'object' || Array.isArray(row)) {
        results.push({ index: i, ok: false, error: 'Lead must be a JSON object.' })
        continue
      }
      const data: Record<string, unknown> = { source: { referrer } }
      let rowError: string | undefined
      for (const key of ALLOWED_FIELDS) {
        let v = (row as Record<string, unknown>)[key]
        if (v === undefined || v === null || v === '') continue
        if (NUMERIC_FIELDS.has(key)) {
          const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN
          if (!Number.isFinite(n)) { rowError = `${key}: must be a number`; break }
          v = n
        } else if (key === 'components' && typeof v === 'string') {
          v = [v]
        }
        data[key] = v
      }
      if (rowError) {
        results.push({ index: i, ok: false, error: rowError })
        continue
      }
      try {
        const doc = await req.payload.create({
          collection: 'quotes',
          data,
          user,
          overrideAccess: false,
          context: { skipNotifications: true },
        } as Parameters<typeof req.payload.create>[0])
        results.push({ index: i, ok: true, id: (doc as { id: string | number }).id })
      } catch (e) {
        const err = e as { data?: { field?: string; message?: string }[]; message?: string }
        const first = Array.isArray(err?.data) ? err.data[0] : undefined
        const msg = first
          ? `${first.field ? `${first.field}: ` : ''}${first.message || 'invalid'}`
          : err?.message || 'Create failed'
        results.push({ index: i, ok: false, error: String(msg).slice(0, 300) })
      }
    }

    const created = results.filter((r) => r.ok).length
    req.payload.logger.info(`[partner-import] ${referrer}: ${created}/${leads.length} leads created`)
    return res.json({ created, failed: leads.length - created, results })
  },
}
