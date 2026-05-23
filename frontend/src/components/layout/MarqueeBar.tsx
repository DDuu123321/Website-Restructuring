'use client'

import Link from 'next/link'

export function MarqueeBar() {
  const items = [
    '🔥 Federal battery rebate 2026 — up to $4,650 off per household',
    '⚡ New-Year promotion · Tesla Powerwall 3 — $1,200 instant discount',
    '☀ 13 kW solar + 10 kWh battery · 6-yr payback',
    '🔋 AlphaESS G3 line — 9.3 / 13.3 / 13.9 kWh in stock',
    '🚗 Free Tesla EV Wall Connector upgrade · solar-aware charging',
    '📞 Call 1300 BLUVEN · Engineer call-back within 24h',
  ]

  const looped = [...items, ...items]

  return (
    <Link href="/quote" className="bv-marquee-bar" aria-label="View current offers">
      <div className="bv-marquee-track">
        {looped.map((it, i) => (
          <span key={i}>{it}</span>
        ))}
      </div>
    </Link>
  )
}
