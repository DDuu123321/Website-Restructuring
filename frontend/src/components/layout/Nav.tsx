'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useI18n } from '@/i18n/I18nProvider'
import { FreeAssessmentStickyButton } from '@/components/assessment/FreeAssessmentModal'
import { Logo } from './Logo'
import { MegaMenu } from './MegaMenu'

export function Nav() {
  const { t } = useI18n()
  const pathname = usePathname() || '/'
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activePane, setActivePane] = useState<'products' | 'company' | 'support' | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openPane = (p: 'products' | 'company' | 'support') => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null }
    setActivePane(p)
  }
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setActivePane(null), 180)
  }
  const cancelClose = () => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null }
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setActivePane(null)
    setMobileOpen(false)
  }, [pathname])

  // Routes whose PageHeader uses a light (cream/white) background — keep nav text dark there
  const LIGHT_HERO_ROUTES = ['/quote']
  const isDarkHero = !LIGHT_HERO_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))

  const isActive = (paths: string[]) => paths.some(p => pathname.startsWith(p))
  const linkClass = (paths: string[]) => isActive(paths) ? 'is-active' : ''

  const navClass = ['bv-nav', isDarkHero ? 'dark' : '', scrolled ? 'scrolled' : ''].filter(Boolean).join(' ')

  return (
    <>
      <nav className={navClass} id="bvNav" onMouseLeave={scheduleClose} onMouseEnter={cancelClose}>
        <div className="bv-nav-inner">
          <Logo />

          <ul className="bv-nav-links">
            <li><Link className={pathname === '/' ? 'is-active' : ''} href="/">{t('nav.home')}</Link></li>

            <li className={`bv-mm-item ${activePane==='products' ? 'mm-open' : ''}`}>
              <button
                className={`bv-mm-trigger ${isActive(['/products','/quote']) ? 'is-active' : ''}`}
                onMouseEnter={() => openPane('products')}
                onClick={() => setActivePane(activePane === 'products' ? null : 'products')}
              >
                <span>{t('nav.products')}</span>
                <Caret />
              </button>
            </li>

            <li className={`bv-mm-item ${activePane==='company' ? 'mm-open' : ''}`}>
              <button
                className={`bv-mm-trigger ${isActive(['/who-we-are','/projects','/brands','/news']) ? 'is-active' : ''}`}
                onMouseEnter={() => openPane('company')}
                onClick={() => setActivePane(activePane === 'company' ? null : 'company')}
              >
                <span>{t('mm.about.eye')}</span>
                <Caret />
              </button>
            </li>

            <li className={`bv-mm-item ${activePane==='support' ? 'mm-open' : ''}`}>
              <button
                className={`bv-mm-trigger ${isActive(['/faq','/contact']) ? 'is-active' : ''}`}
                onMouseEnter={() => openPane('support')}
                onClick={() => setActivePane(activePane === 'support' ? null : 'support')}
              >
                <span>{t('mm.support.eye')}</span>
                <Caret />
              </button>
            </li>
          </ul>

          <div className="bv-nav-actions">
            <a className="bv-call" href="tel:+611300258836" aria-label="Call 1300 258 836">
              <span className="bv-call-icon" aria-hidden>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/>
                </svg>
              </span>
              <span className="bv-call-text">
                <span className="bv-call-eye">{t('nav.callLabel')}</span>
                <span className="bv-call-num">1300 258 836</span>
              </span>
            </a>
            <Link className="btn btn-primary bv-quote-btn" href="/quote">
              <span>{t('nav.quote')}</span> <span className="arrow">→</span>
            </Link>
            <button
              className={`bv-burger ${mobileOpen ? 'open' : ''}`}
              aria-label="Menu"
              onClick={() => setMobileOpen(o => !o)}
            >
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>

        <MegaMenu active={activePane} onClose={() => setActivePane(null)} />

        <div className={`bv-mobile-menu ${mobileOpen ? 'open' : ''}`}>
          <Link className={pathname === '/' ? 'is-active' : ''} href="/">{t('nav.home')}</Link>
          <Link className={linkClass(['/products'])} href="/products">{t('nav.products')}</Link>
          <Link className={linkClass(['/projects'])} href="/projects">{t('nav.projects')}</Link>
          <Link className={linkClass(['/brands'])} href="/brands">{t('nav.brands')}</Link>
          <Link className={linkClass(['/who-we-are'])} href="/who-we-are">{t('nav.who')}</Link>
          <Link className={linkClass(['/news'])} href="/news">{t('nav.news')}</Link>
          <Link className={linkClass(['/faq'])} href="/faq">{t('nav.faq')}</Link>
          <Link className={linkClass(['/contact'])} href="/contact">{t('nav.contact')}</Link>
          <a className="bv-mobile-call" href="tel:+611300258836">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/>
            </svg>
            1300 258 836
          </a>
          <Link className="btn btn-primary" href="/quote" style={{ marginTop: 8 }}>
            <span>{t('nav.quote')}</span> →
          </Link>
        </div>
      </nav>

      {!pathname.startsWith('/quote') && (
        <>
          <FreeAssessmentStickyButton show={scrolled} />
          <Link className={`bv-sticky-quote ${scrolled ? 'show' : ''}`} href="/quote" aria-label="Get a quote">
            <span className="bv-sq-pulse"></span>
            <span className="bv-sq-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/>
                <circle cx="12" cy="12" r="4"/>
              </svg>
            </span>
            <span className="bv-sq-label">{t('sticky.quote')}</span>
            <span className="bv-sq-arrow">→</span>
          </Link>
        </>
      )}
    </>
  )
}

function Caret() {
  return (
    <svg className="bv-mm-caret" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M2 4l4 4 4-4"/>
    </svg>
  )
}
