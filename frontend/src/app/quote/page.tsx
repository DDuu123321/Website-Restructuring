import type { Metadata } from 'next'
import { buildMetadata, breadcrumbLd } from '@/lib/seo'
import { JsonLd } from '@/components/ui/JsonLd'
import { QuoteView } from './_QuoteView'

export const metadata: Metadata = buildMetadata({
  title: 'Get a free quote — 60 seconds',
  description: 'Designed by an engineer, priced before you finish your coffee. Answer 5 quick questions for an instant estimate with rebates calculated.',
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
