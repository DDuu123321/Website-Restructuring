/**
 * BulkEditButton — reliable replacement for Payload's native bulk Edit.
 *
 * WHY: Payload 2.x's bulk update (one PATCH with a `where`) runs the per-doc
 * updates concurrently inside one Postgres transaction and silently loses
 * 1–2 documents per operation while reporting success
 * (https://github.com/payloadcms/payload/issues/14247 — reproduced locally:
 * 10 selected → newest + oldest not persisted, zero errors surfaced).
 * Single-document PATCH is unaffected, so this button applies the change by
 * PATCHing each selected doc SEQUENTIALLY and shows a per-row result.
 * The native edit-many button is hidden via admin-overrides.css.
 *
 * Field whitelist per collection below; the field's label/options are read
 * from the live Payload config at render time so they never drift from the
 * collection definitions.
 *
 * Registered via `admin.components.BeforeListTable`.
 */

import React, { useState } from 'react'
import { useConfig } from 'payload/components/utilities'
import { useSelection, SelectAllStatus } from 'payload/dist/admin/components/views/collections/List/SelectionProvider'
import { detectCollectionSlug } from './csv-utils'

/** Which fields may be bulk-edited, per collection slug. */
const BULK_FIELDS: Record<string, string[]> = {
  quotes:      ['status'],
  assessments: ['status'],
  projects:    ['featured'],
  news:        ['featured'],
}

type RowResult = { id: string | number; ok: boolean; error?: string }

