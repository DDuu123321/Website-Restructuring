'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/api/client'
import { Reveal } from '@/components/ui/Reveal'
import { PageHeader } from '@/components/ui/PageHeader'
import type { QuoteRequest } from '@/types/cms'

const STATES = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT']

export function QuoteView() {
  const params = useSearchParams()
  const presetPack = params.get('pack') || ''

  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState<Partial<QuoteRequest> & { hearAbout?: string; journeyStage?: string }>({
    // Engineering defaults — engineer will refine on call
    propertyType: 'House',
    roofType: 'Tin / Klip-Lok',
    usagePattern: 'mixed',
    components: ['Solar', 'Battery'],
    systemKw: Number(params.get('kw') || 10),
    batteryKwh: 10,
    // User-facing fields
    monthlyBill: Number(params.get('bill') || 350),
    state: 'NSW',
    timeline: 'asap',
    journeyStage: 'considering',
    hearAbout: 'google',
  })

  useEffect(() => {
    if (presetPack === 'starter')    setForm(f => ({ ...f, components: ['Solar'], systemKw: 6.6, batteryKwh: 0 }))
    if (presetPack === 'essential')  setForm(f => ({ ...f, components: ['Solar', 'Battery'], systemKw: 10, batteryKwh: 10 }))
    if (presetPack === 'premium')    setForm(f => ({ ...f, components: ['Solar', 'Battery', 'EV'], systemKw: 13, batteryKwh: 16 }))
    if (presetPack === 'commercial') setForm(f => ({ ...f, propertyType: 'Commercial', components: ['Solar', 'Battery'], systemKw: 50, batteryKwh: 30 }))
  }, [presetPack])

  const update = (patch: Partial<typeof form>) => setForm(f => ({ ...f, ...patch }))

  const submitMutation = useMutation({
    mutationFn: (data: Partial<QuoteRequest>) => api.submitQuote(data),
    onSuccess: () => setSubmitted(true),
  })

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.firstName || !form.email || !form.phone) return
    const { hearAbout, journeyStage, ...rest } = form
    submitMutation.mutate({
      ...rest,
      notes: [
        form.notes,
        journeyStage ? `[Journey] ${journeyStage}` : '',
        hearAbout ? `[Hear about us] ${hearAbout}` : '',
      ].filter(Boolean).join('\n'),
      source: { ...(form.source || {}), packagePreset: presetPack || undefined, referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined },
    })
  }

  // ── Success — "What happens next" card ──
  if (submitted) {
    return (
      <section className="section" style={{ background: 'var(--bv-paper-2)', minHeight: '80vh', paddingTop: 110 }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <Reveal style={{ textAlign: 'center', marginBottom: 32 }}>
            <div className="success-icon">✓</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 40px)', marginBottom: 12 }}>
              Thanks — we've got it.
            </h1>
            <p style={{ color: 'var(--bv-ink-500)', fontSize: 16, lineHeight: 1.6, maxWidth: 560, margin: '0 auto' }}>
              We've received your request. Please also check your inbox (and spam folder) for a confirmation email.
            </p>
          </Reveal>

          <Reveal>
            <div className="next-card">
              <div className="next-eye">What happens next</div>
              <h4>Our engineer will get in touch</h4>
              <p className="next-lede">
                A senior engineer will review your details — roof orientation, usage pattern, state rebates — and prepare a tailored quote.
              </p>
              <ol className="next-steps">
                <li><span className="next-num">1</span><div><strong>Call back within 24 hours</strong><p>Confirm needs, answer questions</p></div></li>
                <li><span className="next-num">2</span><div><strong>On-site or satellite roof survey</strong><p>Free, no obligation</p></div></li>
                <li><span className="next-num">3</span><div><strong>Formal written quote</strong><p>With rebates and payback breakdown</p></div></li>
              </ol>
              <div className="next-callout">
                <span className="next-callout-icon">📞</span>
                <div>
                  <strong>Need to talk now?</strong>
                  <a href="tel:+611300258836">1300 258 836</a>
                </div>
              </div>
            </div>
          </Reveal>

          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link href="/" className="btn btn-ghost"><span>Back to home</span> →</Link>
          </div>
        </div>
      </section>
    )
  }

  // ── Single-page contact form ──
  return (
    <>
      <PageHeader
        eyebrow="Get in touch"
        title="Chat to us"
        lede="Tell us how we can help — a senior engineer will be in touch within 24 hours with a free, no-obligation quote."
        background="cream"
      />

      <section className="section" style={{ paddingTop: 50, paddingBottom: 120 }}>
        <div className="container">
          <div className="quote-shell">
            <Reveal>
              <form className="quote-form simple" onSubmit={onSubmit}>
              <div className="field-grid">
                <div className="field">
                  <label>Name <span className="req">*</span></label>
                  <input type="text" required placeholder="Your name" value={form.firstName || ''} onChange={e => update({ firstName: e.target.value })} />
                </div>
                <div className="field">
                  <label>Email <span className="req">*</span></label>
                  <input type="email" required placeholder="Your email" value={form.email || ''} onChange={e => update({ email: e.target.value })} />
                </div>
                <div className="field">
                  <label>Mobile / Phone <span className="req">*</span></label>
                  <input type="tel" required placeholder="Phone number" value={form.phone || ''} onChange={e => update({ phone: e.target.value })} />
                </div>
                <div className="field">
                  <label>Address</label>
                  <input type="text" placeholder="Your address" value={form.address || ''} onChange={e => update({ address: e.target.value })} />
                </div>
                <div className="field">
                  <label>Postcode <span className="req">*</span></label>
                  <input type="text" required placeholder="Your postcode" value={form.postcode || ''} onChange={e => update({ postcode: e.target.value })} />
                </div>
                <div className="field">
                  <label>State <span className="req">*</span></label>
                  <select value={form.state} onChange={e => update({ state: e.target.value })} required>
                    {STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>

                <div className="field field-full">
                  <label>Do you have any specific questions or special requirements?</label>
                  <textarea rows={3} placeholder="Tell us more about your solar or battery needs…" value={form.notes || ''} onChange={e => update({ notes: e.target.value })} />
                </div>

                <div className="field">
                  <label>How far along are you in your solar journey?</label>
                  <select value={form.journeyStage} onChange={e => update({ journeyStage: e.target.value })}>
                    <option value="just-researching">Just researching</option>
                    <option value="considering">Seriously considering</option>
                    <option value="comparing">Comparing quotes</option>
                    <option value="ready">Ready to buy</option>
                  </select>
                </div>
                <div className="field">
                  <label>How did you hear about us? <span className="req">*</span></label>
                  <select value={form.hearAbout} onChange={e => update({ hearAbout: e.target.value })} required>
                    <option value="google">Google search</option>
                    <option value="social">Social media</option>
                    <option value="friend">Friend / family</option>
                    <option value="advert">Advertisement</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="field">
                  <label>When would you like us to contact you?</label>
                  <select value={form.timeline} onChange={e => update({ timeline: e.target.value })}>
                    <option value="asap">ASAP (business hours)</option>
                    <option value="morning">Mornings (9 am – 12 pm)</option>
                    <option value="afternoon">Afternoons (12 pm – 5 pm)</option>
                    <option value="evening">Evenings (after 5 pm)</option>
                    <option value="weekend">Weekends</option>
                    <option value="email-only">Email only please</option>
                  </select>
                </div>
                <div className="field">
                  <label>How much is your power bill?</label>
                  <div className="slider-inline">
                    <input type="range" min={100} max={2000} step={25} value={form.monthlyBill} onChange={e => update({ monthlyBill: +e.target.value })} />
                    <div className="slider-inline-meta">
                      <span>$100</span>
                      <b>${form.monthlyBill} <span className="slider-period">/ month</span></b>
                      <span>$2,000+</span>
                    </div>
                    <div className="slider-period-hint">
                      Tip: AU power bills come monthly, quarterly or yearly — give us a monthly estimate.
                    </div>
                  </div>
                </div>

                <div className="field field-full quote-consent">
                  By providing your details, you agree we can contact you regarding solar products and electricity plans. We never sell your data.
                  {' '}<Link href="/privacy">Privacy Policy</Link>.
                </div>

                <div className="field field-full quote-submit-row">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitMutation.isPending || !form.firstName || !form.email || !form.phone}
                  >
                    {submitMutation.isPending
                      ? <span>Submitting…</span>
                      : <><span>Submit</span> →</>}
                  </button>
                </div>

                {submitMutation.isError && (
                  <p className="field-full" style={{ color: '#b91c1c', fontSize: 14, marginTop: 4 }}>
                    Submission failed. Please check your details and try again.
                  </p>
                )}
              </div>
              </form>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}
