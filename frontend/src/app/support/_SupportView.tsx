'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/api/client'
import { Reveal } from '@/components/ui/Reveal'
import { PageHeader } from '@/components/ui/PageHeader'
import { HoneypotField } from '@/components/ui/HoneypotField'
import type { SupportRequest } from '@/types/cms'

const STATES = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT']

// Values must match the CMS enum (cms/src/hooks/sendSupportEmails.ts).
const ISSUE_TYPES = [
  { value: 'no-production',  label: 'System not producing' },
  { value: 'inverter-fault', label: 'Inverter fault or error code' },
  { value: 'battery',        label: 'Battery issue' },
  { value: 'monitoring',     label: 'App or monitoring offline' },
  { value: 'ev-charger',     label: 'EV charger issue' },
  { value: 'warranty',       label: 'Warranty claim' },
  { value: 'delivery',       label: 'Installation or delivery follow-up' },
  { value: 'other',          label: 'Other' },
]

type Form = Partial<SupportRequest>

export function SupportView() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState<Form>({ state: 'NSW', issueType: 'no-production' })

  const update = (patch: Form) => setForm(f => ({ ...f, ...patch }))

  const submitMutation = useMutation({
    mutationFn: (data: SupportRequest) => api.submitSupport(data),
    onSuccess: () => setSubmitted(true),
  })

  const canSubmit = !!(form.firstName && form.email && form.phone && form.postcode && form.issueType && form.description)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    submitMutation.mutate({
      ...(form as SupportRequest),
      source: { referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined },
    })
  }

  // ── Success ──
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
              Your request has gone to our team. Please check your inbox (and spam folder) for a confirmation email.
            </p>
          </Reveal>

          <Reveal>
            <div className="next-card">
              <div className="next-eye">What happens next</div>
              <h4>Our team will reply by email</h4>
              <p className="next-lede">
                If you have photos of the issue, an error code or anything else that helps, just reply to the
                confirmation email — it goes straight to the team handling your request.
              </p>
            </div>
          </Reveal>

          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link href="/" className="btn btn-ghost"><span>Back to home</span> →</Link>
          </div>
        </div>
      </section>
    )
  }

  // ── Form ──
  return (
    <>
      <PageHeader
        eyebrow="After-sales support"
        title="Something not right with your system?"
        lede="Tell us what's happening and our technical team will get back to you by email. For installation or delivery follow-ups, pick that option below and it goes straight to our operations team."
        background="cream"
      />

      <section className="section" style={{ paddingTop: 50, paddingBottom: 120 }}>
        <div className="container">
          <div className="quote-shell">
            <Reveal>
              <form className="quote-form simple" onSubmit={onSubmit}>
              <HoneypotField value={form.hp || ''} onChange={v => update({ hp: v })} />
              <div className="field-grid">
                <div className="field">
                  <label htmlFor="s-name">Name <span className="req">*</span></label>
                  <input id="s-name" type="text" required placeholder="Your name" value={form.firstName || ''} onChange={e => update({ firstName: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="s-email">Email <span className="req">*</span></label>
                  <input id="s-email" type="email" required placeholder="Your email" value={form.email || ''} onChange={e => update({ email: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="s-phone">Mobile / Phone <span className="req">*</span></label>
                  <input id="s-phone" type="tel" required placeholder="Phone number" value={form.phone || ''} onChange={e => update({ phone: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="s-address">Installation address</label>
                  <input id="s-address" type="text" placeholder="Where the system is installed" value={form.address || ''} onChange={e => update({ address: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="s-postcode">Postcode <span className="req">*</span></label>
                  <input id="s-postcode" type="text" required inputMode="numeric" placeholder="Your postcode" value={form.postcode || ''} onChange={e => update({ postcode: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="s-state">State <span className="req">*</span></label>
                  <select id="s-state" value={form.state} onChange={e => update({ state: e.target.value })} required>
                    {STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="s-issue">What's the issue? <span className="req">*</span></label>
                  <select id="s-issue" value={form.issueType} onChange={e => update({ issueType: e.target.value })} required>
                    {ISSUE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="s-product">Product / brand</label>
                  <input id="s-product" type="text" maxLength={200} placeholder="e.g. Sigenergy inverter, AlphaESS battery" value={form.product || ''} onChange={e => update({ product: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="s-installed">Approx. install date</label>
                  <input id="s-installed" type="text" maxLength={100} placeholder="e.g. March 2025" value={form.installedWhen || ''} onChange={e => update({ installedWhen: e.target.value })} />
                </div>

                <div className="field field-full">
                  <label htmlFor="s-description">Describe the issue <span className="req">*</span></label>
                  <textarea id="s-description" rows={5} required maxLength={5000} placeholder="What's happening, since when, and any error codes you can see…" value={form.description || ''} onChange={e => update({ description: e.target.value })} />
                </div>

                <div className="field field-full quote-consent">
                  We'll use these details only to look into your request and reply to you.
                  {' '}<Link href="/privacy">Privacy Policy</Link>.
                </div>

                <div className="field field-full quote-submit-row">
                  <button type="submit" className="btn btn-primary" disabled={submitMutation.isPending || !canSubmit}>
                    {submitMutation.isPending
                      ? <span>Submitting…</span>
                      : <><span>Send to our team</span> →</>}
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
