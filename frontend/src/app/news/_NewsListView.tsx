'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Reveal } from '@/components/ui/Reveal'
import { PageHeader } from '@/components/ui/PageHeader'
import { HoneypotField } from '@/components/ui/HoneypotField'
import { api } from '@/api/client'
import { NEWS_CATEGORY_LABEL } from '@/lib/newsCategories'
import type { News } from '@/types/cms'

const CATEGORIES = [
  { id: '', label: 'All' },
  ...Object.entries(NEWS_CATEGORY_LABEL).map(([id, label]) => ({ id, label })),
]

export function NewsListView({ articles, initialCategory }: { articles: News[]; initialCategory: string }) {
  const [category, setCategory] = useState(initialCategory)
  const [subState, setSubState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')
  const [subEmail, setSubEmail] = useState('')
  const [subHp, setSubHp] = useState('')

  const filterCategory = (c: string) => {
    setCategory(c)
    if (c) window.history.replaceState(null, '', `/news?category=${c}`)
    else   window.history.replaceState(null, '', '/news')
  }

  // Client-side category filter over the server-fetched list
  const visible = useMemo(
    () => (category ? articles.filter(a => a.category === category) : articles),
    [articles, category]
  )

  const featured = visible.find(a => a.featured) || visible[0]
  const others   = visible.filter(a => a.id !== featured?.id)

  // "Latest articles" sidebar — honest label: there is no view tracking, so
  // this is simply the newest five. Hidden until the list is worth showing.
  const latest = articles.slice(0, 5)

  const onSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subEmail || subState === 'busy' || subState === 'done') return
    setSubState('busy')
    try {
      await api.subscribe(subEmail, subHp)
      setSubState('done')
    } catch {
      setSubState('error')
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Insights · industry · rebates"
        title="Australian energy.<br/>Demystified."
        lede="Plain-English guides to rebates, system sizing, batteries and EV charging — written by the engineers who design the systems, not by SEO writers."
      />

      <section className="section" style={{ background: 'var(--bv-paper-2)', paddingTop: 60 }}>
        <div className="container">
          {/* Tabs — first, so the filter visibly governs everything below it,
              including which article gets the featured slot. */}
          <Reveal className="insights-tabs">
            {CATEGORIES.map(c => (
              <button key={c.id} className={category === c.id ? 'active' : ''} onClick={() => filterCategory(c.id)}>
                {c.label}
              </button>
            ))}
          </Reveal>

          {/* Newsletter — a banner above the articles instead of a sidebar
              card, which floated alone whenever the article list was short. */}
          <Reveal>
            <div className="newsletter newsletter--banner">
              <div className="banner-copy">
                <h5>Bluven monthly</h5>
                <p>One email a month. Rebate changes, real install numbers, no fluff.</p>
              </div>
              <form onSubmit={onSubscribe}>
                <HoneypotField value={subHp} onChange={setSubHp} />
                <input
                  type="email"
                  placeholder="you@email.com"
                  required
                  value={subEmail}
                  onChange={(e) => { setSubEmail(e.target.value); if (subState === 'error') setSubState('idle') }}
                  disabled={subState === 'done'}
                />
                <button type="submit" disabled={subState === 'busy' || subState === 'done'}>
                  {subState === 'done' ? '✓ Subscribed' : subState === 'busy' ? '…' : 'Subscribe'}
                </button>
              </form>
              {subState === 'error' && (
                <p style={{ color: 'var(--bv-danger)', fontSize: 13, margin: 0, width: '100%' }}>
                  Couldn&rsquo;t subscribe — check the address or try again.
                </p>
              )}
            </div>
          </Reveal>

          {/* Featured */}
          {featured && (
            <Reveal>
              <Link href={`/news/${featured.slug}`} className="featured-article">
                <div
                  className="featured-img"
                  style={{
                    backgroundImage: featured.coverImage
                      ? `url(${api.imgUrl(featured.coverImage, 'hero')})`
                      : 'linear-gradient(135deg, var(--bv-ink-700), var(--bv-ink-900))',
                  }}
                />
                <div className="body">
                  <div className="meta">
                    <span className="tag tag-amber">{NEWS_CATEGORY_LABEL[featured.category as string] || featured.category}</span>
                    <span>{featured.readTime ? `${featured.readTime} min read` : ''}</span>
                  </div>
                  <h2>{featured.title}</h2>
                  <p>{featured.summary}</p>
                  <div className="author">
                    <div className="author-av">{(featured.author || 'BE').charAt(0)}</div>
                    <div>
                      <b>{featured.author || 'Bluven Team'}</b>
                      <span>{featured.publishedAt && new Date(featured.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </Reveal>
          )}

          {/* Empty state — honest, no fabricated placeholder articles */}
          {visible.length === 0 && (
            <p style={{ textAlign: 'center', padding: 60, color: 'var(--bv-ink-500)' }}>
              {category
                ? `No ${NEWS_CATEGORY_LABEL[category] || ''} articles yet — check back soon.`
                : 'No articles published yet — check back soon.'}
            </p>
          )}

          {/* Article list — the sidebar column only exists once "Latest
              articles" has enough entries; a fixed 2-col grid would otherwise
              leave a dead 320px gutter (or an orphaned sidebar) on a short list. */}
          {others.length > 0 && (
          <div className={latest.length >= 3 ? 'news-side' : undefined} style={{ marginTop: 32 }}>
            <div className="article-list">
              {others.map((a, i) => (
                <Reveal key={a.id} delay={Math.min(i * 60, 300)}>
                  <Link href={`/news/${a.slug}`} className="article">
                    <div className="article-img" style={{
                      backgroundImage: a.coverImage
                        ? `url(${api.imgUrl(a.coverImage, 'card')})`
                        : 'var(--bv-paper-2)',
                    }} />
                    <div className="body">
                      <div className="meta">
                        <span className="tag tag-navy">{NEWS_CATEGORY_LABEL[a.category as string] || a.category}</span>
                        <span>{a.readTime ? `${a.readTime} min` : ''}</span>
                      </div>
                      <h3>{a.title}</h3>
                      <p>{a.summary}</p>
                      <span className="read">Read article →</span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>

            {latest.length >= 3 && (
              <aside>
                <div className="side-card">
                  <h5>Latest articles</h5>
                  {latest.map((a, i) => (
                    <Link key={a.id} href={`/news/${a.slug}`} className="news-item">
                      <span className="num">{String(i + 1).padStart(2, '0')}</span>
                      <span>{a.title}</span>
                    </Link>
                  ))}
                </div>
              </aside>
            )}
          </div>
          )}
        </div>
      </section>
    </>
  )
}
