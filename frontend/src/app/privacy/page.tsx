import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import { LegalPage } from '@/components/ui/LegalPage'

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy',
  description: 'How Bluven Energy collects, stores and uses your personal information.',
  path: '/privacy',
})

export default function Privacy() {
  return <LegalPage type="privacy" />
}
