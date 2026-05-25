/**
 * ExportCsvButton — renders above the list table on lead collections.
 * Fetches up to 10 000 docs, flattens nested groups (source.*, answers.*,
 * result.*) into dot-keyed columns, and downloads as UTF-8 CSV (with
 * BOM so Excel opens it correctly).
 *
 * Registered via `admin.components.BeforeListTable` on each collection.
 */

import React, { useState } from 'react'
import { detectCollectionSlug, docsToCsv, fetchAllDocs, triggerDownload } from './csv-utils'

const ExportCsvButton: React.FC = () => {
  const slug = detectCollectionSlug()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastCount, setLastCount] = useState<number | null>(null)

  if (!slug) return null

  const onExport = async (onlyUnread: boolean) => {
    setBusy(true)
    setError(null)
    try {
      const where = onlyUnread ? 'where[status][equals]=new' : undefined
      const docs = await fetchAllDocs(slug, where)
      if (docs.length === 0) {
        setError('No records to export.')
        setBusy(false)
        return
      }
      const csv = docsToCsv(docs)
      const ts = new Date().toISOString().slice(0, 10)
      const suffix = onlyUnread ? '-unread' : ''
      triggerDownload(`${slug}${suffix}-${ts}.csv`, csv)
      setLastCount(docs.length)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 14px' }}>
      <button
        type="button"
        onClick={() => onExport(false)}
        disabled={busy}
        style={btnStyle(busy)}
      >
        {busy ? 'Exporting…' : '📥 Export all to CSV'}
      </button>
      <button
        type="button"
        onClick={() => onExport(true)}
        disabled={busy}
        style={btnGhost(busy)}
      >
        Export unread only
      </button>
      {lastCount !== null && !error && (
        <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>
          ✓ Downloaded {lastCount} {lastCount === 1 ? 'row' : 'rows'}
        </span>
      )}
      {error && <span style={{ fontSize: 13, color: '#b91c1c', fontWeight: 600 }}>{error}</span>}
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

const btnGhost = (busy: boolean): React.CSSProperties => ({
  padding: '8px 14px',
  borderRadius: 8,
  border: '1px solid transparent',
  background: 'transparent',
  color: '#6b7280',
  fontWeight: 600,
  fontSize: 13,
  cursor: busy ? 'not-allowed' : 'pointer',
  fontFamily: 'inherit',
  textDecoration: 'underline',
})

export default ExportCsvButton
