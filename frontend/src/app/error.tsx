'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <section className="section" style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 40 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, marginBottom: 16 }}>Something went wrong</h1>
        <p style={{ color: 'var(--bv-gray-600)', maxWidth: 480, margin: '0 auto 24px' }}>
          We hit an unexpected error. Try again or call 1300 BLUVEN.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={() => reset()} className="btn btn-primary"><span>Try again</span> →</button>
          <Link href="/" className="btn btn-ghost"><span>Back to home</span></Link>
        </div>
      </div>
    </section>
  )
}
