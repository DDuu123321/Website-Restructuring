'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Reveal } from '@/components/ui/Reveal'
import { PageHeader } from '@/components/ui/PageHeader'
import { api } from '@/api/client'
import type { Project } from '@/types/cms'

// 12 fallback projects — full data from the original projects.html
type FallbackProject = {
  id: string
  tags: string[]
  loc: string
  tag: string
  title: string
  desc: string
  stats: [string, string][]
  img: string
}

const FALLBACK_PROJECTS: FallbackProject[] = [
  {
    id: 'mosman-13kw',
    tags: ['res', 'nsw', 'bat'],
    loc: 'Mosman, NSW',
    tag: 'Residential',
    title: '13.2 kW + Tesla Powerwall 3',
    desc: 'Heritage roof, three pitches, complex tree shading. 32-panel design with optimisers.',
    stats: [
      ['92%',     'self-use'],
      ['$4,200',  'annual save'],
      ['4.6 yrs', 'payback'],
    ],
    img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=900&q=80',
  },
  {
    id: 'manly-50kw',
    tags: ['com', 'nsw'],
    loc: 'Manly, NSW',
    tag: 'Commercial',
    title: '50 kW commercial array',
    desc: 'Coastal café running freezers and 6 heat-pumps. Sungrow string + load-shifting.',
    stats: [
      ['41%',     'peak cut'],
      ['$22k',    'annual save'],
      ['3.2 yrs', 'payback'],
    ],
    img: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=900&q=80',
  },
  {
    id: 'parramatta-10kw',
    tags: ['res', 'nsw', 'ev', 'bat'],
    loc: 'Parramatta, NSW',
    tag: 'Residential + EV',
    title: '10 kW + 13.5 kWh + Zappi',
    desc: 'Family of five with two EVs. Solar-aware Zappi pulls grid only when battery full.',
    stats: [
      ['87%',     'self-use'],
      ['$3,800',  'annual save'],
      ['4.1 yrs', 'payback'],
    ],
    img: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=900&q=80',
  },
  {
    id: 'brighton-8kw',
    tags: ['res', 'vic', 'bat'],
    loc: 'Brighton, VIC',
    tag: 'Residential',
    title: '8.8 kW + 10 kWh SigenStor',
    desc: '1920s weatherboard, two-storey. North-east + west split with separate MPPT zones.',
    stats: [
      ['83%',     'self-use'],
      ['$2,900',  'annual save'],
      ['4.3 yrs', 'payback'],
    ],
    img: 'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=900&q=80',
  },
  {
    id: 'geelong-120kw',
    tags: ['com', 'vic'],
    loc: 'Geelong, VIC',
    tag: 'Commercial',
    title: '120 kW warehouse array',
    desc: 'Light-industrial print shop running 3 heavy presses. Demand response enabled.',
    stats: [
      ['58%',     'peak cut'],
      ['$48k',    'annual save'],
      ['3.0 yrs', 'payback'],
    ],
    img: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=900&q=80',
  },
  {
    id: 'noosa-13kw',
    tags: ['res', 'qld', 'bat', 'ev'],
    loc: 'Noosa, QLD',
    tag: 'Residential + EV',
    title: '13.2 kW + 20 kWh + Tesla wall',
    desc: 'Off-grid-ready new build. Whole-home backup, three-phase, solar-aware EV charger.',
    stats: [
      ['96%',     'self-use'],
      ['$4,800',  'annual save'],
      ['5.0 yrs', 'payback'],
    ],
    img: 'https://images.unsplash.com/photo-1545209463-e2825498edbf?w=900&q=80',
  },
  {
    id: 'hornsby-13kw',
    tags: ['res', 'nsw', 'bat'],
    loc: 'Hornsby, NSW',
    tag: 'Residential',
    title: '13.2 kW + 20 kWh',
    desc: 'Family home, prepped paperwork & STCs handled, zero hassle install.',
    stats: [
      ['89%',     'self-use'],
      ['$4,400',  'annual save'],
      ['4.4 yrs', 'payback'],
    ],
    img: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=900&q=80',
  },
  {
    id: 'bondi-6kw',
    tags: ['res', 'nsw'],
    loc: 'Bondi, NSW',
    tag: 'Residential',
    title: '6.6 kW Starter Pack',
    desc: 'First-time solar buyer. Single-phase, 16 panels on north pitch.',
    stats: [
      ['68%',     'self-use'],
      ['$1,800',  'annual save'],
      ['3.3 yrs', 'payback'],
    ],
    img: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=900&q=80',
  },
  {
    id: 'brisbane-200kw',
    tags: ['com', 'qld'],
    loc: 'Brisbane, QLD',
    tag: 'Commercial',
    title: '200 kW industrial site',
    desc: 'Cold-storage facility. Largest install of 2025. PPA financed, $0 upfront.',
    stats: [
      ['72%',  'demand cover'],
      ['$130k','annual save'],
      ['—',    'PPA'],
    ],
    img: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=900&q=80',
  },
  {
    id: 'stkilda-10kw',
    tags: ['res', 'vic', 'ev'],
    loc: 'St Kilda, VIC',
    tag: 'Residential + EV',
    title: '10 kW + Zappi 22 kW',
    desc: 'Three-phase, two-EV household. No battery — direct solar-to-EV scheduling.',
    stats: [
      ['78%',     'EV from solar'],
      ['$3,100',  'annual save'],
      ['3.7 yrs', 'payback'],
    ],
    img: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=900&q=80',
  },
  {
    id: 'sydneycbd-80kw',
    tags: ['com', 'nsw'],
    loc: 'Sydney CBD, NSW',
    tag: 'Commercial',
    title: '80 kW co-working office',
    desc: 'Strata-approved rooftop install on a 1980s commercial building. Tight access, crane lift.',
    stats: [
      ['44%',     'peak cut'],
      ['$32k',    'annual save'],
      ['3.6 yrs', 'payback'],
    ],
    img: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=900&q=80',
  },
  {
    id: 'sunshine-10kw',
    tags: ['res', 'qld', 'bat'],
    loc: 'Sunshine Coast, QLD',
    tag: 'Residential',
    title: '10 kW + 10 kWh Tesla',
    desc: 'Coastal home, salt-spray rated mounting. Whole-home backup for storm season.',
    stats: [
      ['85%',     'self-use'],
      ['$3,300',  'annual save'],
      ['4.0 yrs', 'payback'],
    ],
    img: 'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=900&q=80',
  },
]

