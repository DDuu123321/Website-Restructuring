import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import { LegalPage } from '@/components/ui/LegalPage'

export const metadata: Metadata = buildMetadata({
  title: 'Terms of Service',
  description: 'Terms and conditions for using the Bluven Energy website and services.',
  path: '/terms',
})

export default function Terms() {
  return <LegalPage type="terms" />
}
