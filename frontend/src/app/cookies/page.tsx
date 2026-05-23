import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import { LegalPage } from '@/components/ui/LegalPage'

export const metadata: Metadata = buildMetadata({
  title: 'Cookie Notice',
  description: 'How Bluven Energy uses cookies and how you can manage them.',
  path: '/cookies',
})

export default function Cookies() {
  return <LegalPage type="cookies" />
}
