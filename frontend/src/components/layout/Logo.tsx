import Link from 'next/link'

/**
 * Brand logo — the real Bluven horizontal logo (transparent PNG).
 * Two variants swap by context via CSS:
 *   · light backgrounds (white nav / light pages) → navy wordmark  → bluven-logo.png
 *   · dark nav (hero) + footer                    → white reverse  → bluven-logo-white.png
 */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`bv-logo ${className}`} aria-label="Bluven Energy — home">
      <img src="/bluven-logo.png" alt="Bluven Energy" className="bv-logo-img bv-logo-on-light" />
      <img src="/bluven-logo-white.png" alt="" aria-hidden="true" className="bv-logo-img bv-logo-on-dark" />
    </Link>
  )
}
