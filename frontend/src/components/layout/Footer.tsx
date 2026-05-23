'use client'

import Link from 'next/link'
import { useI18n } from '@/i18n/I18nProvider'
import { Logo } from './Logo'

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className="bv-footer">
      <div className="container">
        <div className="bv-footer-top">
          <div className="bv-footer-brand">
            <Logo />
            <div className="bv-footer-slogan">Your Home. Your Power. Your Savings.</div>
            <p>{t('footer.tagline')}</p>
            <div className="bv-footer-contact">
              <a href="tel:+611300258836">📞 1300 BLUVEN <span>(1300 258 836)</span></a>
              <a href="mailto:hello@bluven.com.au">✉ hello@bluven.com.au</a>
            </div>
            <div className="bv-footer-cta">
              <Link className="btn btn-primary" href="/quote">
                <span>{t('nav.quote')}</span> →
              </Link>
              <Link className="btn btn-ghost" href="/contact">
                <span>{t('nav.contact')}</span>
              </Link>
            </div>
          </div>
          <div className="bv-footer-cols">
            <div>
              <h5>{t('footer.products')}</h5>
              <Link href="/products#starter">{t('footer.starter')}</Link>
              <Link href="/products#essential">{t('footer.essential')}</Link>
              <Link href="/products#premium">{t('footer.premium')}</Link>
              <Link href="/products#commercial">{t('footer.commercial')}</Link>
            </div>
            <div>
              <h5>{t('footer.company')}</h5>
              <Link href="/who-we-are">{t('footer.who')}</Link>
              <Link href="/projects">{t('footer.proj')}</Link>
              <Link href="/brands">{t('footer.brands')}</Link>
              <Link href="/news">{t('footer.insights')}</Link>
              <Link href="/contact#careers">{t('footer.careers')}</Link>
            </div>
            <div>
              <h5>{t('footer.support')}</h5>
              <Link href="/faq">{t('footer.faq')}</Link>
              <Link href="/contact">{t('footer.contact')}</Link>
              <Link href="/quote">{t('footer.quote')}</Link>
              <a href="/admin" target="_blank" rel="noreferrer">{t('footer.admin')}</a>
            </div>
            <div>
              <h5>{t('footer.legal')}</h5>
              <Link href="/privacy">{t('footer.privacy')}</Link>
              <Link href="/terms">{t('footer.terms')}</Link>
              <Link href="/cookies">{t('footer.cookies')}</Link>
            </div>
          </div>
        </div>
        <div className="bv-footer-bottom">
          <div className="bv-footer-meta">
            <span>{t('footer.copy')}</span>
            <span>{t('footer.cec')}</span>
          </div>
          <div className="bv-footer-social">
            <a aria-label="LinkedIn" href="#"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5c0 1.38-1.12 2.5-2.5 2.5S0 4.88 0 3.5 1.12 1 2.48 1s2.5 1.12 2.5 2.5zM.22 8h4.52v14H.22V8zm7.5 0h4.34v1.91h.06c.6-1.14 2.08-2.34 4.28-2.34 4.58 0 5.42 3.02 5.42 6.94V22h-4.5v-6.62c0-1.58-.03-3.6-2.2-3.6-2.2 0-2.54 1.72-2.54 3.5V22H7.72V8z"/></svg></a>
            <a aria-label="Facebook" href="#"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 5 3.66 9.13 8.44 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99C18.34 21.13 22 17 22 12z"/></svg></a>
            <a aria-label="Instagram" href="#"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.16c3.2 0 3.58 0 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07-3.2 0-3.58-.01-4.85-.07-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.18 8.8 2.16 12 2.16zm0 5.4a4.44 4.44 0 1 0 0 8.88 4.44 4.44 0 0 0 0-8.88zM12 14.4a2.4 2.4 0 1 1 0-4.8 2.4 2.4 0 0 1 0 4.8zm4.67-7.16a1.04 1.04 0 1 0 0 2.08 1.04 1.04 0 0 0 0-2.08z"/></svg></a>
            <a aria-label="YouTube" href="#"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.13C19.55 3.5 12 3.5 12 3.5s-7.55 0-9.4.57A3 3 0 0 0 .5 6.2C0 8.06 0 12 0 12s0 3.94.5 5.8a3 3 0 0 0 2.1 2.13C4.45 20.5 12 20.5 12 20.5s7.55 0 9.4-.57a3 3 0 0 0 2.1-2.13C24 15.94 24 12 24 12s0-3.94-.5-5.8zM9.6 15.6V8.4l6.27 3.6-6.27 3.6z"/></svg></a>
          </div>
        </div>
      </div>
    </footer>
  )
}
