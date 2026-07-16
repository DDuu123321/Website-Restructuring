'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Reveal } from '@/components/ui/Reveal'
import { PageHeader } from '@/components/ui/PageHeader'
import { RichText } from '@/components/ui/RichText'
import type { FAQItem } from '@/types/cms'

// 24 fallback FAQs — full content from the original site (when CMS is empty)
type FallbackFaq = {
  id: string
  c: 'general' | 'pricing' | 'installation' | 'products' | 'support' | 'grid'
  q: string
  a: string
}

const FALLBACK_FAQS: FallbackFaq[] = [

]

const CATEGORIES = [
  { id: '',             label: 'All' },
  { id: 'general',      label: 'Getting started' },
  { id: 'pricing',      label: 'Rebates & pricing' },
  { id: 'installation', label: 'Installation' },
  { id: 'products',     label: 'Battery / EV' },
  { id: 'support',      label: 'Warranty & support' },
]

export function FAQView({ items }: { items: FAQItem[] }) {
  const useCMS = items.length > 0
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    if (useCMS) {
      let list = items
      if (category) list = list.filter(it => it.category === category)
      const s = search.trim().toLowerCase()
      if (s) list = list.filter(it => it.question.toLowerCase().includes(s))
      return list
    } else {
      let list = FALLBACK_FAQS
      if (category) list = list.filter(f => f.c === category)
      const s = search.trim().toLowerCase()
      if (s) list = list.filter(f => f.q.toLowerCase().includes(s) || f.a.toLowerCase().includes(s))
      return list
    }
  }, [useCMS, items, category, search])

  const toggle = (id: string) => {
    setOpenIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <>
      <PageHeader
        title="Frequently Asked Questions"
        lede="Everything you need to know about solar, batteries, EV charging, rebates and what to expect from a Bluven install."
      />

      <section className="section" style={{ background: 'var(--bv-paper-2)' }}>
        <div className="container" style={{ maxWidth: 880 }}>
          <Reveal>
            <div className="faq-search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="search"
                placeholder="Search 24+ FAQs…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="faq-cats">
              {CATEGORIES.map(c => (
                <button key={c.id} className={category === c.id ? 'active' : ''} onClick={() => setCategory(c.id)}>
                  {c.label}
                </button>
              ))}
            </div>
          </Reveal>

          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', padding: 60, color: 'var(--bv-ink-500)' }}>
              No matches. Try a different search.
            </p>
          )}

          <div style={{ marginTop: 32 }}>
            {filtered.map((item, i) => {
              const id = useCMS ? (item as FAQItem).id : (item as FallbackFaq).id
              const isOpen = openIds.has(id)
              const q = useCMS
                ? (item as FAQItem).question
                : (item as FallbackFaq).q
              return (
                <Reveal key={id} delay={Math.min(i * 20, 200)}>
                  <div className={`faq-item ${isOpen ? 'open' : ''}`}>
                    <button onClick={() => toggle(id)} className="faq-q">
                      <span>{q}</span>
                      <span className="faq-icon">+</span>
                    </button>
                    {isOpen && (
                      <div className="faq-a">
                        <div className="faq-a-inner">
                          {useCMS
                            ? <RichText data={(item as FAQItem).answer} />
                            : <p>{(item as FallbackFaq).a}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Still have questions */}
      <section className="section" style={{ background: 'var(--bv-white)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 720 }}>
          <Reveal>
            <span className="text-eyebrow">Still have questions?</span>
            <h2 style={{ fontSize: 'clamp(28px, 3.4vw, 40px)', margin: '14px 0 24px' }}>
              Talk to a real engineer.
            </h2>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link className="btn btn-primary" href="/quote">
                <span>Get a quote</span> <span className="arrow">→</span>
              </Link>
              <Link className="btn btn-ghost" href="/contact">
                <span>Contact us</span>
              </Link>
              <a className="btn btn-ghost" href="tel:1300258836">📞 1300 BLUVEN</a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
