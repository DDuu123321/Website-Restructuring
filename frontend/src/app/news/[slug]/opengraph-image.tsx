import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import { join } from 'path'
import { api } from '@/api/client'

export const runtime = 'nodejs'
export const alt = 'Bluven Energy article'
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

export default async function OG({ params }: { params: { slug: string } }) {
  const article = await api.newsBySlug(params.slug).catch(() => null)
  const title = article?.title || 'Bluven Energy'
  const category = article?.category?.toUpperCase() || 'INSIGHTS'
  const mark = logoDataUri()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%',
          background: 'linear-gradient(135deg, #0a1828 0%, #0d1f3c 60%, #142b4d 100%)',
          display: 'flex', flexDirection: 'column', padding: 80, color: '#fff',
        }}
      >
        <div style={{ fontSize: 22, color: '#8ee5dc', letterSpacing: '0.14em', marginBottom: 32, fontWeight: 700 }}>
          {category}
        </div>
        <div style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.15, flex: 1, letterSpacing: -1 }}>{title}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 40 }}>
          {mark
            ? <img src={mark} width={216} height={65} alt="" />
            : <div style={{ fontSize: 26, fontWeight: 800 }}>BLUVEN ENERGY</div>}
          <div style={{ fontSize: 18, color: '#94a3b8' }}>bluven.com.au</div>
        </div>
      </div>
    ),
    size
  )
}
