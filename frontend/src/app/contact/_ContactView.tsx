'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Reveal } from '@/components/ui/Reveal'
import { PageHeader } from '@/components/ui/PageHeader'
import type { SiteSettings } from '@/types/cms'

// Office locations — shown ONLY inside the map-pin click popups (no cards, no photos).
const MAP_PINS = [
  {
    city: 'Brisbane', tag: 'QLD',
    addr: '23-25 Burchill St,', addr2: 'Loganholme QLD 4129',
    x: 91, y: 53, hq: false, lab: 'l' as const,
  },
  {
    city: 'Sydney · HQ', tag: 'NSW · HEAD OFFICE',
    addr: '135-153 New South Head Road,', addr2: 'Edgecliff NSW 2027',
    x: 88, y: 66, hq: true, lab: 'l' as const,
  },
  {
    city: 'Perth', tag: 'WA',
    addr: '80 Belgravia St,', addr2: 'Belmont WA 6104',
    x: 13, y: 66, hq: false, lab: 'r' as const,
  },
]

export function ContactView({ settings }: { settings: Partial<SiteSettings> }) {
  const phone = settings?.phone || '1300 258 836'
  const phoneHref = settings?.phoneHref || '+611300258836'
  const email = settings?.email || 'info@bluven.com.au'
  const [openPin, setOpenPin] = useState<string | null>(null)

  // Close the pin popup on Escape or on any click outside a pin
  useEffect(() => {
    if (!openPin) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenPin(null) }
    const onClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.map-pin')) setOpenPin(null)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onClick)
    }
  }, [openPin])

  return (
    <>
      <PageHeader
        eyebrow="Get in touch"
        title="One promise: a real engineer answers."
        lede="Call, email, or just open the chat — we usually answer within 30 minutes during business hours."
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
                <a
                  className="channel"
                  href="#"
                  onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('bv:open-chat')) }}
                >
                  <div className="channel-icon">💬</div>
                  <h4>Live chat</h4>
                  <p>AI-assisted, human-escalated</p>
                  <b>Open chat →</b>
                </a>
                <Link className="channel" href="/quote">
                  <div className="channel-icon">⚡</div>
                  <h4>Free quote</h4>
                  <p>Quick form — an engineer replies</p>
                  <b>Start →</b>
                </Link>
              </div>

              {/* Office locations — no longer listed as cards; the map below reveals
                 each city name only on hover (see .map-pin-label in inner.css). */}
              {/* Australia map */}
              <div style={{ marginTop: 48 }}>
                <Reveal className="map-card">
                  <div className="map-au">
                    {/* Real Australia map — Wikimedia "Australia states blank.svg" (CC BY-SA 4.0), recoloured for the dark theme */}
                    <img className="map-au-img" src="/au-states.svg" alt="Australia — Bluven office locations" />
                    {MAP_PINS.map((p) => (
                      <span
                        key={p.city}
                        className={`map-pin ${p.hq ? 'is-hq' : ''} lab-${p.lab} ${openPin === p.city ? 'is-open' : ''}`}
                        style={{ left: `${p.x}%`, top: `${p.y}%` }}
                      >
                        <button
                          type="button"
                          className="map-pin-btn"
                          aria-expanded={openPin === p.city}
                          aria-label={`${p.city} office location`}
                          onClick={() => setOpenPin(openPin === p.city ? null : p.city)}
                        >
                          <span className="map-pin-dot" />
                        </button>
                        <span className="map-pin-label">{p.city}</span>
                        {openPin === p.city && (
                          <div className="map-popup" role="dialog" aria-label={`${p.city} address`}>
                            <button type="button" className="map-popup-x" aria-label="Close" onClick={() => setOpenPin(null)}>×</button>
                            <b className="map-popup-tag">{p.tag}</b>
                            <div className="map-popup-city">{p.city}</div>
                            <p className="map-popup-addr">{p.addr}<br />{p.addr2}</p>
                          </div>
                        )}
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
