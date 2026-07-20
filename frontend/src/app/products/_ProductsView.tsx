'use client'

import Link from 'next/link'
import { Reveal } from '@/components/ui/Reveal'
import { PageHeader } from '@/components/ui/PageHeader'

export function ProductsView() {
  // ── 4 components — meeting feedback: by component, NOT by package ──
  const components = [
    {
      id: 'solar',
      eyebrow: 'Solar Panels',
      title:   'High-performance solar. Designed for your home.',
      body:    'Premium Tier-1 solar panels professionally engineered to maximise energy production, reduce electricity bills, and deliver reliable performance for years.',
      specs: [
        { l: 'Panel Power',          v: '410 – 795 W' },
        { l: 'System Size',          v: '6.6 kW – 200 kW' },
        { l: 'Product Warranty',     v: '25 Years' },
        { l: 'Performance Warranty', v: '30 Years' },
      ],
      img: '/picture1.png',
      reverse: false,
      dark: false,
    },
    {
      id: 'battery',
      eyebrow: 'Battery Storage',
      title:   'Store solar today. Power your home tonight.',
      body:    'Smart battery systems designed to maximise self-consumption, reduce electricity costs, and provide reliable backup when you need it.',
      specs: [
        { l: 'Battery Capacity', v: '10 – 100 kWh' },
        { l: 'Backup Options',   v: 'Essential / Whole Home' },
        { l: 'Battery Warranty', v: '10 Years' },
        { l: 'VPP Ready',        v: 'Yes' },
      ],
      img: '/picture2.png',
      reverse: true,
      dark: true,
    },
    {
      id: 'ev',
      eyebrow: 'EV Chargers',
      title:   'Charge your EV with your own energy.',
      body:    'Smart home EV charging solutions that integrate seamlessly with your solar and battery system for a cleaner, cheaper and smarter way to drive.',
      specs: [
        { l: 'Charging Power', v: '7 – 22 kW' },
        { l: 'Supply Options', v: 'Single / Three Phase' },
        { l: 'Smart Modes',    v: 'Solar / Scheduled / Fast' },
        { l: 'Warranty', v: 'Up to 5 Years' },
      ],
      img: '/picture3.png',
      reverse: false,
      dark: false,
    },
    {
      id: 'commercial',
      eyebrow: 'Commercial Solutions',
      title:   'Smarter energy solutions for your business.',
      body:    'From commercial solar and battery systems to energy management and demand reduction, we help businesses lower operating costs and improve energy resilience.',
      specs: [
        { l: 'Project Size',         v: '30 – 500 kW+' },
        { l: 'Peak Demand Reduction',      v: ' Available' },
        { l: 'Applications',         v: 'Retail · Warehouse · Office · Industrial' },
        { l: 'Engineering Services', v: 'Design · Compliance · Commissioning' },
      ],
      img: '/picture4.png',
      reverse: true,
      dark: true,
    },
  ]

  return (
    <>
      <PageHeader
        title="Solutions"
        lede="Solar, batteries and EV charging — all from one team that designs, installs and supports the whole system as a single energy stack."
      />

      {/* 4 component sections — white / blue alternating (solar · ev white, battery · commercial blue) */}
      {components.map((c) => (
        <section
          key={c.id}
          id={c.id}
          className={`section product-cat ${c.dark ? 'is-dark' : ''}`}
          style={{
            background: c.dark ? 'var(--bv-ink-900)' : 'var(--bv-white)',
            color: c.dark ? 'var(--bv-white)' : undefined,
            scrollMarginTop: 80,
          }}
        >
          <div className="container">
            <div className={`cat-grid ${c.reverse ? 'reverse' : ''}`}>
              <Reveal className="cat-copy">
                <span className="text-eyebrow" style={{ color: c.dark ? 'var(--bv-teal-300)' : undefined }}>
                  {c.eyebrow}
                </span>
                <h2 style={{
                  color: c.dark ? 'var(--bv-white)' : 'var(--bv-ink-900)',
                  fontSize: 'clamp(28px, 3.4vw, 44px)',
                  margin: '12px 0 16px',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}>
                  {c.title}
                </h2>
                <p style={{
                  fontSize: 16.5,
                  lineHeight: 1.65,
                  color: c.dark ? 'rgba(255,255,255,0.78)' : 'var(--bv-ink-500)',
                  marginBottom: 24,
                  maxWidth: '52ch',
                }}>
                  {c.body}
                </p>
                <div className="cat-spec">
                  {c.specs.map((s, k) => (
                    <div key={k}>
                      <span style={{ color: c.dark ? 'rgba(255,255,255,0.6)' : undefined }}>{s.l}</span>
                      <b style={{ color: c.dark ? 'var(--bv-white)' : undefined }}>{s.v}</b>
                    </div>
                  ))}
                </div>
              </Reveal>

              <Reveal className="cat-media">
                <div className="cat-visual" style={{ backgroundImage: `url(${c.img})` }} />
              </Reveal>
            </div>
          </div>
        </section>
      ))}
      {/* CTA — white variant (cta-light), scoped so who-we-are's CTA stays blue */}
      <section className="cta-bottom cta-light">
        <Reveal>
          <span className="text-eyebrow" style={{ color: 'var(--bv-teal-600)' }}>
            Not sure which solution is right for you?
          </span>
          <h2>Let an engineer help you decide.</h2>
          <p>Free, no-obligation. Tell us your roof, your bills and your usage — we&rsquo;ll recommend the right solution for your home or business.</p>
          <div className="btn-row">
            <Link className="btn btn-primary" href="/quote">
              <span>Talk to our engineers</span> <span className="arrow">→</span>
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  )
}
