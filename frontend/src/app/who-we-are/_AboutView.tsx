'use client'

import Link from 'next/link'
import { Reveal } from '@/components/ui/Reveal'
import { PageHeader } from '@/components/ui/PageHeader'

export function AboutView() {
  const accreditations = [
    'SAA Accreditation',
    'CPEng Certified',
    'AlphaESS Partner',
    'SEC Member',
    'CEC Member',
  ]

  const values = [
    'Engineering First',
    'Quality Over Price',
    'Long-Term Performance',
    'Customer-Centric Solutions',
  ]

  const loopTeams: Array<{ icon: 'pen' | 'wrench' | 'phone'; title: string; action: string; roles: string }> = [
    {
      icon: 'pen',
      title: 'Engineering Team',
      action: 'Design the system',
      roles: 'Design · Quotation · Solutions · System Optimization',
    },
    {
      icon: 'wrench',
      title: 'Project Delivery Team',
      action: 'Execute the system',
      roles: 'Procurement · Scheduling · Delivery · Risk Assessment',
    },
    {
      icon: 'phone',
      title: 'Customer Support Team',
      action: 'Maintain the system',
      roles: 'Monitoring · Diagnostics · Troubleshooting · After-Sales Support',
    },
  ]

  const reasons = [
    {
      title: 'Engineer-Led Solutions',
      desc: 'Every system is designed by qualified engineers — not sales templates.',
    },
    {
      title: 'Premium Product Selection',
      desc: 'We only work with Tier 1 manufacturers to ensure reliability and performance.',
    },
    {
      title: 'Australia-Wide Network',
      desc: 'Certified installers across Australia ensuring consistent quality.',
    },
    {
      title: 'Customized ROI-Focused',
      desc: 'We optimize systems based on your energy usage and return on investment.',
    },
    {
      title: 'End-to-End Service',
      desc: 'From consultation to installation and ongoing support.',
    },
    {
      title: 'Strong Manufacturer Partnerships',
      desc: 'We work closely with leading manufacturers to ensure reliable products, better support, and long-term system performance.',
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="About Us"
        title="Who We Are"
        lede="Bluven Energy is an Australian-based solar and battery solutions provider delivering premium, engineer-led solar and battery energy storage systems across multiple states."
      />

      {/* Intro continuation */}
      <section className="section" style={{ background: 'var(--bv-white)', paddingTop: 48, paddingBottom: 48 }}>
        <div className="container" style={{ maxWidth: 920 }}>
          <Reveal>
            <p style={{ fontSize: 17, lineHeight: 1.75, color: 'var(--bv-ink-700)', margin: '0 0 18px' }}>
              Our solutions are designed by qualified engineers led by a CPEng-certified team, ensuring every solar and battery energy storage system is technically sound, financially optimised, and built for long-term performance.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.75, color: 'var(--bv-ink-700)', margin: 0 }}>
              We specialise in delivering high-quality solar and battery energy storage systems for homeowners who prioritise performance, reliability, and professional service.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Accreditations strip */}
      <section className="accred-strip">
        <div className="container">
          <div className="accred-row">
            {accreditations.map((label, i) => (
              <div className="accred-item" key={i}>
                <span className="accred-dot" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Drives Us */}
      <section className="section" style={{ background: 'var(--bv-white)' }}>
        <div className="container">
          <div className="story-grid">
            <Reveal>
              <span className="text-eyebrow">What Drives Us</span>
              <h2 style={{ fontSize: 'clamp(28px, 3.4vw, 44px)', margin: '12px 0 24px', letterSpacing: '-0.02em' }}>
                We are not a typical solar retailer.
              </h2>

              <div className="quote-card">
                <p>
                  &quot;We&apos;re an engineering-led team delivering real, customised energy solutions that empower our customers to take control of their own power. It&apos;s not just about reducing electricity bills — it&apos;s about achieving true energy independence.&quot;
                </p>
                <p>
                  &quot;With us, you&apos;re investing in expertise, quality, and outcomes that deliver far more value than the price you pay.&quot;
                </p>
              </div>

              <h4 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 14,
                fontWeight: 800,
                color: 'var(--bv-ink-900)',
                margin: '0 0 14px',
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
              }}>
                Our Values
              </h4>
              <div className="values-chips">
                {values.map((v, i) => (
                  <span className="value-chip" key={i}>{v}</span>
                ))}
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="mv-card">
                <h4>Our Mission</h4>
                <p>
                  To shift our customers from paying for energy to owning it, giving them full control, long-term savings, and true energy independence.
                </p>
              </div>
              <div className="mv-card">
                <h4>Our Vision</h4>
                <p>
                  To become a leading engineering-driven clean energy provider in Australia.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Closed-Loop Bluven — circular ring layout (preserved from original site) */}
      <section className="section closed-loop-section">
        <div className="container">
          <Reveal style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
            <span className="text-eyebrow">Closed-Loop Bluven</span>
            <h2 className="section-h" style={{ margin: '12px auto 14px', textAlign: 'center' }}>
              Interconnected Expert Teams
            </h2>
            <p className="section-lede" style={{ margin: '0 auto', textAlign: 'center' }}>
              Our three core teams operate as one continuous system — working together to design, deliver, and support every project with precision and long-term performance in mind.
            </p>
          </Reveal>

          {/* Mobile / tablet: vertical stack */}
          <div className="loop-stack">
            {loopTeams.map((team, i) => (
              <Reveal key={i} className="loop-card" delay={i * 100}>
                <LoopCardBody team={team} />
              </Reveal>
            ))}
          </div>

          {/* Desktop (≥1024px): circular ring with center hub */}
          <div className="loop-ring" aria-hidden={false}>
            <div className="loop-ring-orbit" aria-hidden />
            <div className="loop-ring-hub">
              <svg className="loop-ring-hub-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              <span>BLUVEN</span>
            </div>
            <div className="loop-ring-card pos-top"><LoopCardBody team={loopTeams[0]} /></div>
            <div className="loop-ring-card pos-br"><LoopCardBody team={loopTeams[1]} /></div>
            <div className="loop-ring-card pos-bl"><LoopCardBody team={loopTeams[2]} /></div>
          </div>
        </div>
      </section>

      {/* Why Choose Bluven Energy */}
      <section className="section" style={{ background: 'var(--bv-white)' }}>
        <div className="container">
          <Reveal style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 56px' }}>
            <span className="text-eyebrow">Why Choose Us</span>
            <h2 className="section-h" style={{ margin: '12px auto 0', textAlign: 'center' }}>
              Why Choose Bluven Energy?
            </h2>
            <span className="why-divider" aria-hidden />
          </Reveal>

          <div className="why-grid">
            {reasons.map((r, i) => (
              <Reveal className="why-card" key={i} delay={i * 80}>
                <h4 className="why-h">{r.title}</h4>
                <p className="why-p">{r.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-bottom">
        <Reveal>
          <span className="text-eyebrow" style={{ color: 'var(--bv-teal-300)' }}>
            Ready to talk?
          </span>
          <h2>Free, no-obligation, real engineer.</h2>
          <p>
            Drop your details and we&apos;ll have an engineer (not a salesperson) on the phone within 24 hours.
          </p>
          <div className="btn-row">
            <Link className="btn btn-primary" href="/quote">
              <span>Get a quote</span> <span className="arrow">→</span>
            </Link>
            <Link className="btn btn-ghost" href="/contact" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
              <span>Visit a showroom</span>
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  )
}

function LoopIcon({ kind }: { kind: 'pen' | 'wrench' | 'phone' }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.1,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  if (kind === 'pen') {
    return (
      <svg {...common}>
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <path d="M2 2l7.586 7.586" />
        <circle cx="11" cy="11" r="2" />
      </svg>
    )
  }
  if (kind === 'wrench') {
    return (
      <svg {...common}>
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94" />
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  )
}

function LoopCardBody({ team }: { team: { icon: 'pen' | 'wrench' | 'phone'; title: string; action: string; roles: string } }) {
  return (
    <>
      <div className="loop-card-head">
        <div className="loop-card-icon"><LoopIcon kind={team.icon} /></div>
        <h4 className="loop-card-title">{team.title}</h4>
      </div>
      <div className="loop-card-action">{team.action}</div>
      <div className="loop-card-roles-head">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <polyline points="9 11.5 11.5 14 16 9.5" />
        </svg>
        <span>CORE ROLES</span>
      </div>
      <p className="loop-card-roles">{team.roles}</p>
    </>
  )
}
