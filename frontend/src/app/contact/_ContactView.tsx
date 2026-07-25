'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Reveal } from '@/components/ui/Reveal'
import { PageHeader } from '@/components/ui/PageHeader'
import type { SiteSettings } from '@/types/cms'

// Office locations — shown ONLY inside the map-pin click popups (no cards, no photos).
// x/y are percentages of the network-map SVG's 1700×1250 viewBox, taken straight
// from the generator so each hit area sits exactly on its yellow office icon.
const MAP_PINS = [
  {
    city: 'Brisbane', tag: 'QLD',
    addr: '23-25 Burchill St,', addr2: 'Loganholme QLD 4129',
    x: 86.54, y: 47.36, hq: false, lab: 'l' as const,
  },
  {
    city: 'Sydney', tag: 'NSW · HEAD OFFICE',
    addr: '135-153 New South Head Road,', addr2: 'Edgecliff NSW 2027',
    x: 83.77, y: 65.06, hq: true, lab: 'l' as const,
  },
  {
    city: 'Perth', tag: 'WA',
    addr: '80 Belgravia St,', addr2: 'Belmont WA 6104',
    x: 23.75, y: 59.62, hq: false, lab: 'r' as const,
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
                <Reveal className="map-wrap">
                  <div className="map-card">
                    <div className="map-au">
                      {/* Nationwide network map. Office labels and the legend are NOT baked
                         into the SVG — the pins below supply them as hover labels, and the
                         HTML legend stays legible at any width. One file serves every width:
                         the map carries no baked-in text, so nothing shrinks into mush. */}
                      <img
                        className="map-au-img"
                        src="/bluven-network-map-web.svg"
                        alt="Bluven's Australia-wide service coverage — offices in Brisbane, Sydney and Perth, with coverage across the populated coastline"
                        width={1700}
                        height={1250}
                      />
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
                  </div>
                  {/* Legend lives in HTML, not in the SVG: it has to stay readable when
                     the map scales down, and it wraps to two rows on narrow screens. */}
                  <div className="map-legend">
                    <b>OUR NETWORK</b>
                    <ul className="map-legend-keys">
                      <li><i className="map-key map-key--office" />Bluven office</li>
                      <li><i className="map-key map-key--partner" />Service coverage area</li>
                    </ul>
                  </div>
                </Reveal>
              </div>
          </div>
        </div>
      </section>
    </>
  )
}
