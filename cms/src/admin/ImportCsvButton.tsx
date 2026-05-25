/**
 * ImportCsvButton — bulk-create records from a CSV.
 *
 * Workflow:
 *   1. User clicks "Import CSV" → file picker opens.
 *   2. CSV is parsed (papaparse, header row required).
 *   3. Each row is POSTed individually to /api/{slug} with credentials.
 *   4. Per-row results are shown in a summary panel.
 *
 * Notes:
 *   - Per-collection multi-value fields (e.g. quote `components`) are
 *     split on ';' in the CSV cell. See `multiValueFields` map.
 *   - Dot-paths in the header re-nest into objects ("source.referrer"
 *     becomes { source: { referrer: ... } }).
 *   - The endpoint runs its own Payload validation; rows with missing
 *     required fields surface as per-row errors.
 *
 * Registered via `admin.components.BeforeListTable`.
 */

import React, { useRef, useState } from 'react'
import { detectCollectionSlug, parseCsvFile, rowToPayload } from './csv-utils'

type RowResult = { row: number; ok: boolean; error?: string; id?: string }

// Multi-value fields per collection. Keys MUST match the CSV header.
const multiValueFields: Record<string, string[]> = {
  quotes:        ['components'],
  assessments:   ['answers.majorLoads', 'answers.mainGoal', 'result.billReasons'],
  testimonials:  [],
}

const ImportCsvButton: React.FC = () => {
  const slug = detectCollectionSlug()
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [results, setResults] = useState<RowResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!slug) return null

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''   // reset so picking the same file again still fires onChange
    if (!file) return

    setBusy(true)
    setError(null)
    setResults(null)

    try {
      const rows = await parseCsvFile(file)
      if (rows.length === 0) {
        setError('CSV has no data rows.')
        setBusy(false)
        return
      }

      const arrFields = multiValueFields[slug] ?? []
      const out: RowResult[] = []

      // Sequential POSTs — easier to surface per-row errors and avoids
      // overwhelming the rate limiter.
      for (let i = 0; i < rows.length; i++) {
        const payload = rowToPayload(rows[i], arrFields)
        try {
          const res = await fetch(`/api/${slug}`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          if (res.ok) {
            const body = (await res.json()) as { doc?: { id?: string } }
            out.push({ row: i + 2, ok: true, id: body.doc?.id })  // +2: header row + 1-based
          } else {
            const body = (await res.json().catch(() => ({}))) as {
              errors?: { message?: string }[]
              message?: string
            }
            const msg = body.errors?.[0]?.message || body.message || `HTTP ${res.status}`
            out.push({ row: i + 2, ok: false, error: msg })
          }
        } catch (rowErr) {
          out.push({
            row: i + 2,
            ok: false,
            error: rowErr instanceof Error ? rowErr.message : 'Request failed',
          })
        }
      }

      setResults(out)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed')
    } finally {
      setBusy(false)
    }
  }

  const success = results?.filter((r) => r.ok).length ?? 0
  const failure = results?.filter((r) => !r.ok).length ?? 0

  return (
    <div style={{ margin: '4px 0 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          style={btnStyle(busy)}
        >
          {busy ? 'Importing…' : '📤 Import from CSV'}
        </button>
        <span style={{ fontSize: 12.5, color: '#6b7280' }}>
          Header row required · multi-value cells split on <code style={code}>;</code>
        </span>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          onChange={onFile}
          style={{ display: 'none' }}
        />
      </div>
      {error && (
        <div style={{ marginTop: 10, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#b91c1c', fontSize: 13.5 }}>
          {error}
        </div>
      )}
      {results && (
        <div
          style={{
            marginTop: 10,
            padding: '12px 14px',
            borderRadius: 8,
            background: failure === 0 ? '#f0fdf4' : '#fffbeb',
            border: `1px solid ${failure === 0 ? '#bbf7d0' : '#fde68a'}`,
            fontSize: 13.5,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6, color: failure === 0 ? '#166534' : '#92400e' }}>
            {failure === 0
              ? `✓ Imported ${success} ${success === 1 ? 'row' : 'rows'}`
              : `⚠ ${success} imported · ${failure} failed`}
          </div>
          {failure > 0 && (
            <details>
              <summary style={{ cursor: 'pointer', color: '#92400e', fontWeight: 600 }}>
                Show failed rows ({failure})
              </summary>
              <ul style={{ margin: '8px 0 0', paddingLeft: 20, color: '#7c2d12', fontSize: 12.5 }}>
                {results.filter((r) => !r.ok).map((r) => (
                  <li key={r.row}>
                    Row {r.row}: {r.error}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  )
}

const btnStyle = (busy: boolean): React.CSSProperties => ({
  padding: '8px 16px',
  borderRadius: 8,
  border: '1px solid #c9d5e2',
  background: busy ? '#f3f4f6' : '#fff',
  color: '#042744',
  fontWeight: 700,
  fontSize: 13.5,
  cursor: busy ? 'not-allowed' : 'pointer',
  fontFamily: 'inherit',
})

const code: React.CSSProperties = {
  padding: '1px 6px',
  borderRadius: 4,
  background: '#f3f4f6',
  fontFamily: 'monospace',
  fontSize: 12,
}

export default ImportCsvButton
