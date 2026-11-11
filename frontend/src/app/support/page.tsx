import type { Metadata } from 'next'
import { buildMetadata, breadcrumbLd } from '@/lib/seo'
import { JsonLd } from '@/components/ui/JsonLd'
import { SupportView } from './_SupportView'

export const metadata: Metadata = buildMetadata({
  title: 'After-sales support',
  description: 'Existing Bluven customer with a fault, warranty question or delivery follow-up? Tell our technical team what’s happening and we’ll reply by email.',
  path: '/support',
})

export default function SupportPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: 'After-sales Support', path: '/support' },
      ])} />
      <SupportView />
    </>
  )
}
