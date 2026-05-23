'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { api } from '@/api/client'
import { CATALOG, type ConfigOption } from './_catalog'

interface Props { productId: string }

interface Selections {
  solar?: string
  battery?: string
  ev?: string
}

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  suburb: string
  state: string
  postcode: string
  notes: string
}

const STEPS = ['solar', 'battery', 'ev', 'summary'] as const
type StepId = typeof STEPS[number]

export function ConfiguratorView({ productId }: Props) {
  const product = CATALOG[productId]

  const [stepIdx, setStepIdx] = useState(0)
  const [sel, setSel] = useState<Selections>({})
  const [form, setForm] = useState<FormData>({
    firstName: '', lastName: '', email: '', phone: '',
    suburb: '', state: 'NSW', postcode: '', notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!product) return null

  const currentStep = STEPS[stepIdx]

  const optionsForStep = (s: StepId): ConfigOption[] => {
    if (s === 'solar')   return product.solarOptions
    if (s === 'battery') return product.batteryOptions
    if (s === 'ev')      return product.evOptions
    return []
  }

  const stepLabel = (s: StepId): string => {
    if (s === 'solar')   return 'Solar'
    if (s === 'battery') return 'Battery'
    if (s === 'ev')      return 'EV'
    return 'Enquire'
  }

  const stepNum = (s: StepId): string => {
    const i = STEPS.indexOf(s)
    return `0${i + 1}`
  }

  const activeOption: ConfigOption | null = useMemo(() => {
    if (currentStep === 'summary') return null
    const id = sel[currentStep]
    if (!id) return optionsForStep(currentStep)[0]
    return optionsForStep(currentStep).find(o => o.id === id) ?? null
  }, [currentStep, sel, product])

  const heroImg = useMemo(() => {
    if (currentStep === 'summary') return product.hero
    return activeOption?.hero || product.hero
  }, [activeOption, currentStep, product])

  const select = (id: string) => {
    setSel(prev => ({ ...prev, [currentStep]: id }))
  }

  const next = () => {
    if (stepIdx < STEPS.length - 1) {
      setStepIdx(stepIdx + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
  const prev = () => {
    if (stepIdx > 0) {
      setStepIdx(stepIdx - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const canContinue = currentStep === 'summary'
    ? !!(form.firstName && form.email && form.phone)
    : !!sel[currentStep]

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!canContinue || submitting) return
    setSubmitting(true)
    setError(null)

    const solarOpt   = product.solarOptions.find(o => o.id === sel.solar)
    const batteryOpt = product.batteryOptions.find(o => o.id === sel.battery)
    const evOpt      = product.evOptions.find(o => o.id === sel.ev)

    const components: Array<'Solar' | 'Battery' | 'EV'> = ['Solar', 'Battery']
    if (evOpt && evOpt.id !== 'no-ev') components.push('EV')

    const cfgLines = [
      `Product line: ${product.brand} ${product.name}`,
      `· Solar:   ${solarOpt?.title   || 'n/a'}`,
      `· Battery: ${batteryOpt?.title || 'n/a'}`,
      `· EV:      ${evOpt?.title      || 'n/a'}`,
      form.notes ? `\nCustomer notes:\n${form.notes}` : '',
    ].filter(Boolean).join('\n')

    try {
      await api.submitQuote({
        firstName: form.firstName,
        lastName:  form.lastName,
        email:     form.email,
        phone:     form.phone,
        suburb:    form.suburb,
        state:     form.state,
        postcode:  form.postcode,
        components,
        systemKw:    solarOpt?.systemKw,
        batteryKwh:  batteryOpt?.batteryKwh,
        notes:       cfgLines,
        source:      { packagePreset: productId },
      })
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Submission failed'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Submitted view ──────────────────────────────────────
  if (submitted) {
    return (
      <section className="cfg-success">
        <div className="container">
          <div className="cfg-success-card">
            <div className="cfg-success-icon">✓</div>
            <h1>Configuration received</h1>
            <p>Our engineer will reach out within 24 hours with a tailored recommendation and final quote, factoring in your roof, usage and state rebates.</p>
            <div className="cfg-success-cta">
              <Link className="btn btn-primary" href="/">
                <span>Back to home</span> <span className="arrow">→</span>
              </Link>
              <Link className="btn btn-ghost" href="/products">
                <span>View other products</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // ── Configurator view ───────────────────────────────────
  return (
    <div className="cfg-shell">
      {/* Top bar — back link + brand + product name */}
      <header className="cfg-top">
        <div className="container cfg-top-inner">
          <Link href="/products" className="cfg-back">
            <span aria-hidden>←</span>
            <span>Back to products</span>
          </Link>
          <div className="cfg-brand">
            <img src={product.brandLogo} alt={product.brand} loading="lazy" />
            <div>
              <span className="cfg-brand-eye">Configure your system</span>
              <h1>{product.name}</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Step indicator */}
      <nav className="cfg-steps" aria-label="Configuration progress">
        <div className="container cfg-steps-inner">
          {STEPS.map((s, i) => {
            const isActive = i === stepIdx
            const isDone = i < stepIdx
            return (
              <button
                key={s}
                type="button"
                className={`cfg-step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
                onClick={() => i <= stepIdx && setStepIdx(i)}
                disabled={i > stepIdx}
              >
                <span className="cfg-step-n">{stepNum(s)}</span>
                <span className="cfg-step-l">{stepLabel(s)}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Main 2-col area */}
      <div className="cfg-main">
        <div className="container cfg-main-grid">
          {/* Left: hero image (changes per option) */}
          <div className="cfg-hero">
            <div className="cfg-hero-frame">
              <div
                className="cfg-hero-img"
                style={{ backgroundImage: `url(${heroImg})` }}
                key={heroImg}
              />
              <div className="cfg-hero-overlay" />
              <div className="cfg-hero-tag">
                {currentStep === 'summary'
                  ? product.name
                  : activeOption ? activeOption.title : ''}
              </div>
            </div>
            <p className="cfg-hero-tagline">{product.tagline}</p>
          </div>

          {/* Right: options OR enquiry form */}
          <div className="cfg-side">
            {currentStep !== 'summary' ? (
              <>
                <div className="cfg-side-eye">{stepNum(currentStep)} · {stepLabel(currentStep)}</div>
                <h2 className="cfg-side-h">
                  {currentStep === 'solar'   && 'Choose your panels'}
                  {currentStep === 'battery' && 'Choose battery capacity'}
                  {currentStep === 'ev'      && 'Add EV charging?'}
                </h2>
                <p className="cfg-side-lede">
                  {currentStep === 'solar'   && 'Tier-1 modules with 25-year performance warranty.'}
                  {currentStep === 'battery' && 'AlphaESS S5 modular storage, 10-year warranty.'}
                  {currentStep === 'ev'      && 'Optional — Tesla Wall Connector with solar-aware charging.'}
                </p>

                <ul className="cfg-options">
                  {optionsForStep(currentStep).map(opt => {
                    const active = sel[currentStep] === opt.id
                    return (
                      <li key={opt.id}>
                        <button
                          type="button"
                          className={`cfg-opt ${active ? 'active' : ''}`}
                          onClick={() => select(opt.id)}
                        >
                          <div className="cfg-opt-img" style={{ backgroundImage: `url(${opt.img})` }} aria-hidden />
                          <div className="cfg-opt-body">
                            <div className="cfg-opt-title">{opt.title}</div>
                            <div className="cfg-opt-spec">{opt.spec}</div>
                            <ul className="cfg-opt-bullets">
                              {opt.bullets.map((b, i) => <li key={i}>{b}</li>)}
                            </ul>
                          </div>
                          <span className="cfg-opt-radio" aria-hidden>
                            <span className="dot" />
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </>
            ) : (
              <>
                <div className="cfg-side-eye">04 · Enquire</div>
                <h2 className="cfg-side-h">
                  Submit & we call you back within 24h
                </h2>
                <p className="cfg-side-lede">
                  Our engineer will calibrate this configuration to your roof, usage and local rebates — then send a final quote.
                </p>

                <div className="cfg-sum">
                  {[
                    { eye: 'Solar',   opt: product.solarOptions.find(o => o.id === sel.solar) },
                    { eye: 'Battery', opt: product.batteryOptions.find(o => o.id === sel.battery) },
                    { eye: 'EV',      opt: product.evOptions.find(o => o.id === sel.ev) },
                  ].map((s, i) => (
                    <div key={i} className="cfg-sum-chip">
                      <span className="cfg-sum-eye">{s.eye}</span>
                      <span className="cfg-sum-val">{s.opt ? s.opt.title : '—'}</span>
                    </div>
                  ))}
                </div>

                <form className="cfg-form" onSubmit={submit}>
                  <div className="cfg-form-row">
                    <label>
                      <span>First name *</span>
                      <input type="text" required className="bv-input" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                    </label>
                    <label>
                      <span>Last name</span>
                      <input type="text" className="bv-input" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                    </label>
                  </div>
                  <div className="cfg-form-row">
                    <label>
                      <span>Email *</span>
                      <input type="email" required className="bv-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                    </label>
                    <label>
                      <span>Phone *</span>
                      <input type="tel" required className="bv-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                    </label>
                  </div>
                  <div className="cfg-form-row cfg-form-row-3">
                    <label>
                      <span>Suburb</span>
                      <input type="text" className="bv-input" value={form.suburb} onChange={e => setForm({ ...form, suburb: e.target.value })} />
                    </label>
                    <label>
                      <span>State</span>
                      <select className="bv-select" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}>
                        {['NSW','VIC','QLD','SA','WA','TAS','ACT','NT'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </label>
                    <label>
                      <span>Postcode</span>
                      <input type="text" className="bv-input" value={form.postcode} onChange={e => setForm({ ...form, postcode: e.target.value })} />
                    </label>
                  </div>
                  <label className="cfg-form-full">
                    <span>Notes (optional)</span>
                    <textarea rows={3} className="bv-textarea" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                  </label>
                  {error && <div className="cfg-error">{error}</div>}
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sticky bottom bar — selection chips + actions */}
      <footer className="cfg-bottom">
        <div className="container cfg-bottom-inner">
          <div className="cfg-bottom-l">
            {(['solar', 'battery', 'ev'] as StepId[]).map(s => {
              const opt = optionsForStep(s).find(o => o.id === sel[s])
              if (!opt) return null
              return (
                <div key={s} className="cfg-bottom-chip">
                  <span className="cfg-bottom-eye">{stepLabel(s)}</span>
                  <span className="cfg-bottom-val">{opt.title}</span>
                </div>
              )
            })}
          </div>

          <div className="cfg-bottom-r">
            {stepIdx > 0 && (
              <button type="button" className="btn btn-ghost cfg-bottom-back" onClick={prev}>
                <span>Back</span>
              </button>
            )}
            {currentStep === 'summary' ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => submit()}
                disabled={!canContinue || submitting}
              >
                <span>{submitting ? 'Submitting…' : 'Submit enquiry'}</span>
                <span className="arrow">→</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={next}
                disabled={!canContinue}
              >
                <span>Continue</span>
                <span className="arrow">→</span>
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