export function ProjectsListView({ projects }: { projects: Project[] }) {
  const useCMS = projects.length > 0
  const [filter, setFilter] = useState('')
  const [visible, setVisible] = useState(9)

  const filters = [
    { id: '',    label: 'All' },
    { id: 'res', label: 'Residential' },
    { id: 'com', label: 'Commercial' },
    { id: 'bat', label: 'With battery' },
    { id: 'ev',  label: 'With EV charger' },
    { id: 'nsw', label: 'NSW' },
    { id: 'vic', label: 'VIC' },
    { id: 'qld', label: 'QLD' },
  ]

  const filtered = useMemo(() => {
    if (useCMS) {
      // CMS doesn't have these tag granularity; just show all
      return projects
    }
    if (!filter) return FALLBACK_PROJECTS
    return FALLBACK_PROJECTS.filter(p => p.tags.includes(filter))
  }, [filter, useCMS, projects])

  return (
    <>
      <PageHeader
        eyebrow="Our work · 4,200+ installs"
        title="Real Australian projects.<br/>Real numbers."
        lede="Every install is documented — design, delivery, performance after one year. Browse by location, system size or use case."
      />

      <section className="section" style={{ background: 'var(--bv-paper-2)', paddingTop: 60 }}>
        <div className="container">
          <Reveal className="proj-filters">
            {filters.map(f => (
              <button
                key={f.id}
                className={`proj-filter ${filter === f.id ? 'active' : ''}`}
                onClick={() => { setFilter(f.id); setVisible(9) }}
              >
                {f.label}
              </button>
            ))}
          </Reveal>

          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', padding: 60, color: 'var(--bv-ink-500)' }}>
              No projects in this category yet.
            </p>
          )}

          <div className="proj-grid">
            {useCMS
              ? projects.map((p, i) => (
                  <Reveal key={p.id} delay={Math.min(i * 50, 300)}>
                    <Link href={`/projects/${p.slug}`} className="proj-card">
                      <div className="proj-img" style={{ backgroundImage: `url(${api.imgUrl(p.coverImage, 'card')})` }} />
                      <div className="proj-meta">
                        <span className="tag tag-amber">{p.systemType}</span>
                        <span>{p.location}</span>
                      </div>
                      <h3>{p.title}</h3>
                      <p>{p.summary}</p>
                    </Link>
                  </Reveal>
                ))
              : filtered.slice(0, visible).map((p, i) => {
                  const fp = p as FallbackProject
                  return (
                    <Reveal key={fp.id} delay={Math.min(i * 50, 300)}>
                      <a className="proj-card" href="#">
                        <div className="proj-img" style={{ backgroundImage: `url(${fp.img})` }} />
                        <div className="proj-meta">
                          <span className="tag tag-amber">{fp.tag}</span>
                          <span>{fp.loc}</span>
                        </div>
                        <h3>{fp.title}</h3>
                        <p>{fp.desc}</p>
                        <div className="proj-stats">
                          {fp.stats.map((s, k) => (
                            <div key={k}>
                              <b>{s[0]}</b>
                              <span>{s[1]}</span>
                            </div>
                          ))}
                        </div>
                      </a>
                    </Reveal>
                  )
                })}
          </div>

          {!useCMS && filtered.length > visible && (
            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <button className="btn btn-ghost" onClick={() => setVisible(v => v + 6)}>
                <span>Load more projects</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ background: 'var(--bv-white)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 720 }}>
          <Reveal>
            <span className="text-eyebrow">Have a project in mind?</span>
            <h2 style={{ fontSize: 'clamp(28px, 3.4vw, 40px)', margin: '14px 0 24px' }}>
              Let's design yours next.
            </h2>
            <Link className="btn btn-primary" href="/quote">
              <span>Get a free design</span> <span className="arrow">→</span>
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
