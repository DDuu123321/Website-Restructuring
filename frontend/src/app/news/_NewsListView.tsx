'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Reveal } from '@/components/ui/Reveal'
import { PageHeader } from '@/components/ui/PageHeader'
import { api } from '@/api/client'
import type { News } from '@/types/cms'

// 6 fallback articles — original news.html
type FallbackArticle = {
  id: string
  cat: string  // tag
  meta: string
  title: string
  summary: string
  img: string
  featured?: boolean
  author?: string
  date?: string
}

const FALLBACK_ARTICLES: FallbackArticle[] = [
  {
    id: 'federal-battery-rebate-2026',
    cat: 'policy',
    featured: true,
    meta: 'REBATES · 5 min read · 3 May 2026',
    title: "Federal Battery Rebate 2026: how much you'll actually get back.",
    summary: "The Cheaper Home Batteries Program is now live nationwide. Here's the real-world calculation for a 10 kWh system in NSW, VIC and QLD — including how it stacks with state rebates.",
    img: 'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=1200&q=80',
    author: 'Liam Walsh',
    date: '2026-05-03',
  },
  {
    id: 'vpps-explained',
    cat: 'knowledge',
    meta: 'BATTERY · 4 min read',
    title: 'VPPs explained: should you join one?',
    summary: "Virtual Power Plants pay you for letting the grid use your battery. Here's the trade-off most installers don't tell you about.",
    img: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1200&q=80',
  },
  {
    id: 'ev-tariffs-2026',
    cat: 'industry',
    meta: 'EV · 3 min read',
    title: 'EV-only off-peak tariffs: which retailer wins in 2026?',
    summary: "We compared every NSW retailer's overnight EV plan against running on solar surplus.",
    img: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1200&q=80',
  },
  {
    id: 'sizing-guide',
    cat: 'knowledge',
    meta: 'BUYING GUIDE · 6 min read',
    title: 'How to size a solar + battery system from your bill alone.',
    summary: 'The 5-step calculation our engineers use before even seeing your roof. Includes free spreadsheet.',
    img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=80',
  },
  {
    id: 'net-metering-2',
    cat: 'industry',
    meta: 'SOLAR · 4 min read',
    title: 'Net metering 2.0: why your feed-in tariff just got worse.',
    summary: "Retailers are quietly halving feed-in tariffs. Here's what that means for your payback — and how a battery flips it back.",
    img: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=1200&q=80',
  },
  {
    id: 'manly-cafe-case',
    cat: 'industry',
    meta: 'COMMERCIAL · 7 min read',
    title: 'How a Manly café cut its peak-demand charges by 41%.',
    summary: "Real case-study with exact bill comparisons. The trick wasn't more solar — it was load-shifting.",
    img: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1200&q=80',
  },
  {
    id: 'inverter-decision',
    cat: 'knowledge',
    meta: 'SOLAR · 5 min read',
    title: 'String vs. micro vs. hybrid: the inverter you actually need.',
    summary: 'A simple decision tree based on your roof, battery plans and budget. No marketing fluff.',
    img: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=1200&q=80',
  },
]

