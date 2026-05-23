'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Reveal } from '@/components/ui/Reveal'
import { PageHeader } from '@/components/ui/PageHeader'
import { TestimonialForm } from '@/components/ui/TestimonialForm'
import type { Testimonial } from '@/types/cms'

const RATINGS = ['5', '4', '3', '2', '1'] as const

export function ReviewsView({ reviews }: { reviews: Testimonial[] }) {
  const [filter, setFilter] = useState<'all' | (typeof RATINGS)[number]>('all')
  const [showForm, setShowForm] = useState(false)

  const filtered = useMemo(() => {
    if (filter === 'all') return reviews
    return reviews.filter(r => r.rating === filter)
  }, [reviews, filter])

  const avg = useMemo(() => {
    if (!reviews.length) return 0
    const total = reviews.reduce((s, r) => s + Number(r.rating), 0)
    return Math.round((total / reviews.length) * 10) / 10
  }, [reviews])

  const counts: Record<string, number> = useMemo(() => {
    const c: Record<string, number> = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 }
    reviews.forEach(r => { c[r.rating] = (c[r.rating] || 0) + 1 })
    return c
  }, [reviews])

  return (
    <>
      <PageHeader
        eyebrow="Customer reviews"
        title="Real customers. Real feedback."
        lede={`${reviews.length} reviews · average ${avg || '—'} / 5. Every one from a real installed customer.`}
        background="navy"
      />

      <section className="section">
        <div className="container" style={{ maxWidth: 1100 }}>
          {/* Summary + filters */}
          <Reveal>
            <div className="reviews-summary">
              <div className="reviews-summary-num">
                <div className="big">{avg || '—'}<span>/ 5</span></div>
                <div className="stars">{'★★★★★'.slice(0, Math.round(avg))}{'☆☆☆☆☆'.slice(Math.round(avg))}</div>
                <div className="cnt">{reviews.length} reviews</div>
              </div>
              <div className="reviews-summary-bars">
                {RATINGS.map(r => {
                  const n = counts[r] || 0
                  const pct = reviews.length ? (n / reviews.length) * 100 : 0
                  return (
                    <button
                      key={r}
                      className={`bar-row ${filter === r ? 'active' : ''}`}
                      onClick={() => setFilter(filter === r ? 'all' : r)}
                      type="button"
                    >
                      <span className="bar-label">{r} ★</span>
                      <span className="bar-track"><span className="bar-fill" style={{ width: `${pct}%` }} /></span>
                      <span className="bar-cnt">{n}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </Reveal>

          {/* Filter chips + Write button */}
          <div className="reviews-toolbar">
            <div className="reviews-chips">
              <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
                All ({reviews.length})
              </button>
              {RATINGS.map(r => (
                <button key={r} className={filter === r ? 'active' : ''} onClick={() => setFilter(r)}>
                  {r} ★ ({counts[r] || 0})
                </button>
              ))}
            </div>
            {!showForm && (
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                <span>Write a review</span> <span className="arrow">→</span>
              </button>
            )}
          </div>

          {/* Inline form when toggled */}
          {showForm && (
            <Reveal style={{ marginBottom: 32 }}>
              <TestimonialForm />
            </Reveal>
          )}

          {/* Reviews grid */}
          {filtered.length === 0 ? (
            <p style={{ textAlign: 'center', padding: 60, color: 'var(--bv-ink-500)' }}>
              No reviews match this filter yet.
            </p>
          ) : (
            <div className="reviews-grid">
              {filtered.map((r, i) => (
                <Reveal key={r.id} className="reviews-card" delay={Math.min(i * 40, 320)}>
                  {r.pinned && <span className="reviews-pin">📌 Pinned</span>}
                  <div className="reviews-stars">{'★'.repeat(Number(r.rating))}<span className="dim">{'★'.repeat(5 - Number(r.rating))}</span></div>
                  <p className="reviews-quote">"{r.review}"</p>
                  <div className="reviews-author">
                    <div className="avatar">{r.customerName.charAt(0).toUpperCase()}</div>
                    <div className="meta">
                      <div className="n">{r.customerName}</div>
                      <div className="l">{r.suburb}{r.systemInstalled ? ` · ${r.systemInstalled}` : ''}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}

          {/* Bottom CTA — back home */}
          <Reveal style={{ marginTop: 56, textAlign: 'center' }}>
            <Link href="/" className="btn btn-ghost"><span>Back to home</span> →</Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
