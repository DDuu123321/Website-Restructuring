import { ReactNode } from 'react'
import { Reveal } from './Reveal'

interface PageHeaderProps {
  eyebrow?: string
  title: ReactNode
  lede?: ReactNode
  background?: 'cream' | 'white' | 'navy'
}

export function PageHeader({ eyebrow, title, lede, background = 'navy' }: PageHeaderProps) {
  const dark = background === 'navy'
  const bg = background === 'cream'
    ? 'linear-gradient(180deg, var(--bv-paper-2) 0%, var(--bv-paper-3) 100%)'
    : background === 'white'
      ? 'var(--bv-white)'
      : 'linear-gradient(180deg, var(--bv-ink-950) 0%, var(--bv-ink-800) 100%)'
  const textColor = dark ? 'var(--bv-white)' : 'var(--bv-ink-900)'
  const ledeColor = dark ? 'rgba(255,255,255,0.78)' : 'var(--bv-ink-500)'
  const eyeColor = dark ? 'var(--bv-teal-300)' : 'var(--bv-teal-600)'

  return (
    <header className={`page-head ${dark ? 'is-dark' : 'is-light'}`} style={{ background: bg, color: textColor }}>
      <div className="container">
        <Reveal className="page-head-inner" style={{ margin: '0 auto', textAlign: 'center' }}>
          {eyebrow && <span className="text-eyebrow" style={{ color: eyeColor }}>{eyebrow}</span>}
          {typeof title === 'string'
            ? <h1 style={{ color: textColor }} dangerouslySetInnerHTML={{ __html: title }} />
            : <h1 style={{ color: textColor }}>{title}</h1>}
          {lede && (
            typeof lede === 'string'
              ? <p className="lede" style={{ color: ledeColor, margin: '18px auto 0', maxWidth: 720 }} dangerouslySetInnerHTML={{ __html: lede }} />
              : <p className="lede" style={{ color: ledeColor, margin: '18px auto 0', maxWidth: 720 }}>{lede}</p>
          )}
        </Reveal>
      </div>
    </header>
  )
}
