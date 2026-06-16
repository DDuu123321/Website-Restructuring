import Link from 'next/link'
import { PageHeader } from '@/components/ui/PageHeader'
import { Reveal } from '@/components/ui/Reveal'
import type { RebatesPage, RebateScheme } from '@/types/cms'

const STATUS: Record<RebateScheme['status'], { label: string; cls: string }> = {
  open: { label: 'Open now', cls: 'rb-st-open' },
  changing: { label: 'Open · rules changing', cls: 'rb-st-changing' },
  closing: { label: 'Phasing out by 2030', cls: 'rb-st-closing' },
  ongoing: { label: 'Year-round', cls: 'rb-st-ongoing' },
  closed: { label: 'State scheme closed', cls: 'rb-st-closed' },
}

function ApplyIcon({ t }: { t: RebateScheme['appliesTo'] }) {
  const p = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  if (t === 'solar')
    return <svg {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M16.9 16.9l2.1 2.1M4.9 19.1l2.1-2.1M16.9 7.1l2.1-2.1" /></svg>
  if (t === 'finance')
    return <svg {...p}><path d="M3 21V8l9-5 9 5v13" /><path d="M3 21h18M8 21v-6h8v6" /></svg>
  if (t === 'both')
    return <svg {...p}><path d="M13 2L4 14h6l-1 8 9-12h-6z" /></svg>
  return <svg {...p}><rect x="5" y="6" width="14" height="14" rx="2" /><path d="M9 3h6v3M9 14l2 2 4-4" /></svg>
}

function ClockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
    </svg>
  )
}

export function RebatesView({ data }: { data: RebatesPage }) {
  const hero = data?.hero || {}
  const intro = data?.intro || {}
  const schemes = data?.schemes || []
  const process = data?.process || {}
  const steps = process.steps || []
  const urgency = data?.urgency || {}
  const cta = data?.cta || {}

  return (
    <>
      <PageHeader
        eyebrow={hero.eyebrow || 'Government Rebates & Incentives'}
        title={hero.heading || 'Let government rebates do the heavy lifting'}
        lede={hero.lede || "Federal and state programs can take a serious chunk off the cost of going solar and adding a battery — here's what's on offer, and how we handle every form."}
      />

      {/* Intro */}
      {(intro.heading || intro.body) && (
        <section className="section rb-intro">
          <div className="container">
            <Reveal className="rb-intro-inner">
              {data?.lastUpdated && (
                <span className="rb-updated">Last reviewed {data.lastUpdated}</span>
              )}
              {intro.heading && <h2 className="rb-intro-h">{intro.heading}</h2>}
              {intro.body && <p className="rb-intro-body">{intro.body}</p>}
            </Reveal>
          </div>
        </section>
      )}

      {/* Schemes */}
      {schemes.length > 0 && (
        <section className="section rb-schemes">
          <div className="container">
            <span className="text-eyebrow rb-center-eye">What's available in 2026</span>
            <h2 className="rb-section-h">Federal and state support, side by side</h2>
            <div className="rb-grid">
              {schemes.map((s, i) => {
                const st = STATUS[s.status] || STATUS.open
                const elig = (s.eligibility || []).filter(e => e?.point)
                return (
                  <Reveal key={s.id || i} className="rb-card" delay={(i % 3) * 80}>
                    <div className="rb-card-top">
                      <span className="rb-tag">{s.tag}</span>
                      <span className={`rb-status ${st.cls}`}>{st.label}</span>
                    </div>
                    <h3 className="rb-card-name">
                      <span className="rb-card-ico" aria-hidden><ApplyIcon t={s.appliesTo} /></span>
                      {s.name}
                    </h3>
                    {s.summary && <p className="rb-card-summary">{s.summary}</p>}
                    {elig.length > 0 && (
                      <ul className="rb-elig">
                        {elig.map((e, j) => (
                          <li key={j}>
                            <span className="rb-elig-check" aria-hidden>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            </span>
                            <span>{e.point}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {s.timing && (
                      <div className="rb-timing">
                        <ClockIcon />
                        <span>{s.timing}</span>
                      </div>
                    )}
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Process */}
      {(process.heading || steps.length > 0) && (
        <section className="section rb-process">
          <div className="container">
            <div className="rb-process-head">
              {process.heading && <h2 className="rb-section-h">{process.heading}</h2>}
              {process.lede && <p className="rb-process-lede">{process.lede}</p>}
            </div>
            {steps.length > 0 && (
              <div className="rb-steps">
                {steps.map((s, i) => (
                  <Reveal key={i} className="rb-step" delay={i * 70}>
                    <span className="rb-step-n">{i + 1}</span>
                    <div>
                      {s.title && <h4>{s.title}</h4>}
                      {s.desc && <p>{s.desc}</p>}
                    </div>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Urgency */}
      {(urgency.heading || urgency.body) && (
        <section className="rb-urgency">
          <div className="container">
            <Reveal className="rb-urgency-inner">
              <span className="rb-urgency-ico" aria-hidden><ClockIcon /></span>
              <div>
                {urgency.heading && <h3>{urgency.heading}</h3>}
                {urgency.body && <p>{urgency.body}</p>}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section rb-cta">
        <div className="container">
          <Reveal className="rb-cta-inner">
            <h2>{cta.heading || 'Find out exactly what you qualify for'}</h2>
            <p>{cta.body || 'Tell us your address and what you\'re after, and a Bluven engineer will confirm the precise rebates you\'re eligible for — with the exact figures set out in your written quote.'}</p>
            <Link className="btn btn-primary" href="/quote">
              <span>{cta.buttonLabel || 'Get my free rebate check'}</span> <span className="arrow">→</span>
            </Link>
            <p className="rb-cta-fine">No obligation. We confirm your eligibility before you commit to anything.</p>
          </Reveal>
        </div>
      </section>
    </>
  )
}
