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
              <a href="tel:+611300258836">📞 1300 258 836</a>
              <a href="mailto:info@bluven.com.au">✉ info@bluven.com.au</a>
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
              <Link href="/products#solar">{t('footer.starter')}</Link>
              <Link href="/products#battery">{t('footer.essential')}</Link>
              <Link href="/products#ev">{t('footer.premium')}</Link>
              <Link href="/products#commercial">{t('footer.commercial')}</Link>
            </div>
            <div>
              <h5>{t('footer.company')}</h5>
              <Link href="/who-we-are">{t('footer.who')}</Link>
              <Link href="/projects">{t('footer.proj')}</Link>
              <Link href="/news">{t('footer.insights')}</Link>
              <Link href="/contact">{t('footer.careers')}</Link>
            </div>
            <div>
              <h5>{t('footer.support')}</h5>
              <Link href="/faq">{t('footer.faq')}</Link>
              <Link href="/contact">{t('footer.contact')}</Link>
              <Link href="/quote">{t('footer.quote')}</Link>
              {/* Prod: link to the CMS admin domain; dev: /admin rewrite works */}
              <a
                href={`${process.env.NEXT_PUBLIC_CMS_URL || ''}/admin`}
                target="_blank"
                rel="noreferrer"
              >{t('footer.admin')}</a>
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
          </div>
        </div>
      </div>
    </footer>
  )
}