const BulkEditButton: React.FC = () => {
  const slug = detectCollectionSlug()
  const config = useConfig()
  const selection = useSelection()
  const [fieldName, setFieldName] = useState('')
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const [results, setResults] = useState<RowResult[] | null>(null)

  const allowed = (slug && BULK_FIELDS[slug]) || []
  if (!slug || allowed.length === 0) return null

  const collection: any = config.collections.find((c: any) => c.slug === slug)
  const fields: any[] = (collection?.fields || []).filter((f: any) => allowed.includes(f.name))
  if (fields.length === 0) return null

  const activeField: any = fields.find((f: any) => f.name === (fieldName || fields[0].name)) || fields[0]
  const selectedCount = selection.count

  const collectIds = async (): Promise<(string | number)[]> => {
    // "Select all N docs" spans beyond the current page: resolve ids via the
    // same query string the native tools use, otherwise use the ticked rows.
    if (selection.selectAll === SelectAllStatus.AllAvailable) {
      const res = await fetch(`/api/${slug}${selection.getQueryParams()}&limit=10000&depth=0`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error(`Failed to resolve selection (HTTP ${res.status})`)
      const body = (await res.json()) as { docs?: { id: string | number }[] }
      return (body.docs || []).map((d) => d.id)
    }
    return Object.entries(selection.selected)
      .filter(([, ticked]) => ticked)
      .map(([id]) => id)
  }

  const apply = async () => {
    if (busy) return
    setResults(null)
    setBusy(true)
    setProgress('Resolving selection…')
    try {
      const ids = await collectIds()
      if (ids.length === 0) {
        setProgress('')
        setResults([])
        setBusy(false)
        return
      }
      const fieldValue = activeField.type === 'checkbox' ? value === 'true' : value
      const out: RowResult[] = []
      // Sequential on purpose — concurrent updates are exactly what loses
      // writes in Payload's native bulk path.
      for (let i = 0; i < ids.length; i++) {
        setProgress(`Updating ${i + 1} / ${ids.length}…`)
        try {
          const res = await fetch(`/api/${slug}/${ids[i]}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [activeField.name]: fieldValue }),
          })
          if (res.ok) {
            out.push({ id: ids[i], ok: true })
          } else {
            const body = (await res.json().catch(() => ({}))) as {
              errors?: { message?: string }[]
              message?: string
            }
            out.push({
              id: ids[i],
              ok: false,
              error: body.errors?.[0]?.message || body.message || `HTTP ${res.status}`,
            })
          }
        } catch (e) {
          out.push({ id: ids[i], ok: false, error: e instanceof Error ? e.message : 'Request failed' })
        }
      }
      setResults(out)
      setProgress('')
      // Full success → reload so the list reflects the new values; failures
      // keep the panel on screen so they stay visible.
      if (out.every((r) => r.ok)) {
        setProgress(`✓ Updated all ${out.length}. Refreshing…`)
        setTimeout(() => window.location.reload(), 1200)
        return
      }
    } catch (e) {
      setResults([{ id: '—', ok: false, error: e instanceof Error ? e.message : 'Bulk edit failed' }])
      setProgress('')
    }
    setBusy(false)
  }

  const failure = results?.filter((r) => !r.ok) ?? []
  const success = results ? results.length - failure.length : 0

  const valueOptions: { label: string; value: string }[] =
    activeField.type === 'checkbox'
      ? [
          { label: '✓ Ticked (yes)', value: 'true' },
          { label: '✗ Unticked (no)', value: 'false' },
        ]
      : (activeField.options || []).map((o: any) =>
          typeof o === 'string' ? { label: o, value: o } : { label: o.label, value: o.value },
        )

  return (
    <div style={{ margin: '4px 0 14px', padding: '12px 14px', border: '1px solid #c9d5e2', borderRadius: 10, background: '#fbfdff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, fontSize: 13.5, color: '#042744' }}>
          🛠 Bulk edit{selectedCount > 0 ? ` (${selection.selectAll === SelectAllStatus.AllAvailable ? selection.totalDocs : selectedCount} selected)` : ''}
        </span>
        {fields.length > 1 && (
          <select value={activeField.name} onChange={(e) => { setFieldName(e.target.value); setValue('') }} style={selStyle} disabled={busy}>
            {fields.map((f: any) => (
              <option key={f.name} value={f.name}>{typeof f.label === 'string' ? f.label : f.name}</option>
            ))}
          </select>
        )}
        {fields.length === 1 && (
          <span style={{ fontSize: 13, color: '#334155' }}>
            {typeof activeField.label === 'string' ? activeField.label : activeField.name} →
          </span>
        )}
        <select value={value} onChange={(e) => setValue(e.target.value)} style={selStyle} disabled={busy}>
          <option value="">Choose value…</option>
          {valueOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={apply}
          disabled={busy || !value || selectedCount === 0}
          style={btnStyle(busy || !value || selectedCount === 0)}
        >
          {busy ? progress || 'Working…' : 'Apply to selected'}
        </button>
        {!busy && selectedCount === 0 && (
          <span style={{ fontSize: 12.5, color: '#6b7280' }}>Tick rows below first.</span>
        )}
        {!busy && progress && <span style={{ fontSize: 12.5, color: '#166534' }}>{progress}</span>}
      </div>
      {results && failure.length > 0 && (
        <div style={{ marginTop: 10, padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, fontSize: 13 }}>
          <b style={{ color: '#92400e' }}>⚠ {success} updated · {failure.length} failed</b>
          <ul style={{ margin: '6px 0 0', paddingLeft: 20, color: '#7c2d12', fontSize: 12.5 }}>
            {failure.map((r) => (
              <li key={String(r.id)}>ID {r.id}: {r.error}</li>
            ))}
          </ul>
        </div>
      )}
      {results && results.length === 0 && (
        <div style={{ marginTop: 8, fontSize: 12.5, color: '#6b7280' }}>Nothing selected.</div>
      )}
    </div>
  )
}

const selStyle: React.CSSProperties = {
  padding: '7px 10px',
  borderRadius: 8,
  border: '1px solid #c9d5e2',
  background: '#fff',
  fontSize: 13,
  fontFamily: 'inherit',
  color: '#042744',
}

const btnStyle = (disabled: boolean): React.CSSProperties => ({
  padding: '8px 16px',
  borderRadius: 8,
  border: 'none',
  background: disabled ? '#f3f4f6' : '#ffc61f',
  color: disabled ? '#9ca3af' : '#042744',
  fontWeight: 700,
  fontSize: 13.5,
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontFamily: 'inherit',
})

export default BulkEditButton
