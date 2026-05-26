'use client'

import Link from 'next/link'
import { Reveal } from '@/components/ui/Reveal'
import { PageHeader } from '@/components/ui/PageHeader'
import { api } from '@/api/client'
import type { Brand } from '@/types/cms'

// ── Category metadata (displayed above each section) ──
// Categories map to Brand.category enum values from the CMS.
const CATEGORY_META: Record<Brand['category'], { title: string; sub: string }> = {
  panels:     { title: 'Solar panels',                sub: 'Tier-1 & premium' },
  inverter:   { title: 'Inverters & hybrid systems',  sub: 'String & hybrid' },
  battery:    { title: 'Batteries',                   sub: 'Federal rebate eligible' },
  ev:         { title: 'EV chargers',                 sub: '7–22 kW' },
  monitoring: { title: 'Monitoring',                  sub: 'Apps & dashboards' },
}
const CATEGORY_ORDER: Brand['category'][] = ['panels', 'inverter', 'battery', 'ev', 'monitoring']

// ── Fallback when CMS is empty (matches original brands.html content) ──
const FALLBACK: Brand[] = [
  { id: 'fb-1', name: 'Trina Solar', model: 'Vertex S+ 440 W', category: 'panels', tier: 'tier-1',
    description: 'N-type TOPCon, 25-year product warranty. Best balance of price and yield.',
    spec1: '440 W', spec2: '21.8% efficient', logoUrl: 'https://logo.clearbit.com/trinasolar.com',
    featured: false, sortOrder: 10 },
  { id: 'fb-2', name: 'Jinko', model: 'Tiger Neo 445 W', category: 'panels', tier: 'tier-1',
    description: 'N-type, low-degradation, exceptional low-light performance.',
    spec1: '445 W', spec2: '22.0% efficient', logoUrl: 'https://logo.clearbit.com/jinkosolar.com',
    featured: false, sortOrder: 20 },
  { id: 'fb-3', name: 'REC Alpha', model: 'REC Alpha Pure-R', category: 'panels', tier: 'premium',
    description: 'Lead-free, premium-tier, made in Singapore. 25-year complete warranty.',
    spec1: '410 W', spec2: '22.3% efficient', logoUrl: 'https://logo.clearbit.com/recgroup.com',
    featured: false, sortOrder: 30 },
  { id: 'fb-4', name: 'LONGi Hi-MO', model: 'Hi-MO 6 460 W', category: 'panels', tier: 'premium',
    description: 'HPBC cell technology, sleek black aesthetics for premium homes.',
    spec1: '460 W', spec2: '22.6% efficient', logoUrl: 'https://logo.clearbit.com/longi.com',
    featured: false, sortOrder: 40 },

  { id: 'fb-5', name: 'SiGenergy', model: 'SigenStor full-stack', category: 'inverter', tier: 'premium',
    description: 'Best-in-class hybrid system. Inverter, battery, EV charger and gateway, integrated.',
    spec1: '5–25 kW', spec2: '10-yr warranty', logoUrl: 'https://logo.clearbit.com/sigenergy.com',
    featured: false, sortOrder: 10 },
  { id: 'fb-6', name: 'Sungrow', model: 'SH series hybrid', category: 'inverter', tier: 'tier-1',
    description: 'Workhorse hybrid inverter, excellent monitoring, robust in heat.',
    spec1: '5–20 kW', spec2: '10-yr warranty', logoUrl: 'https://logo.clearbit.com/sungrowpower.com.au',
    featured: false, sortOrder: 20 },
  { id: 'fb-7', name: 'GoodWe', model: 'ET 3-phase hybrid', category: 'inverter', tier: 'tier-1',
    description: 'Reliable hybrid for three-phase homes. Strong commercial range.',
    spec1: '5–30 kW', spec2: '10-yr warranty', logoUrl: 'https://logo.clearbit.com/goodwe.com',
    featured: false, sortOrder: 30 },
  { id: 'fb-8', name: 'FoxESS', model: 'H3 hybrid + EP11', category: 'inverter', tier: 'tier-1',
    description: 'Modular battery + hybrid inverter. Easy retrofit to existing solar.',
    spec1: '5–15 kW', spec2: '10-yr warranty', logoUrl: 'https://logo.clearbit.com/fox-ess.com',
    featured: false, sortOrder: 40 },

  { id: 'fb-9', name: 'Tesla', model: 'Powerwall 3', category: 'battery', tier: 'premium',
    description: 'Integrated 11.5 kW solar inverter + 13.5 kWh battery. Whole-home backup.',
    spec1: '13.5 kWh', spec2: '10-yr warranty', logoUrl: 'https://logo.clearbit.com/tesla.com',
    featured: false, sortOrder: 10 },
  { id: 'fb-10', name: 'SiGenergy', model: 'SigenStor BAT', category: 'battery', tier: 'premium',
    description: 'Stackable 5/8/12 kWh modules. Rapid charge/discharge for VPP performance.',
    spec1: '5–48 kWh', spec2: '10-yr warranty', logoUrl: 'https://logo.clearbit.com/sigenergy.com',
    featured: false, sortOrder: 20 },
  { id: 'fb-11', name: 'Sungrow', model: 'SBR Series', category: 'battery', tier: 'tier-1',
    description: 'Modular 9.6 / 12.8 / 16 / 19.2 / 22.4 / 25.6 kWh. Workhorse with great monitoring.',
    spec1: '9.6–25.6 kWh', spec2: '10-yr warranty', logoUrl: 'https://logo.clearbit.com/sungrowpower.com.au',
    featured: false, sortOrder: 30 },
  { id: 'fb-12', name: 'Alpha ESS', model: 'SMILE-G3-T10', category: 'battery', tier: 'tier-1',
    description: 'Australian-favoured battery. LiFePO₄, deep cycle, IP65 outdoor.',
    spec1: '10–20 kWh', spec2: '10-yr warranty', logoUrl: 'https://logo.clearbit.com/alphaess.com',
    featured: false, sortOrder: 40 },

  { id: 'fb-13', name: 'Zappi v2.1', model: '7.4 / 22 kW solar-aware', category: 'ev', tier: 'premium',
    description: 'The original solar-diversion charger. Eco+ mode runs only on solar surplus.',
    spec1: '7.4–22 kW', spec2: '3-yr warranty', logoUrl: 'https://logo.clearbit.com/myenergi.com',
    featured: false, sortOrder: 10 },
  { id: 'fb-14', name: 'Ocular IQ', model: 'Ocular Home', category: 'ev', tier: 'tier-1',
    description: 'Australian-made, OCPP-compliant, smart scheduling and load-balancing.',
    spec1: '7.4–22 kW', spec2: '3-yr warranty', logoUrl: 'https://logo.clearbit.com/ocular.com.au',
    featured: false, sortOrder: 20 },
  { id: 'fb-15', name: 'Tesla Wall', model: 'Tesla Wall Connector Gen 3', category: 'ev', tier: 'premium',
    description: 'Sleek, fast, native Tesla integration. Power-share for two-EV homes.',
    spec1: '11.5 / 22 kW', spec2: '4-yr warranty', logoUrl: 'https://logo.clearbit.com/tesla.com',
    featured: false, sortOrder: 30 },
  { id: 'fb-16', name: 'EO Mini Pro 3', model: 'EO Mini Pro 3', category: 'ev', tier: 'tier-1',
    description: 'Tiniest 7 kW charger on the market. Discreet, smart, future-proof.',
    spec1: '7.4 kW', spec2: '3-yr warranty', logoUrl: 'https://logo.clearbit.com/eocharging.com',
    featured: false, sortOrder: 40 },
]

