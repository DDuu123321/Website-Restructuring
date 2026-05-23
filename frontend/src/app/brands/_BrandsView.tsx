'use client'

import Link from 'next/link'
import { Reveal } from '@/components/ui/Reveal'
import { PageHeader } from '@/components/ui/PageHeader'
import type { Brand } from '@/types/cms'

interface BrandCard {
  brand: string
  model: string
  desc: string
  tier: 'Tier 1' | 'Premium'
  spec1: string  // power / capacity
  spec2: string  // warranty
  websiteUrl?: string
  logo?: string
}

export function BrandsView({ brands }: { brands: Brand[] }) {
  // 4 categories x 4 brands — full content from the original brands.html
  const catalog: { title: string; sub: string; brands: BrandCard[] }[] = [
    {
      title: 'Solar panels',
      sub:   '5 manufacturers · all Tier-1',
      brands: [
        {
          brand: 'Trina Solar',  model: 'Vertex S+ 440 W',
          desc: 'N-type TOPCon, 25-year product warranty. Best balance of price and yield.',
          tier: 'Tier 1', spec1: '440 W', spec2: '21.8% efficient',
          logo: 'https://logo.clearbit.com/trinasolar.com',
        },
        {
          brand: 'Jinko',        model: 'Tiger Neo 445 W',
          desc: 'N-type, low-degradation, exceptional low-light performance.',
          tier: 'Tier 1', spec1: '445 W', spec2: '22.0% efficient',
          logo: 'https://logo.clearbit.com/jinkosolar.com',
        },
        {
          brand: 'REC Alpha',    model: 'REC Alpha Pure-R',
          desc: 'Lead-free, premium-tier, made in Singapore. 25-year complete warranty.',
          tier: 'Premium', spec1: '410 W', spec2: '22.3% efficient',
          logo: 'https://logo.clearbit.com/recgroup.com',
        },
        {
          brand: 'LONGi Hi-MO',  model: 'Hi-MO 6 460 W',
          desc: 'HPBC cell technology, sleek black aesthetics for premium homes.',
          tier: 'Premium', spec1: '460 W', spec2: '22.6% efficient',
          logo: 'https://logo.clearbit.com/longi.com',
        },
      ],
    },
    {
      title: 'Inverters & hybrid systems',
      sub:   '4 brands · string & hybrid',
      brands: [
        {
          brand: 'SiGenergy',    model: 'SigenStor full-stack',
          desc: 'Best-in-class hybrid system. Inverter, battery, EV charger and gateway, integrated.',
          tier: 'Premium', spec1: '5–25 kW', spec2: '10-yr warranty',
          logo: 'https://logo.clearbit.com/sigenergy.com',
        },
        {
          brand: 'Sungrow',      model: 'SH series hybrid',
          desc: 'Workhorse hybrid inverter, excellent monitoring, robust in heat.',
          tier: 'Tier 1', spec1: '5–20 kW', spec2: '10-yr warranty',
          logo: 'https://logo.clearbit.com/sungrowpower.com.au',
        },
        {
          brand: 'GoodWe',       model: 'ET 3-phase hybrid',
          desc: 'Reliable hybrid for three-phase homes. Strong commercial range.',
          tier: 'Tier 1', spec1: '5–30 kW', spec2: '10-yr warranty',
          logo: 'https://logo.clearbit.com/goodwe.com',
        },
        {
          brand: 'FoxESS',       model: 'H3 hybrid + EP11',
          desc: 'Modular battery + hybrid inverter. Easy retrofit to existing solar.',
          tier: 'Tier 1', spec1: '5–15 kW', spec2: '10-yr warranty',
          logo: 'https://logo.clearbit.com/fox-ess.com',
        },
      ],
    },
    {
      title: 'Batteries',
      sub:   '4 brands · Federal rebate eligible',
      brands: [
        {
          brand: 'Tesla',        model: 'Powerwall 3',
          desc: 'Integrated 11.5 kW solar inverter + 13.5 kWh battery. Whole-home backup.',
          tier: 'Premium', spec1: '13.5 kWh', spec2: '10-yr warranty',
          logo: 'https://logo.clearbit.com/tesla.com',
        },
        {
          brand: 'SiGenergy',    model: 'SigenStor BAT',
          desc: 'Stackable 5/8/12 kWh modules. Rapid charge/discharge for VPP performance.',
          tier: 'Premium', spec1: '5–48 kWh', spec2: '10-yr warranty',
          logo: 'https://logo.clearbit.com/sigenergy.com',
        },
        {
          brand: 'Sungrow',      model: 'SBR Series',
          desc: 'Modular 9.6 / 12.8 / 16 / 19.2 / 22.4 / 25.6 kWh. Workhorse with great monitoring.',
          tier: 'Tier 1', spec1: '9.6–25.6 kWh', spec2: '10-yr warranty',
          logo: 'https://logo.clearbit.com/sungrowpower.com.au',
        },
        {
          brand: 'Alpha ESS',    model: 'SMILE-G3-T10',
          desc: 'Australian-favoured battery. LiFePO₄, deep cycle, IP65 outdoor.',
          tier: 'Tier 1', spec1: '10–20 kWh', spec2: '10-yr warranty',
          logo: 'https://logo.clearbit.com/alphaess.com',
        },
      ],
    },
    {
      title: 'EV chargers',
      sub:   '3 brands · 7–22 kW',
      brands: [
        {
          brand: 'Zappi v2.1',   model: '7.4 / 22 kW solar-aware',
          desc: 'The original solar-diversion charger. Eco+ mode runs only on solar surplus.',
          tier: 'Premium', spec1: '7.4–22 kW', spec2: '3-yr warranty',
          logo: 'https://logo.clearbit.com/myenergi.com',
        },
        {
          brand: 'Ocular IQ',    model: 'Ocular Home',
          desc: 'Australian-made, OCPP-compliant, smart scheduling and load-balancing.',
          tier: 'Tier 1', spec1: '7.4–22 kW', spec2: '3-yr warranty',
          logo: 'https://logo.clearbit.com/ocular.com.au',
        },
        {
          brand: 'Tesla Wall',   model: 'Tesla Wall Connector Gen 3',
          desc: 'Sleek, fast, native Tesla integration. Power-share for two-EV homes.',
          tier: 'Premium', spec1: '11.5 / 22 kW', spec2: '4-yr warranty',
          logo: 'https://logo.clearbit.com/tesla.com',
        },
        {
          brand: 'EO Mini Pro 3', model: 'EO Mini Pro 3',
          desc: 'Tiniest 7 kW charger on the market. Discreet, smart, future-proof.',
          tier: 'Tier 1', spec1: '7.4 kW', spec2: '3-yr warranty',
          logo: 'https://logo.clearbit.com/eocharging.com',
        },
      ],
    },
  ]

  const renderTier = (tier: 'Tier 1' | 'Premium') => (
    <span className={`brand-tier ${tier === 'Premium' ? 'tier-premium' : 'tier-1'}`}>
      {tier}
    </span>
  )

  return (
    <>
      <PageHeader
        eyebrow="Brands we install"
        title="Only the gear that earns it."
        lede="We're brand-agnostic by design. Every component below has been on a Bluven roof for at least 24 months — long enough to know how it holds up in real Australian weather."
      />

      {catalog.map((cat, ci) => (
        <section
          key={ci}
          className="section"
          style={{ background: ci % 2 === 0 ? 'var(--bv-paper-2)' : 'var(--bv-white)' }}
        >
          <div className="container">
            <Reveal className="brand-cat-head" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
              <h2 style={{ fontSize: 'clamp(24px, 2.6vw, 32px)', margin: 0, color: 'var(--bv-ink-900)' }}>
                {cat.title}
              </h2>
              <span style={{ fontSize: 13.5, color: 'var(--bv-ink-500)' }}>{cat.sub}</span>
            </Reveal>

            <div className="brand-cat-grid">
              {cat.brands.map((b, i) => (
                <Reveal key={i} className="brand-card" delay={i * 80}>
                  <div className="brand-logo-mark">
                    {b.logo
                      ? <img src={b.logo} alt={b.brand} loading="lazy" />
                      : <span>{b.brand}</span>}
                    <span className="brand-name">{b.brand}</span>
                  </div>
                  <h4 className="brand-model">{b.model}</h4>
                  <p className="brand-desc">{b.desc}</p>
                  <div className="brand-meta">
                    {renderTier(b.tier)}
                    <span>{b.spec1}</span>
                    <span>{b.spec2}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="cta-bottom">
        <Reveal>
          <span className="text-eyebrow" style={{ color: 'var(--bv-teal-300)' }}>
            Not sure which one?
          </span>
          <h2>We'll match the right gear to your roof.</h2>
          <p>
            Our engineers pick the panel + inverter + battery combination based on your roof orientation, shading, switchboard and budget — not on which supplier we have stock of.
          </p>
          <div className="btn-row">
            <Link className="btn btn-primary" href="/quote">
              <span>Get a free design</span> <span className="arrow">→</span>
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  )
}
