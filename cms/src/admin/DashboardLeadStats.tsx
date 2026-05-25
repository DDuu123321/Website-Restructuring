/**
 * DashboardLeadStats — prominent unread-leads panel at the top of the
 * admin dashboard. Mirrors the sidebar UnreadBadges but bigger and
 * more visible so you see the numbers immediately on login.
 *
 * Wired via `admin.components.beforeDashboard` in payload.config.ts.
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

const StatCard: React.FC<{
  label: string
  count: number
  href: string
  emoji: string
}> = ({ label, count, href, emoji }) => {
  const hot = count > 0
  return (
    <a
      href={href}
      style={{
        flex: '1 1 0',
        minWidth: 200,
        padding: '20px 22px',
        borderRadius: 12,
        background: hot ? 'rgba(239, 68, 68, 0.08)' : '#fff',
        border: `1px solid ${hot ? 'rgba(239, 68, 68, 0.4)' : '#e5e7eb'}`,
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        boxShadow: hot
          ? '0 2px 12px rgba(239, 68, 68, 0.12)'
          : '0 1px 2px rgba(13, 31, 60, 0.04)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 28, lineHeight: 1 }}>{emoji}</span>
        <div>
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: hot ? '#b91c1c' : '#6b7280',
              marginBottom: 4,
            }}
          >
            Unread {label}
          </div>
          <div
            style={{
              fontSize: 13,
              color: hot ? '#991b1b' : '#9ca3af',
              fontWeight: 500,
            }}
          >
            {hot ? 'Needs your attention' : 'All caught up'}
          </div>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 56,
          height: 44,
          padding: '0 14px',
          borderRadius: 12,
          background: hot ? '#ef4444' : '#f3f4f6',
          color: hot ? '#fff' : '#9ca3af',
          fontSize: 22,
          fontWeight: 900,
          lineHeight: 1,
        }}
      >
        {count}
      </div>
    </a>
  )
}

const DashboardLeadStats: React.FC = () => {
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
    <div style={{ margin: '0 0 32px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 14,
        }}
      >
        <span style={{ fontSize: 18 }}>🔔</span>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>
          Unread leads
        </h2>
        {total > 0 ? (
          <span
            style={{
              padding: '2px 10px',
              borderRadius: 999,
              background: '#fee2e2',
              color: '#b91c1c',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {total} pending
          </span>
        ) : (
          <span style={{ fontSize: 13, color: '#9ca3af' }}>· All caught up</span>
        )}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
        <StatCard
          label="Quotes"
          emoji="💬"
          count={counts.quotes}
          href="/admin/collections/quotes?where[status][equals]=new"
        />
        <StatCard
          label="Assessments"
          emoji="🧠"
          count={counts.assessments}
          href="/admin/collections/assessments?where[status][equals]=new"
        />
        <StatCard
          label="Reviews"
          emoji="⭐"
          count={counts.testimonials}
          href="/admin/collections/testimonials?where[status][equals]=new"
        />
      </div>
    </div>
  )
}

export default DashboardLeadStats
