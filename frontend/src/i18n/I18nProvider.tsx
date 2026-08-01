'use client'

import { createContext, useContext, useMemo, ReactNode } from 'react'
import { dictionary, Locale, DictKey } from './dictionary'

interface I18nContextValue {
  lang: Locale
  t: (key: DictKey) => string
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
      t: (key) => dictionary.en[key] ?? key,
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

export function T({ k }: { k: DictKey }) {
  const { t } = useI18n()
  return <span>{t(k)}</span>
}