export function NewsListView({ articles, initialCategory }: { articles: News[]; initialCategory: string }) {
  const useCMS = articles.length > 0
  const [category, setCategory] = useState(initialCategory)

  const categories = [
    { id: '',          label: 'All' },
    { id: 'policy',    label: 'Rebates' },
    { id: 'knowledge', label: 'Battery' },
    { id: 'industry',  label: 'Solar' },
    { id: 'company',   label: 'EV' },
  ]

  const filterCategory = (c: string) => {
    setCategory(c)
    if (c) window.history.replaceState(null, '', `/news?category=${c}`)
    else   window.history.replaceState(null, '', '/news')
  }

  // Featured
  const featuredCMS = articles.find(a => a.featured) || articles[0]
  const othersCMS   = articles.filter(a => a.id !== featuredCMS?.id)
  const featuredFB  = FALLBACK_ARTICLES.find(a => a.featured)!
  const othersFB    = FALLBACK_ARTICLES.filter(a => !a.featured)

  // Most-read sidebar
  const sidebarTop5 = [
    'How to size a solar + battery system from your bill alone',
    'Federal Battery Rebate 2026: real numbers',
    'VPPs explained: should you join one?',
    'Net metering 2.0 and your feed-in tariff',
    'String vs. micro vs. hybrid inverters',
  ]

  return (
    <>
      <PageHeader
        eyebrow="Insights · industry · rebates"
        title="Australian energy.<br/>Demystified."
        lede="Plain-English guides to rebates, system sizing, batteries and EV charging — written by the engineers who design the systems, not by SEO writers."
      />

      <section className="section" style={{ background: 'var(--bv-paper-2)', paddingTop: 60 }}>
        <div className="container">
          {/* Featured */}
          {(useCMS ? featuredCMS : featuredFB) && (
            <Reveal>
              {useCMS ? (
                <Link href={`/news/${featuredCMS.slug}`} className="featured-article">
                  <div
                    className="featured-img"
                    style={{
                      backgroundImage: featuredCMS.coverImage
                        ? `url(${api.imgUrl(featuredCMS.coverImage, 'hero')})`
                        : 'linear-gradient(135deg, var(--bv-ink-700), var(--bv-ink-900))',
                    }}
                  />
                  <div className="body">
                    <div className="meta">
                      <span className="tag tag-amber">{featuredCMS.category}</span>
                      <span>{featuredCMS.readTime ? `${featuredCMS.readTime} min read` : ''}</span>
                    </div>
                    <h2>{featuredCMS.title}</h2>
                    <p>{featuredCMS.summary}</p>
                    <div className="author">
                      <div className="author-av">{(featuredCMS.author || 'BE').charAt(0)}</div>
                      <div>
                        <b>{featuredCMS.author || 'Bluven Team'}</b>
                        <span>{featuredCMS.publishedAt && new Date(featuredCMS.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <a className="featured-article" href={`#${featuredFB.id}`}>
                  <div className="featured-img" style={{ backgroundImage: `url(${featuredFB.img})` }} />
                  <div className="body">
                    <div className="meta">
                      <span className="tag tag-amber">Rebates</span>
                      <span>{featuredFB.meta}</span>
                    </div>
                    <h2>{featuredFB.title}</h2>
                    <p>{featuredFB.summary}</p>
                    <div className="author">
                      <div className="author-av">L</div>
                      <div>
                        <b>{featuredFB.author}</b>
                        <span>Founder · Bluven Energy</span>
                      </div>
                    </div>
                  </div>
                </a>
              )}
            </Reveal>
          )}

          {/* Tabs */}
          <Reveal className="insights-tabs" style={{ marginTop: 48 }}>
            {categories.map(c => (
              <button key={c.id} className={category === c.id ? 'active' : ''} onClick={() => filterCategory(c.id)}>
                {c.label}
              </button>
            ))}
          </Reveal>

          {/* 2-col main + sidebar */}
          <div className="news-side" style={{ marginTop: 32 }}>
            <div className="article-list">
              {(useCMS ? othersCMS : othersFB).map((a, i) => {
                if (useCMS) {
                  const cn = a as News
                  return (
                    <Reveal key={cn.id} delay={Math.min(i * 60, 300)}>
                      <Link href={`/news/${cn.slug}`} className="article">
                        <div className="article-img" style={{
                          backgroundImage: cn.coverImage
                            ? `url(${api.imgUrl(cn.coverImage, 'card')})`
                            : 'var(--bv-paper-2)',
                        }} />
                        <div className="body">
                          <div className="meta">
                            <span className="tag tag-navy">{cn.category}</span>
                            <span>{cn.readTime ? `${cn.readTime} min` : ''}</span>
                          </div>
                          <h3>{cn.title}</h3>
                          <p>{cn.summary}</p>
                          <span className="read">Read article →</span>
                        </div>
                      </Link>
                    </Reveal>
                  )
                } else {
                  const fb = a as FallbackArticle
                  return (
                    <Reveal key={fb.id} delay={Math.min(i * 60, 300)}>
                      <a className="article" href={`#${fb.id}`}>
                        <div className="article-img" style={{ backgroundImage: `url(${fb.img})` }} />
                        <div className="body">
                          <div className="meta">
                            <span className="tag tag-navy">{fb.meta.split('·')[0].trim()}</span>
                          </div>
                          <h3>{fb.title}</h3>
                          <p>{fb.summary}</p>
                          <span className="read">Read article →</span>
                        </div>
                      </a>
                    </Reveal>
                  )
                }
              })}
            </div>

            <aside>
              <div className="side-card">
                <h5>Most read this month</h5>
                {sidebarTop5.map((title, i) => (
                  <div key={i} className="news-item">
                    <span className="num">{String(i + 1).padStart(2, '0')}</span>
                    <span>{title}</span>
                  </div>
                ))}
              </div>
              <div className="newsletter">
                <h5>Bluven monthly</h5>
                <p>One email a month. Rebate changes, real install numbers, no fluff. 8,200 readers.</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const btn = (e.currentTarget as HTMLFormElement).querySelector('button')
                    if (btn) btn.textContent = '✓ Subscribed'
                  }}
                >
                  <input type="email" placeholder="you@email.com" required />
                  <button type="submit">Subscribe</button>
                </form>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
