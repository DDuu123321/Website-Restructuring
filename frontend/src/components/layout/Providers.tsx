'use client'

import { ReactNode, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nProvider } from '@/i18n/I18nProvider'
import { FreeAssessmentProvider } from '@/components/assessment/FreeAssessmentModal'

export function Providers({ children }: { children: ReactNode }) {
  // One QueryClient per tab — useState ensures it's stable across re-renders
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <FreeAssessmentProvider>{children}</FreeAssessmentProvider>
      </I18nProvider>
    </QueryClientProvider>
  )
}
