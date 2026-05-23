import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import { join } from 'path'
import { SITE } from '@/lib/seo'

// nodejs runtime so we can read the real logo PNG from /public
export const runtime = 'nodejs'
// Generate at request time, not build time — avoids @vercel/og + non-ASCII path
// issues during prerender on Windows, and matches typical OG-image behaviour.
export const dynamic = 'force-dynamic'
export const alt = SITE.name
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

function logoDataUri(): string {
  try {
    const buf = readFileSync(join(process.cwd(), 'public', 'bluven-logo-white.png'))
    return `data:image/png;base64,${buf.toString('base64')}`
  } catch {
    return ''
  }
}

export default async function OpengraphImage() {
  const logo = logoDataUri()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%',
          background: 'linear-gradient(135deg, #0a1828 0%, #0d1f3c 60%, #142b4d 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: 80, color: '#fff',
        }}
      >
        {logo
          ? <img src={logo} width={340} height={102} alt="" style={{ marginBottom: 44 }} />
          : <div style={{ fontSize: 40, fontWeight: 800, marginBottom: 44 }}>BLUVEN ENERGY</div>}
        <div style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.12, maxWidth: 1000, letterSpacing: -1 }}>
          Your Home. Your Power. Your Savings.
        </div>
        <div style={{ fontSize: 26, color: '#8ee5dc', marginTop: 36, fontWeight: 600 }}>
          Solar · Battery · EV Charging · Australia
        </div>
      </div>
    ),
    size
  )
}
