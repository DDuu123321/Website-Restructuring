import Link from 'next/link'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Page not found',
  noindex: true,
})

export default function NotFound() {
  return (
    <section className="section" style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 120, fontWeight: 700, color: 'var(--bv-amber-500)', lineHeight: 1 }}>404</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, marginBottom: 16, marginTop: 16 }}>Page not found</h1>
        <p style={{ color: 'var(--bv-gray-600)', maxWidth: 480, margin: '0 auto 32px' }}>
          The page you're looking for may have moved or the link is incorrect.
        </p>
        <Link href="/" className="btn btn-primary"><span>Back to home</span> →</Link>
      </div>
    </section>
  )
}