function logoSrc(b: Brand): string | null {
  if (b.logo) return api.imgUrl(b.logo, 'card')
  if (b.logoUrl) return b.logoUrl
  return null
}

function tierLabel(tier?: 'tier-1' | 'premium'): { text: string; cls: string } {
  if (tier === 'premium') return { text: 'Premium', cls: 'tier-premium' }
  return { text: 'Tier 1', cls: 'tier-1' }
}

export function BrandsView({ brands }: { brands: Brand[] }) {
  // Use CMS when present, fallback otherwise
  const source = brands.length > 0 ? brands : FALLBACK

  // Group by category, then sort: featured first, then sortOrder asc, then name
  const groups = CATEGORY_ORDER
    .map((cat) => ({
      cat,
      meta: CATEGORY_META[cat],
      brands: source
        .filter((b) => b.category === cat)
        .sort((a, b) =>
          (Number(b.featured) - Number(a.featured)) ||
          (a.sortOrder - b.sortOrder) ||
          a.name.localeCompare(b.name),
        ),
    }))
    .filter((g) => g.brands.length > 0)

  return (
    <>
      <PageHeader
        eyebrow="Brands we install"
        title="Only the gear that earns it."
        lede="We're brand-agnostic by design. Every component below has been on a Bluven roof for at least 24 months — long enough to know how it holds up in real Australian weather."
      />

      {groups.map((g, ci) => (
        <section
          key={g.cat}
          className="section"
          style={{ background: ci % 2 === 0 ? 'var(--bv-paper-2)' : 'var(--bv-white)' }}
        >
          <div className="container">
            <Reveal className="brand-cat-head" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
              <h2 style={{ fontSize: 'clamp(24px, 2.6vw, 32px)', margin: 0, color: 'var(--bv-ink-900)' }}>
                {g.meta.title}
              </h2>
              <span style={{ fontSize: 13.5, color: 'var(--bv-ink-500)' }}>
                {g.brands.length} {g.brands.length === 1 ? 'brand' : 'brands'} · {g.meta.sub}
              </span>
            </Reveal>

            <div className="brand-cat-grid">
              {g.brands.map((b, i) => {
                const src = logoSrc(b)
                const tier = tierLabel(b.tier)
                return (
                  <Reveal key={b.id} className="brand-card" delay={i * 80}>
                    <div className="brand-logo-mark">
                      {src
                        ? <img src={src} alt={b.name} loading="lazy" />
                        : <span>{b.name}</span>}
                      <span className="brand-name">{b.name}</span>
                    </div>
                    {b.model && <h4 className="brand-model">{b.model}</h4>}
                    <p className="brand-desc">{b.description}</p>
                    <div className="brand-meta">
                      <span className={`brand-tier ${tier.cls}`}>{tier.text}</span>
                      {b.spec1 && <span>{b.spec1}</span>}
                      {b.spec2 && <span>{b.spec2}</span>}
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>
      ))}

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
