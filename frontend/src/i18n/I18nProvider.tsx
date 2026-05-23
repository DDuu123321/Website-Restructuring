'use client'

import { createContext, useContext, useMemo, ReactNode } from 'react'
import { dictionary, Locale, DictKey } from './dictionary'

interface I18nContextValue {
  lang: Locale
  /** No-op — kept for API compatibility with components that still call setLang */
  setLang: (l: Locale) => void
  t: (key: DictKey, fallback?: string) => string
  /** Always false — kept for API compatibility */
  isZh: boolean
}

const I18nContext = createContext<I18nContextValue | null>(null)

/**
 * Provider locked to English. The bilingual switcher / localStorage / browser
 * detection were removed when the project went English-only.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const value = useMemo<I18nContextValue>(
    () => ({
      lang: 'en',
      setLang: () => {},
      t: (key, fallback) => dictionary.en[key] ?? fallback ?? key,
      isZh: false,
    }),
    [],
  )
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>')
  return ctx
}

export function T({
  k,
  fallback,
  html = false,
  as: Tag = 'span',
}: {
  k: DictKey
  fallback?: string
  html?: boolean
  as?: keyof JSX.IntrinsicElements
}) {
  const { t } = useI18n()
  const value = t(k, fallback)
  if (html) {
    return <Tag dangerouslySetInnerHTML={{ __html: value }} />
  }
  return <Tag>{value}</Tag>
}
