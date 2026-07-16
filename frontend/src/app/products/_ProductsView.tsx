'use client'

import Link from 'next/link'
import { Reveal } from '@/components/ui/Reveal'
import { PageHeader } from '@/components/ui/PageHeader'

export function ProductsView() {
  // ── 4 components — meeting feedback: by component, NOT by package ──
  const components = [
    {
      id: 'solar',
      eyebrow: 'Solar generation',
      title:   'Tier-1 panels, 3D-modelled.',
      body:    "We use Trina, Jinko, REC and LONGi Hi-MO panels — chosen panel-by-panel for your roof's pitch, shade and azimuth. Every layout is rendered in 3D before a single bracket is drilled.",
      specs: [
        { l: 'Panel range',          v: '410 W – 460 W' },
        { l: 'System sizes',         v: '6.6 kW – 200 kW' },
        { l: 'Product warranty',     v: '25 years' },
        { l: 'Performance warranty', v: '30 years' },
      ],
      img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1400&q=85&auto=format',
      reverse: false,
    },
    {
      id: 'battery',
      eyebrow: 'Battery storage',
      title:   'Use the sun. After sunset.',
      body:    'Tesla Powerwall, SiGenergy SigenStor, Sungrow SBR and Alpha SMILE batteries. Federal Battery Rebate eligible, with whole-home or essential-circuit backup options.',
      specs: [
        { l: 'Capacity',          v: '10 – 40 kWh' },
        { l: 'Backup modes',      v: 'Whole-home / Essential' },
        { l: 'Battery warranty',  v: '10+ years' },
        { l: 'VPP ready',         v: 'Yes' },
      ],
      img: 'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=1400&q=85&auto=format',
      reverse: true,
      callout: {
        title: 'Cut your electricity bills with 3 hours of free midday charging',
        sub:   "From July 2026, AEMO's new tariff structure gives you 3 hours of free midday energy. Combined with a battery, that means cheap days and cheap nights.",
      },
      features: [
        { eyebrow: 'BENEFIT 01',
          h: 'Harvest today, power tonight',
          d: 'Excess solar fills your battery during the day, then powers your home through evening peak.' },
        { eyebrow: 'BENEFIT 02',
          h: 'App control & visibility',
          d: 'Bluven Live shows generation, battery state, household loads and EV charging in real time. Take control of every kWh.' },
        { eyebrow: 'BENEFIT 03',
          h: 'Blackout backup',
          d: 'When the grid goes down, your essential circuits — or whole home — keep running. Built-in resilience for storm season.' },
      ],
    },
    {
      id: 'ev',
      eyebrow: 'EV charging',
      title:   'Charge from the sun above your roof.',
      body:    'Zappi, Ocular and Tesla wall-chargers. Optional solar-aware mode means your EV only sips solar surplus — never grid power at peak rates.',
      specs: [
        { l: 'Power',       v: '7.4 / 22 kW' },
        { l: 'Phases',      v: 'Single / 3-phase' },
        { l: 'Smart modes', v: 'Eco / Eco+ / Fast' },
        { l: 'App control', v: 'iOS & Android' },
      ],
      img: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1400&q=85&auto=format',
      reverse: false,
    },
    {
      id: 'commercial',
      eyebrow: 'Commercial',
      title:   'Engineering-led commercial solar.',
      body:    'From warehouses to factories to retail — we engineer 30 – 250 kW commercial systems. Network protection studies, single-line diagrams, AS/NZS 5033 compliance and instant tax depreciation modelling included.',
      specs: [
        { l: 'System size',     v: '30 – 250 kW' },
        { l: 'Compliance',      v: 'AS/NZS 5033' },
        { l: 'Tax depreciation',v: 'Modelled' },
        { l: 'Typical payback', v: '4 – 7 yr' },
      ],
      img: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1400&q=85&auto=format',
      reverse: true,
      dark: true,
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Products"
        title="Engineered for Australian roofs."
        lede="Solar, batteries and EV charging — all from one team that designs, installs and supports the whole system as a single energy stack."
      />

      {/* 4 component sections */}
      {components.map((c, i) => (
        <section
          key={c.id}
          id={c.id}
          className="section product-cat"
          style={{
            background: c.dark ? 'var(--bv-ink-800)' : (i % 2 === 0 ? 'var(--bv-white)' : 'var(--bv-paper-2)'),
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

                {/* Battery midday charging callout */}
                {c.id === 'battery' && c.callout && (
                  <div className="bat-callout">
                    <div className="bat-callout-icon">⚡</div>
                    <div>
                      <h3 className="bat-callout-h">{c.callout.title}</h3>
                      <p className="bat-callout-p">{c.callout.sub}</p>
                    </div>
                  </div>
                )}
              </Reveal>

              <Reveal className="cat-media">
                <div className="cat-visual" style={{ backgroundImage: `url(${c.img})` }} />
              </Reveal>
            </div>

            {/* Battery 3 features */}
            {c.id === 'battery' && c.features && (
              <div className="bat-features">
                {c.features.map((f, k) => (
                  <Reveal key={k} className="bat-feature" delay={k * 100}>
                    <div className="bat-feature-eye">{f.eyebrow}</div>
                    <h4 className="bat-feature-h">{f.h}</h4>
                    <p className="bat-feature-p">{f.d}</p>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>
      ))}
      {/* CTA */}
      <section className="cta-bottom">
        <Reveal>
          <span className="text-eyebrow" style={{ color: 'var(--bv-teal-300)' }}>
            Not sure which one?
          </span>
          <h2>Let an engineer help you decide.</h2>
          <p>Free, no-obligation. Tell us your roof, your bills and your usage — we'll recommend the right combination.</p>
          <div className="btn-row">
            <Link className="btn btn-primary" href="/quote">
              <span>Free consultation · 60 seconds</span> <span className="arrow">→</span>
            </Link>
            <Link className="btn btn-ghost" href="/products/configure/alphaess-g3" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
              <span>Configure AlphaESS G3</span> <span className="arrow">→</span>
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  )
}
