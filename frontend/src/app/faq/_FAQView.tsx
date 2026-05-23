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
  // General
  { id: 'g1', c: 'general',
    q: 'How do I know if my roof is suitable for solar?',
    a: 'Most Australian roofs work — even south-facing in some cases. Our engineers do a free desktop assessment from satellite imagery first, then a 30-minute site visit to confirm pitch, shading, structural condition and switchboard space. Tile, tin and Klip-Lok are all supported.' },
  { id: 'g2', c: 'general',
    q: 'What size system do I need?',
    a: 'A rough rule of thumb: take your average daily usage (kWh) from your bill and aim to generate 1.5× that on a sunny day. For most Sydney households that lands around 6.6 – 10 kW. Add a battery if you want to use more than 50% of your generation at home.' },
  { id: 'g3', c: 'general',
    q: 'How long does a quote take?',
    a: 'A free desktop quote takes 60 seconds via our online sizer. A full engineered design (with 3D shade modelling and switchboard inspection) takes 3–5 business days after your site visit.' },

  // Rebates & pricing
  { id: 'r1', c: 'pricing',
    q: 'How does the Federal Battery Rebate work in 2026?',
    a: "The Cheaper Home Batteries Program offers a discount of up to ~$372/kWh on eligible battery systems installed from July 2025. For a 10 kWh battery that's ~$3,720 off — and we handle all the paperwork. It stacks with state rebates in NSW and VIC." },
  { id: 'r2', c: 'pricing',
    q: 'What rebates are available in my state?',
    a: 'Federal: STCs (small-scale) for solar, Federal Battery Rebate for storage. State: NSW PDRS and Empowering Homes loan; VIC Solar Homes rebate; QLD interest-free loans. We confirm exactly what you qualify for in your written quote.' },
  { id: 'r3', c: 'pricing',
    q: 'Do I need to apply for rebates myself?',
    a: 'No. We handle every form — STC creation, federal rebate paperwork, state rebate applications, and the meter reconfiguration with your retailer. You sign once. We do the rest.' },
  { id: 'r4', c: 'pricing',
    q: 'Are there finance options?',
    a: 'Yes. We partner with green finance providers offering 0% interest options up to 7 years on approved solar + battery installs. We also offer PPAs for commercial sites. Final terms confirmed in your quote.' },
  { id: 'r5', c: 'pricing',
    q: "What's a net meter and do I need a new one?",
    a: 'A net meter records both how much you import from the grid and how much you export back. Most homes installed since 2017 already have one. If yours doesn\'t, we coordinate the upgrade with your retailer at install — usually no extra cost.' },

  // Installation
  { id: 'i1', c: 'installation',
    q: 'How long does installation take?',
    a: 'A typical 6.6 – 10 kW residential install takes 1 – 2 days. Adding a battery adds half a day. Commercial 50 – 200 kW installs take 1 – 3 weeks depending on access and electrical work.' },
  { id: 'i2', c: 'installation',
    q: 'Will you damage my roof?',
    a: 'No. Our installers are CEC-accredited and use roof-specific mounting systems (KlipLok, tile-foot, fold-back tin). Every penetration is sealed with butyl + flashing, and we provide a workmanship warranty covering any roof leak caused by our install.' },
  { id: 'i3', c: 'installation',
    q: 'Do I need to be home during install?',
    a: 'You need to be home for ~15 minutes at the start (briefing) and end (commissioning walk-through and app setup). Otherwise, you\'re free to head out — we\'ll text updates and a final report.' },
  { id: 'i4', c: 'installation',
    q: 'What happens if it rains on install day?',
    a: "We'll reschedule. Safety first — wet roofs are no place for installers. We typically have spare slots within the same week." },

  // Battery
  { id: 'b1', c: 'products',
    q: 'Is a battery worth it for my home?',
    a: "For most NSW households generating > 8 kW with a daily usage > 25 kWh, yes — payback is 4 – 6 years depending on rebates. Below those thresholds it's a lifestyle choice (blackout protection, energy independence) more than a financial one. Our engineers run the exact calc for your bill." },
  { id: 'b2', c: 'products',
    q: "What's the difference between essential and whole-home backup?",
    a: 'Essential backup keeps a few key circuits (fridge, lights, internet, one power point) running during a blackout. Whole-home backup keeps everything running. Whole-home requires a more sophisticated battery + gateway and is ~$2,500 more.' },
  { id: 'b3', c: 'products',
    q: 'How long does a battery last?',
    a: 'Most modern LiFePO₄ batteries are warrantied for 10 years and 6,000 – 10,000 cycles. Real-world expected life is 12 – 15 years before they degrade to ~70% of original capacity.' },
  { id: 'b4', c: 'products',
    q: 'Can I add a battery to my existing solar?',
    a: 'Almost always, yes. We do this regularly — using AC-coupled batteries (Tesla Powerwall, Alpha SMILE) that talk to your existing inverter, or replacing your inverter with a hybrid if it makes more economic sense.' },

  // EV
  { id: 'e1', c: 'products',
    q: 'Will my solar power my EV?',
    a: 'Yes — and there are smart ways to do it. A solar-aware charger (Zappi, Ocular IQ) can be set to "Eco+" mode, which only charges your EV from solar surplus. On a sunny day with a 10 kW system, you can fully charge most EVs in 4 – 6 hours of free sunshine.' },
  { id: 'e2', c: 'products',
    q: 'Do I need a battery to charge my EV from solar?',
    a: "No, but it helps for evening charging. Without a battery, you'll only solar-charge during daylight. With one, surplus solar fills the battery first then powers the car overnight at off-peak rates." },
  { id: 'e3', c: 'products',
    q: 'Can I install an EV charger now and add solar later?',
    a: 'Yes. We pre-wire the home for solar at the same time so the future install is half the price.' },

  // Warranty / support
  { id: 'w1', c: 'support',
    q: 'What warranties come with my system?',
    a: '25 years on panels (product), 30 years on panels (performance), 10+ years on inverters and batteries, and 10+ years Bluven workmanship warranty on the install itself. All in writing, all backed by manufacturers with Australian offices.' },
  { id: 'w2', c: 'support',
    q: 'What if my system stops working?',
    a: 'Our app pings us before you notice anything\'s off. If something does go wrong, we have an Australian support team and most issues are resolved within 24 hours. Engineers visit on-site if needed — included in workmanship warranty.' },
  { id: 'w3', c: 'support',
    q: 'Do you offer ongoing monitoring?',
    a: 'Yes — included with every system, free for life. The Bluven Live app tracks generation, battery state, household loads, EV charging, plus alerts you to anything unusual.' },
  { id: 'w4', c: 'support',
    q: 'What if I sell my house?',
    a: "Our warranties are transferable to the new owner at no charge — we'll even do a free system health-check before settlement to keep things smooth." },
  { id: 'w5', c: 'support',
    q: 'Are you a CEC Approved Retailer?',
    a: "Yes — we're a CEC Approved Retailer and a signatory to the New Energy Tech Consumer Code (NETCC). It's the highest consumer-protection benchmark in Australian solar." },
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
        eyebrow="Frequently asked questions"
        title="Got questions?<br/>We've got answers."
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
