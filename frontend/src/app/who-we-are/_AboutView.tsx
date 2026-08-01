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
  compass: icon(<><circle cx="12" cy="12" r="10" /><path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" /></>),
}

export function AboutView() {
  // Real accreditation certificates (same artwork as the homepage cert marquee,
  // /public/accreditations/) — replaces the old text+icon badges.
  const accreditations = [
    { label: 'Solar Accreditation Australia — Accredited Installer', img: '/accreditations/saa-accredited.png' },
    { label: 'Engineers Australia', img: '/accreditations/engineers-australia.jpg' },
    { label: 'Smart Energy Council — Small Business Member', img: '/accreditations/sec-member.jpg' },
    { label: 'Clean Energy Council Member', img: '/accreditations/cec-member.png' },
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

      {/* Accreditations strip — real certificate badges */}
      <section className="accred-strip">
        <div className="container">
          <div className="accred-row">
            {accreditations.map((a, i) => (
              <div className="accred-item accred-item--img" key={i}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.img} alt={a.label} title={a.label} draggable={false} />
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
