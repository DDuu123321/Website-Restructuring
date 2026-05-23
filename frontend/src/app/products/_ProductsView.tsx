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
      img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1400&q=85',
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
      img: 'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=1400&q=85',
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
      img: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1400&q=85',
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
      img: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1400&q=85',
      reverse: true,
      dark: true,
    },
  ]

  // ── 3 packages — meeting feedback: 3 tiers (Starter / Standard / Premium) ──
  const packages = [
    {
      id: 'starter',
      eyebrow: 'First-time buyers',
      h:       'Starter',
      tagline: 'Save',
      sub:     '6.6 kW solar · No battery',
      from:    'From $5,990 · incl. STCs',
      bullets: [
        '16× 410 W panels',
        '5 kW string inverter',
        'Real-time Bluven Live app',
        '10+ years workmanship warranty',
      ],
      payback: '~3.3 yrs',
    },
    {
      id: 'essential',
      featured: true,
      eyebrow: 'Solar + battery',
      h:       'Standard',
      tagline: 'Stable',
      sub:     '10 kW solar · 10 kWh battery',
      from:    'From $13,490 · incl. all rebates',
      bullets: [
        'All Starter features included',
        '24× 440 W panels',
        '10 kW hybrid inverter',
        '10 kWh battery — essential backup',
        'Federal Battery Rebate handled',
      ],
      payback: '~4.0 yrs',
      ribbon:  'Most chosen · 64%',
    },
    {
      id: 'premium',
      eyebrow: 'Whole-home energy',
      h:       'Premium',
      tagline: 'Save · Stable · No limits',
      sub:     '13.2 kW solar · 20 kWh battery',
      from:    'From $22,990 · incl. all rebates',
      bullets: [
        'All Standard features included',
        '32× 440 W premium panels',
        'SigenStor full-stack hybrid',
        '20 kWh expandable battery',
        'Whole-home backup',
        'EV-ready (charger optional)',
      ],
      payback: '~5.1 yrs',
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Products & packages"
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

              <Reveal>
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

      {/* 3 packages */}
      <section id="packages" className="section" style={{ background: 'var(--bv-white)', scrollMarginTop: 80 }}>
        <div className="container">
          <Reveal style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 56px' }}>
            <span className="text-eyebrow">Packages</span>
            <h2
              className="section-h"
              style={{ margin: '12px auto 12px', textAlign: 'center' }}
              dangerouslySetInnerHTML={{
                __html: 'Pick a starting point.<br/>Customise from there.'
              }}
            />
            <p className="section-lede" style={{ margin: '0 auto', textAlign: 'center' }}>
              Three engineered tiers. Each one builds on the previous — pick the closest fit, our engineer refines it to your roof.
            </p>
          </Reveal>

          <div className="pkg-tier-grid">
            {packages.map((p, i) => (
              <Reveal key={p.id} className={`pkg-tier ${p.featured ? 'is-featured' : ''}`} delay={i * 100}>
                {p.ribbon && <div className="pkg-ribbon">{p.ribbon}</div>}
                <header>
                  <span className="pkg-tier-eye">{p.eyebrow}</span>
                  <h3 className="pkg-tier-h">{p.h}</h3>
                  <div className="pkg-tier-tagline">{p.tagline}</div>
                  <p className="pkg-tier-sub">{p.sub}</p>
                  <div className="pkg-tier-from">{p.from}</div>
                </header>
                <ul className="pkg-tier-list">
                  {p.bullets.map((b, k) => <li key={k}>{b}</li>)}
                </ul>
                <div className="pkg-tier-payback">
                  <span>Typical payback</span>
                  <b>{p.payback}</b>
                </div>
                <Link className={`btn ${p.featured ? 'btn-primary' : 'btn-ghost'} pkg-tier-cta`} href={`/quote?pack=${p.id}`}>
                  <span>Get this package</span> <span className="arrow">→</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

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
