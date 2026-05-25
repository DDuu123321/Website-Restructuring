/**
 * UnreadBadges — appears above the side-nav on every admin page.
 *
 * Polls the three lead collections every 30s for documents still marked
 * `status: new` and shows a count pill for each. Clicking a pill jumps
 * to that collection's list view, pre-filtered to the unread set.
 *
 * Wired via `admin.components.beforeNavLinks` in payload.config.ts.
 */

import React, { useEffect, useState } from 'react'

type Counts = { quotes: number; assessments: number; testimonials: number }

const POLL_INTERVAL_MS = 30_000

async function fetchCount(slug: string): Promise<number> {
  try {
    const res = await fetch(
      `/api/${slug}?where[status][equals]=new&limit=0&depth=0`,
      { credentials: 'include' },
    )
    if (!res.ok) return 0
    const body = (await res.json()) as { totalDocs?: number }
    return typeof body?.totalDocs === 'number' ? body.totalDocs : 0
  } catch {
    return 0
  }
}

const Badge: React.FC<{ label: string; count: number; href: string }> = ({
  label, count, href,
}) => {
  const hot = count > 0
  return (
    <a
      href={href}
      title={`${count} unread ${label.toLowerCase()}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        padding: '8px 12px',
        borderRadius: 8,
        background: hot ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.04)',
        border: `1px solid ${hot ? 'rgba(239, 68, 68, 0.32)' : 'rgba(255, 255, 255, 0.06)'}`,
        textDecoration: 'none',
        color: 'inherit',
        fontSize: 12.5,
        fontWeight: 600,
        letterSpacing: '0.02em',
        transition: 'background 0.15s ease, border-color 0.15s ease',
      }}
    >
      <span style={{ opacity: hot ? 1 : 0.7 }}>{label}</span>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 22,
          height: 20,
          padding: '0 6px',
          borderRadius: 999,
          background: hot ? '#ef4444' : 'rgba(255, 255, 255, 0.10)',
          color: hot ? '#fff' : 'rgba(255, 255, 255, 0.55)',
          fontSize: 11.5,
          fontWeight: 800,
          lineHeight: 1,
        }}
      >
        {count}
      </span>
    </a>
  )
}

const UnreadBadges: React.FC = () => {
  const [counts, setCounts] = useState<Counts>({ quotes: 0, assessments: 0, testimonials: 0 })

  useEffect(() => {
    let alive = true
    const refresh = async () => {
      const [q, a, t] = await Promise.all([
        fetchCount('quotes'),
        fetchCount('assessments'),
        fetchCount('testimonials'),
      ])
      if (!alive) return
      setCounts({ quotes: q, assessments: a, testimonials: t })
    }
    refresh()
    const id = window.setInterval(refresh, POLL_INTERVAL_MS)
    const onFocus = () => refresh()
    window.addEventListener('focus', onFocus)
    return () => {
      alive = false
      window.clearInterval(id)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  const total = counts.quotes + counts.assessments + counts.testimonials

  return (
    <div
      style={{
        margin: '0 0 20px',
        padding: '14px 16px',
        borderRadius: 10,
        background: 'rgba(255, 255, 255, 0.025)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div
        style={{
          fontSize: 10.5,
          fontWeight: 800,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          opacity: 0.55,
          marginBottom: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span>🔔 Unread leads</span>
        {total > 0 && (
          <span style={{ color: '#ef4444', fontWeight: 900 }}>· {total}</span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Badge label="Quotes"      count={counts.quotes}        href="/admin/collections/quotes?where[status][equals]=new" />
        <Badge label="Assessments" count={counts.assessments}   href="/admin/collections/assessments?where[status][equals]=new" />
        <Badge label="Reviews"     count={counts.testimonials}  href="/admin/collections/testimonials?where[status][equals]=new" />
      </div>
    </div>
  )
}

export default UnreadBadges
