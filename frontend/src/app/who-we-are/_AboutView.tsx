'use client'

import Link from 'next/link'
import { Reveal } from '@/components/ui/Reveal'
import { PageHeader } from '@/components/ui/PageHeader'
import { InterconnectedTeams } from './_InterconnectedTeams'

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

      {/* Accreditations strip — sits at the navy/white boundary, above the intro copy */}
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

      {/* Interconnected Expert Teams — user's standalone diagram, embedded verbatim */}
      <InterconnectedTeams />

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
