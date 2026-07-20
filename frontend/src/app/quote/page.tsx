import type { Metadata } from 'next'
import { buildMetadata, breadcrumbLd } from '@/lib/seo'
import { JsonLd } from '@/components/ui/JsonLd'
import { QuoteView } from './_QuoteView'

export const metadata: Metadata = buildMetadata({
  title: 'Get a free quote',
  description: 'Tell us about your home and energy usage — a Bluven engineer designs your system and replies with a tailored quote, rebates included.',
  path: '/quote',
})

export default function QuotePage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: 'Get a Quote', path: '/quote' },
      ])} />
      <QuoteView />
    </>
  )
}
