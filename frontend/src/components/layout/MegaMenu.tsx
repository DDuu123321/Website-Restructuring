'use client'

import Link from 'next/link'
import { useI18n } from '@/i18n/I18nProvider'

interface Props {
  active: 'products' | 'company' | 'support' | null
  onClose: () => void
}

export function MegaMenu({ active, onClose }: Props) {
  const { t } = useI18n()
  return (
    <div className={`bv-mm-panel ${active ? 'open' : ''}`} data-pane={active || ''}>
      {active === 'products' && (
        <div className="bv-mm-pane active">
          <div className="bv-mm-pane-l">
            <span className="bv-mm-eye">{t('mm.products.eye')}</span>
            <p className="bv-mm-lede">{t('mm.products.lede')}</p>
            <Link className="bv-mm-cta" href="/quote" onClick={onClose}>
              <span>{t('nav.quote')}</span> →
            </Link>
          </div>
          <div className="bv-mm-grid">
            <Link className="bv-mm-card" href="/products#starter" onClick={onClose}>
              <div className="bv-mm-ico" style={{ background: 'linear-gradient(135deg,#FFE9A8,#F5B742)' }}>
                <Sun />
              </div>
              <div>
                <h6>{t('mm.products.solar')}</h6>
                <p>{t('mm.products.solar.s')}</p>
              </div>
            </Link>
            <Link className="bv-mm-card" href="/products#essential" onClick={onClose}>
              <div className="bv-mm-ico" style={{ background: 'linear-gradient(135deg,#BFE6F8,#5DA9F5)' }}>
                <Battery />
              </div>
              <div>
                <h6>{t('mm.products.battery')}</h6>
                <p>{t('mm.products.battery.s')}</p>
              </div>
            </Link>
            <Link className="bv-mm-card" href="/products#premium" onClick={onClose}>
              <div className="bv-mm-ico" style={{ background: 'linear-gradient(135deg,#C7F0D2,#4FB678)' }}>
                <Car />
              </div>
              <div>
                <h6>{t('mm.products.ev')}</h6>
                <p>{t('mm.products.ev.s')}</p>
              </div>
            </Link>
            <Link className="bv-mm-card" href="/products#commercial" onClick={onClose}>
              <div className="bv-mm-ico" style={{ background: 'linear-gradient(135deg,#E5DBFA,#9F87E8)' }}>
                <Building />
              </div>
              <div>
                <h6>{t('mm.products.commercial')}</h6>
                <p>{t('mm.products.commercial.s')}</p>
              </div>
            </Link>
          </div>
        </div>
      )}

      {active === 'company' && (
        <div className="bv-mm-pane active">
          <div className="bv-mm-pane-l">
            <span className="bv-mm-eye">{t('mm.about.eye')}</span>
            <p className="bv-mm-lede">Engineers first. Salespeople, never.</p>
            <Link className="bv-mm-cta" href="/who-we-are" onClick={onClose}>
              <span>{t('mm.about.who')}</span> →
            </Link>
          </div>
          <div className="bv-mm-grid">
            <CompanyCard href="/who-we-are" t={t('mm.about.who')} s={t('mm.about.who.s')} icon={<UserIcon />} onClose={onClose} />
            <CompanyCard href="/projects" t={t('mm.about.proj')} s={t('mm.about.proj.s')} icon={<PhotoIcon />} onClose={onClose} />
            <CompanyCard href="/brands" t={t('mm.about.brands')} s={t('mm.about.brands.s')} icon={<BrandsIcon />} onClose={onClose} />
            <CompanyCard href="/news" t={t('mm.about.news')} s={t('mm.about.news.s')} icon={<NewsIcon />} onClose={onClose} />
          </div>
        </div>
      )}

      {active === 'support' && (
        <div className="bv-mm-pane active">
          <div className="bv-mm-pane-l">
            <span className="bv-mm-eye">{t('mm.support.eye')}</span>
            <p className="bv-mm-lede">Talk to a real engineer, not a call centre.</p>
            <Link className="bv-mm-cta" href="/contact" onClick={onClose}>
              <span>{t('nav.contact')}</span> →
            </Link>
          </div>
          <div className="bv-mm-grid">
            <CompanyCard href="/faq" t={t('mm.support.faq')} s={t('mm.support.faq.s')} icon={<QuestionIcon />} onClose={onClose} />
            <CompanyCard href="/contact" t={t('mm.support.contact')} s={t('mm.support.contact.s')} icon={<ChatIcon />} onClose={onClose} />
            <CompanyCard href="/quote" t={t('nav.quote')} s="Live estimate in 30 seconds" icon={<CheckIcon />} onClose={onClose} />
            <CompanyCard href="/admin" t={t('mm.support.admin')} s={t('mm.support.admin.s')} icon={<LockIcon />} onClose={onClose} />
          </div>
        </div>
      )}
    </div>
  )
}

function CompanyCard({ href, t, s, icon, onClose }: { href: string; t: string; s: string; icon: any; onClose: () => void }) {
  return (
    <Link className="bv-mm-card" href={href} onClick={onClose}>
      <div className="bv-mm-ico bv-mm-ico-line">{icon}</div>
      <div><h6>{t}</h6><p>{s}</p></div>
    </Link>
  )
}

// SVG icon set
const Sun = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1f3a" strokeWidth="1.7"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/></svg>
const Battery = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1f3a" strokeWidth="1.7"><rect x="5" y="6" width="14" height="14" rx="2"/><path d="M9 3h6v3M9 14l2 2 4-4"/></svg>
const Car = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1f3a" strokeWidth="1.7"><path d="M3 17V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v9"/><path d="M3 17h14M17 11h2l2 3v3h-4"/><circle cx="7" cy="19" r="2"/><circle cx="17" cy="19" r="2"/></svg>
const Building = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1f3a" strokeWidth="1.7"><path d="M3 21V8l9-5 9 5v13"/><path d="M9 21v-7h6v7M3 21h18"/></svg>
const UserIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>
const PhotoIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10l6 4 4-3 8 5"/></svg>
const BrandsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 7l8-4 8 4v10l-8 4-8-4z"/><path d="M4 7l8 4 8-4M12 11v10"/></svg>
const NewsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/></svg>
const QuestionIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2.5-2.5 4M12 17h.01"/></svg>
const ChatIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
const CheckIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M9 12l2 2 4-4M5 5h14v14H5z"/></svg>
const LockIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
