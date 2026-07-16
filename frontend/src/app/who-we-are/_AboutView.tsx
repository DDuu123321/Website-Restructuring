'use client'

import Link from 'next/link'
import { Reveal } from '@/components/ui/Reveal'
import { InterconnectedTeams } from './_InterconnectedTeams'

/* Lucide outline icons (inlined — no icon dependency), stroke follows currentColor */
const icon = (paths: React.ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths}</svg>
)
const Icons = {
  target: icon(<><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>),
  award: icon(<><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" /><circle cx="12" cy="8" r="6" /></>),
  medal: icon(<><path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15" /><path d="M11 12 5.12 2.2" /><path d="m13 12 5.88-9.8" /><path d="M8 7h8" /><circle cx="12" cy="17" r="5" /><path d="M12 18v-2h-.5" /></>),
  shield: icon(<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />),
  leaf: icon(<><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></>),
  sun: icon(<><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></>),
  compass: icon(<><circle cx="12" cy="12" r="10" /><path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" /></>),
}

export function AboutView() {
  const accreditations = [
    { label: 'SAA Accreditation', icon: Icons.award },
    { label: 'CPEng Certified', icon: Icons.medal },
    { label: 'AlphaESS Partner', icon: Icons.shield },
    { label: 'SEC Member', icon: Icons.leaf },
    { label: 'CEC Member', icon: Icons.sun },
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
      {/* Hero — navy, centered badge + title, left-aligned intro copy (mirrors old site, no bg photo) */}
      <header className="about-hero">
        <div className="container">
          <Reveal>
            <h1>Who We Are</h1>
            <div className="about-hero-lede">
              <p>
                Bluven Energy is an Australian-based solar and battery solutions provider delivering premium, engineer-led solar and battery energy storage systems across multiple states.
              </p>
              <p>
                Our solutions are designed by qualified engineers led by a CPEng-certified team, ensuring every solar and battery energy storage system is technically sound, financially optimised, and built for long-term performance.
              </p>
              <p>
                We specialise in delivering high-quality solar and battery energy storage systems for homeowners who prioritise performance, reliability, and professional service.
              </p>
            </div>
          </Reveal>
        </div>
      </header>

      {/* Accreditations strip — yellow band with lucide icons */}
      <section className="accred-strip">
        <div className="container">
          <div className="accred-row">
            {accreditations.map((a, i) => (
              <div className="accred-item" key={i}>
                {a.icon}
                <span>{a.label}</span>
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
              <span className="drives-eyebrow">What Drives Us</span>
              <h2 className="drives-h">We are not a typical solar retailer.</h2>

              <div className="quote-card">
                <p>
                  &quot;We&apos;re an engineering-led team delivering real, customised energy solutions that empower our customers to take control of their own power. It&apos;s not just about reducing electricity bills — it&apos;s about achieving true energy independence.&quot;
                </p>
                <p>
                  &quot;With us, you&apos;re investing in expertise, quality, and outcomes that deliver far more value than the price you pay.&quot;
                </p>
              </div>

              <h4 className="values-h">Our Values</h4>
              <div className="values-chips">
                {values.map((v, i) => (
                  <span className="value-chip" key={i}>{v}</span>
                ))}
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="mv-grid">
                <div className="mv-card">
                  {Icons.target}
                  <h4>Our Mission</h4>
                  <p>
                    To shift our customers from paying for energy to owning it, giving them full control, long-term savings, and true energy independence.
                  </p>
                </div>
                <div className="mv-card is-offset">
                  {Icons.compass}
                  <h4>Our Vision</h4>
                  <p>
                    To become a leading engineering-driven clean energy provider in Australia.
                  </p>
                </div>
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
