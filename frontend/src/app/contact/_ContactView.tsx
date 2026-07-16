'use client'

import Link from 'next/link'
import { Reveal } from '@/components/ui/Reveal'
import { PageHeader } from '@/components/ui/PageHeader'
import type { SiteSettings } from '@/types/cms'

export function ContactView({ settings }: { settings: Partial<SiteSettings> }) {
  const phone = settings?.phone || '1300 BLUVEN (1300 258 836)'
  const phoneHref = settings?.phoneHref || '+611300258836'
  const email = settings?.email || 'info@bluven.com.au'

  const offices = [
    {
      city: 'Sydney', tag: 'NSW · HEAD OFFICE',
      addr: '135-153 New South Head Road,',
      addr2: 'Edgecliff NSW 2027',
      hours: 'Mon–Fri 8:30am – 5:30pm · Sat 9am – 1pm',
    },
    {
      city: 'Brisbane', tag: 'QLD',
      addr: '23-25 Burchill St,',
      addr2: 'Loganholme QLD 4129',
      hours: 'Mon–Fri 9am – 5pm · Sat by appointment',
    },
    {
      city: 'Perth', tag: 'WA',
      addr: '80 Belgravia St,',
      addr2: 'Belmont WA 6104',
      hours: 'Mon–Fri 9am – 5pm · Sat by appointment',
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Get in touch"
        title="Three offices.<br/>One promise: a real engineer answers."
        lede="Showrooms in Sydney, Brisbane and Perth. Or call, email, or just open the chat — we usually answer within 30 minutes during business hours."
      />

      <section className="section" style={{ background: 'var(--bv-paper-2)', paddingTop: 60 }}>
        <div className="container">
          <div className="contact-grid">
            {/* 4 channels */}
            <span className="text-eyebrow">Talk to us</span>
              <h2 style={{ fontSize: 'clamp(24px, 2.6vw, 32px)', margin: '12px 0 24px' }}>
                Pick whichever channel suits you.
              </h2>
              <div className="channels">
                <a className="channel" href={`tel:${phoneHref}`}>
                  <div className="channel-icon">📞</div>
                  <h4>Phone</h4>
                  <p>Mon–Fri 8am–6pm AEST</p>
                  <b>{phone}</b>
                </a>
                <a className="channel" href={`mailto:${email}`}>
                  <div className="channel-icon">✉️</div>
                  <h4>Email</h4>
                  <p>Replies within 4 business hours</p>
                  <b>{email}</b>
                </a>
                <a className="channel" href="#" onClick={(e) => { e.preventDefault() }}>
                  <div className="channel-icon">💬</div>
                  <h4>Live chat</h4>
                  <p>AI-assisted, human-escalated</p>
                  <b>Open chat →</b>
                </a>
                <Link className="channel" href="/quote">
                  <div className="channel-icon">⚡</div>
                  <h4>Instant quote</h4>
                  <p>60-second sizer + rebate calc</p>
                  <b>Try it →</b>
                </Link>
              </div>

              {/* 3 offices */}
              <span className="text-eyebrow" style={{ marginTop: 24, display: 'inline-block' }}>
                Visit a showroom
              </span>
              <h2 style={{ fontSize: 'clamp(24px, 2.6vw, 32px)', margin: '12px 0 24px' }}>
                Three offices, coast to coast.
              </h2>

              {offices.map((o, i) => (
                <Reveal key={i} className="office" delay={i * 100}>
                  <div>
                    <span className="city-tag">{o.tag}</span>
                    <h4>{o.city}</h4>
                    <p>{o.addr}<br />{o.addr2}</p>
                    <div className="hours">{o.hours}</div>
                  </div>
                  <div className="img-placeholder office-img">
                    [ {o.city} showroom ]
                  </div>
                </Reveal>
              ))}

              {/* Australia map */}
              <div style={{ marginTop: 48 }}>
                <Reveal className="map-card">
                  <div className="map-au">
                    {/* Real Australia map — Wikimedia "Australia states blank.svg" (CC BY-SA 4.0), recoloured for the dark theme */}
                    <img className="map-au-img" src="/au-states.svg" alt="Australia — Bluven office locations" />
                    {[
                      { city: 'Brisbane', x: 91, y: 53, hq: false, lab: 'l' },
                      { city: 'Sydney · HQ', x: 88, y: 66, hq: true, lab: 'l' },
                      { city: 'Perth', x: 13, y: 66, hq: false, lab: 'r' },
                    ].map((p) => (
                      <span
                        key={p.city}
                        className={`map-pin ${p.hq ? 'is-hq' : ''} lab-${p.lab}`}
                        style={{ left: `${p.x}%`, top: `${p.y}%` }}
                      >
                        <span className="map-pin-dot" />
                        <span className="map-pin-label">{p.city}</span>
                      </span>
                    ))}
                  </div>
                  <div className="map-legend">
                    <b>SERVICE COVERAGE</b>
                    Greater Sydney · SE Queensland · Greater Perth
                    <span style={{ color: 'var(--bv-ink-400)' }}>
                      {' · Regional NSW/QLD/WA by appointment'}
                    </span>
                  </div>
                </Reveal>
              </div>
          </div>
        </div>
      </section>
    </>
  )
}
