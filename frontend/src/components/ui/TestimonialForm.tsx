'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useI18n } from '@/i18n/I18nProvider'
import { api } from '@/api/client'

type Status = 'idle' | 'submitting' | 'success' | 'error'

interface Props {
  /** When set, a "View all reviews" button is shown next to the "Write a review" toggle. */
  viewMoreHref?: string
}

export function TestimonialForm({ viewMoreHref }: Props = {}) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [form, setForm] = useState({
    customerName: '',
    suburb: '',
    rating: '5',
    review: '',
    systemInstalled: '',
  })

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'submitting') return
    setStatus('submitting')
    setErrorMsg(null)
    try {
      await api.submitTestimonial({
        customerName: form.customerName.trim(),
        suburb: form.suburb.trim(),
        rating: form.rating as any,
        review: form.review.trim(),
        systemInstalled: form.systemInstalled.trim() || undefined,
      } as any)
      setStatus('success')
      setForm({ customerName: '', suburb: '', rating: '5', review: '', systemInstalled: '' })
    } catch (err: any) {
      setErrorMsg(err?.message || null)
      setStatus('error')
    }
  }

  return (
    <div className="bv-review-wrap">
      {!open && (
        <div className="bv-review-buttons">
          <button type="button" className="btn btn-primary bv-review-toggle" onClick={() => setOpen(true)}>
            <span>{t('review.toggleOpen')}</span> <span className="arrow">→</span>
          </button>
          {viewMoreHref && (
            <Link className="btn btn-ghost" href={viewMoreHref}>
              <span>{t('review.viewAll')}</span> <span className="arrow">→</span>
            </Link>
          )}
        </div>
      )}

      {open && (
        <div className="bv-review-card">
          <div className="bv-review-head">
            <div>
              <div className="text-eyebrow">{t('review.share')}</div>
              <p className="bv-review-lede">{t('review.lede')}</p>
            </div>
            <button type="button" className="bv-review-close" onClick={() => setOpen(false)} aria-label="Close">
              {t('review.toggleClose')} ✕
            </button>
          </div>

          {status === 'success' ? (
            <div className="bv-review-success">
              <div className="bv-review-success-mark">✓</div>
              <p>{t('review.success')}</p>
              <button type="button" className="btn btn-ghost" onClick={() => { setStatus('idle'); setOpen(false) }}>
                <span>OK</span>
              </button>
            </div>
          ) : (
            <form className="bv-review-form" onSubmit={onSubmit}>
              <div className="bv-review-row">
                <div>
                  <label className="bv-label" htmlFor="rv-name">{t('review.name')} *</label>
                  <input id="rv-name" className="bv-input" required value={form.customerName} onChange={update('customerName')} />
                </div>
                <div>
                  <label className="bv-label" htmlFor="rv-suburb">{t('review.suburb')} *</label>
                  <input id="rv-suburb" className="bv-input" required value={form.suburb} onChange={update('suburb')} />
                </div>
              </div>

              <div className="bv-review-row">
                <div>
                  <label className="bv-label" htmlFor="rv-rating">{t('review.rating')} *</label>
                  <select id="rv-rating" className="bv-select" value={form.rating} onChange={update('rating')}>
                    <option value="5">★★★★★ (5)</option>
                    <option value="4">★★★★☆ (4)</option>
                    <option value="3">★★★☆☆ (3)</option>
                    <option value="2">★★☆☆☆ (2)</option>
                    <option value="1">★☆☆☆☆ (1)</option>
                  </select>
                </div>
                <div>
                  <label className="bv-label" htmlFor="rv-system">{t('review.system')}</label>
                  <input id="rv-system" className="bv-input" placeholder="e.g. 13 kW solar + 15 kWh battery" value={form.systemInstalled} onChange={update('systemInstalled')} />
                </div>
              </div>

              <div>
                <label className="bv-label" htmlFor="rv-review">{t('review.text')} *</label>
                <textarea id="rv-review" className="bv-textarea" required minLength={10} rows={4} value={form.review} onChange={update('review')} />
              </div>

              {status === 'error' && (
                <div className="bv-review-error">{errorMsg || t('review.error')}</div>
              )}

              <div className="bv-review-actions">
                <button type="submit" className="btn btn-primary" disabled={status === 'submitting'}>
                  <span>{status === 'submitting' ? t('review.submitting') : t('review.submit')}</span>
                  {status !== 'submitting' && <span className="arrow">→</span>}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
