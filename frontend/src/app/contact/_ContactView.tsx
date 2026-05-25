'use client'

import Link from 'next/link'
import { Reveal } from '@/components/ui/Reveal'
import { PageHeader } from '@/components/ui/PageHeader'
import type { SiteSettings } from '@/types/cms'

export function ContactView({ settings }: { settings: SiteSettings }) {
  const phone = settings?.phone || '1300 BLUVEN (1300 258 836)'
  const phoneHref = settings?.phoneHref || '+611300258836'
  const email = settings?.email || 'hello@bluven.com.au'

  const offices = [
    {
      city: 'Sydney', tag: 'SYD · HEAD OFFICE',
      addr: 'Unit 14, 39 Herbert St,',
      addr2: 'St Leonards NSW 2065',
      hours: 'Mon–Fri 8:30am – 5:30pm · Sat 9am – 1pm',
    },
    {
      city: 'Melbourne', tag: 'VIC',
      addr: 'Suite 6, 124 Victoria St,',
      addr2: 'Richmond VIC 3121',
      hours: 'Mon–Fri 9am – 5pm · Sat by appointment',
    },
    {
      city: 'Brisbane', tag: 'QLD',
      addr: 'Lvl 2, 88 Vulture St,',
      addr2: 'South Brisbane QLD 4101',
      hours: 'Mon–Fri 9am – 5pm · Sat by appointment',
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Get in touch"
        title="Three offices.<br/>One promise: a real engineer answers."
        lede="Showrooms in Sydney, Melbourne and Brisbane. Or call, email, or just open the chat — we usually answer within 30 minutes during business hours."
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
                Three offices across the east coast.
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
                  <svg className="map-svg" viewBox="0 0 600 480" xmlns="http://www.w3.org/2000/svg" aria-label="Australia service coverage">
                    <rect width="600" height="480" fill="#0a1828" />
                    {/* Simplified Australia outline */}
                    <path
                      d="M100 180 Q140 130 220 130 Q310 110 380 130 Q470 130 510 170 Q540 220 530 280 Q500 340 460 360 Q420 380 380 370 Q360 400 320 410 Q260 420 220 400 Q170 390 140 360 Q100 320 90 270 Q90 220 100 180 Z"
                      fill="#142b4d" stroke="rgba(251, 199, 7, 0.30)" strokeWidth="1"
                    />
                    {/* Tasmania */}
                    <ellipse cx="370" cy="430" rx="22" ry="14" fill="#142b4d" stroke="rgba(251, 199, 7, 0.30)" strokeWidth="1" />
                    {/* Service rings */}
                    <circle cx="430" cy="320" r="60" fill="none" stroke="rgba(231, 182, 88, 0.18)" strokeDasharray="4 4" />
                    <circle cx="430" cy="320" r="100" fill="none" stroke="rgba(231, 182, 88, 0.10)" strokeDasharray="4 4" />
                    {/* Brisbane */}
                    <g>
                      <circle cx="450" cy="220" r="14" fill="#19c0b1" opacity="0.25"/>
                      <circle cx="450" cy="220" r="6" fill="#19c0b1" />
                      <text x="468" y="225" fill="#fff" fontFamily="Montserrat, sans-serif" fontSize="12" fontWeight="600">Brisbane</text>
                    </g>
                    {/* Sydney HQ */}
                    <g>
                      <circle cx="430" cy="320" r="20" fill="#19c0b1" opacity="0.32" />
                      <circle cx="430" cy="320" r="9" fill="#19c0b1" />
                      <text x="448" y="325" fill="#fff" fontFamily="Montserrat, sans-serif" fontSize="13" fontWeight="800">Sydney · HQ</text>
                    </g>
                    {/* Melbourne */}
                    <g>
                      <circle cx="370" cy="375" r="14" fill="#19c0b1" opacity="0.25" />
                      <circle cx="370" cy="375" r="6" fill="#19c0b1" />
                      <text x="295" y="380" fill="#fff" fontFamily="Montserrat, sans-serif" fontSize="12" fontWeight="600">Melbourne</text>
                    </g>
                  </svg>
                  <div className="map-legend">
                    <b>SERVICE COVERAGE</b>
                    Greater Sydney · Greater Melbourne · SE Queensland
                    <span style={{ color: 'var(--bv-ink-400)' }}>
                      {' · Regional NSW/VIC by appointment'}
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
