'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Reveal } from '@/components/ui/Reveal'
import { PageHeader } from '@/components/ui/PageHeader'
import { api } from '@/api/client'
import type { Project } from '@/types/cms'

// Human labels for the CMS systemType select values
const SYSTEM_LABELS: Record<string, string> = {
  'solar': 'Solar',
  'solar-battery': 'Solar + Battery',
  'solar-ev': 'Solar + EV',
  'full': 'Full System',
  'commercial': 'Commercial',
  'battery-retrofit': 'Battery Storage',
}

const STATES: Record<string, string> = {
  NSW: 'New South Wales', QLD: 'Queensland', VIC: 'Victoria',
  SA: 'South Australia', WA: 'Western Australia', TAS: 'Tasmania',
  NT: 'Northern Territory', ACT: 'Australian Capital Territory',
}

// Derive the state abbr from a location string ("Western Australia" or "Suburb, WA")
function stateOf(location: string | undefined): string | null {
  if (!location) return null
  for (const [abbr, name] of Object.entries(STATES)) {
    if (location.includes(name) || new RegExp(`\\b${abbr}\\b`).test(location)) return abbr
  }
  return null
}

export function ProjectsListView({ projects, totalDocs }: { projects: Project[]; totalDocs?: number }) {
  const [filter, setFilter] = useState('')
  const [visible, setVisible] = useState(9)
  const installCount = totalDocs ?? projects.length

  // Filters are derived from the real data: distinct system types + states.
  const filters = useMemo(() => {
    const types = [...new Set(projects.map(p => p.systemType).filter(Boolean))]
    const states = [...new Set(projects.map(p => stateOf(p.location)).filter(Boolean))] as string[]
    return [
      { id: '', label: 'All' },
      ...types.map(t => ({ id: `type:${t}`, label: SYSTEM_LABELS[t as string] || (t as string) })),
      ...states.sort().map(s => ({ id: `state:${s}`, label: s })),
    ]
  }, [projects])

  const filtered = useMemo(() => {
    if (!filter) return projects
    if (filter.startsWith('type:')) return projects.filter(p => p.systemType === filter.slice(5))
    if (filter.startsWith('state:')) return projects.filter(p => stateOf(p.location) === filter.slice(6))
    return projects
  }, [filter, projects])

  return (
    <>
      <PageHeader
        eyebrow={installCount > 0 ? `Our work · ${installCount} documented installs` : 'Our work'}
        title="Real Australian projects.<br/>Real numbers."
        lede="Every install is documented — design, delivery, performance after one year. Browse by location, system size or use case."
      />

      <section className="section" style={{ background: 'var(--bv-paper-2)', paddingTop: 60 }}>
        <div className="container">
          {projects.length > 0 && (
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
          )}

          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', padding: 60, color: 'var(--bv-ink-500)' }}>
              {projects.length === 0
                ? 'Project case studies are being prepared — check back soon.'
                : 'No projects in this category yet.'}
            </p>
          )}

          <div className="proj-grid">
            {filtered.slice(0, visible).map((p) => {
              const src = api.imgUrl(p.coverImage, 'card')
              return (
                <Reveal key={p.id}>
                  <Link href={`/projects/${p.slug}`} className="proj-card">
                    {src ? (
                      <img
                        className="proj-img"
                        src={src}
                        alt={p.coverImage?.alt || p.title}
                        width={p.coverImage?.sizes?.card?.width}
                        height={p.coverImage?.sizes?.card?.height}
                        loading="lazy"
                      />
                    ) : (
                      <div className="proj-img" aria-hidden />
                    )}
                    <div className="proj-meta">
                      <span className="tag tag-amber">{SYSTEM_LABELS[p.systemType as string] || p.systemType}</span>
                      <span>{p.location}</span>
                    </div>
                    <h3>{p.title}</h3>
                    <p>{p.summary}</p>
                  </Link>
                </Reveal>
              )
            })}
          </div>

          {filtered.length > visible && (
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
