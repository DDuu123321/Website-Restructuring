import type { Endpoint } from 'payload/config'

/**
 * POST /api/bulk-import — admin-only CSV import channel.
 *
 * WHY: the public lead endpoints carry a 10 POST/min anti-spam limiter that
 * counts logged-in admins too, so the CSV import button (one POST per row)
 * lost every row past the first ten. This root-level endpoint lives OUTSIDE
 * the /api/quotes and /api/assessments mount points, so the public limiter
 * never sees it — while anonymous callers are turned away here with a 403
 * and Payload's global rate limit still applies as a DDoS floor.
 *
 * Rows are created SEQUENTIALLY (concurrent writes are what loses data in
 * Payload's native bulk path) with per-row results. Validation and access
 * control run exactly as they do for the normal REST create; the only
 * behavioural difference is `context.skipNotifications`, which stops an
 * import from firing one internal notification email per row.
 */

const IMPORTABLE = new Set(['quotes', 'assessments'])
const MAX_ROWS_PER_REQUEST = 500

export const bulkImportEndpoint: Endpoint = {
  path: '/bulk-import',
  method: 'post',
  handler: async (req, res) => {
    if (!req.user) {
      return res.status(403).json({ error: 'Admin authentication required.' })
    }

    const { collection, rows } = (req.body || {}) as { collection?: string; rows?: unknown }
    if (!collection || !IMPORTABLE.has(collection)) {
      return res.status(400).json({ error: `Collection is not importable: ${String(collection)}` })
    }
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: '"rows" must be a non-empty array.' })
    }
    if (rows.length > MAX_ROWS_PER_REQUEST) {
      return res.status(400).json({ error: `Max ${MAX_ROWS_PER_REQUEST} rows per request — send chunks.` })
    }

    const results: { index: number; ok: boolean; id?: string | number; error?: string }[] = []
    for (let i = 0; i < rows.length; i++) {
      try {
        const doc = await req.payload.create({
          collection: collection as 'quotes' | 'assessments',
          data: rows[i] as Record<string, unknown>,
          user: req.user,
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

    return res.json({ results })
  },
}
