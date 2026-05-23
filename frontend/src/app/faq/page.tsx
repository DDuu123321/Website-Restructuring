import type { Metadata } from 'next'
import { api } from '@/api/client'
import { buildMetadata, faqLd, breadcrumbLd } from '@/lib/seo'
import { JsonLd } from '@/components/ui/JsonLd'
import { richTextToPlain } from '@/components/ui/RichText'
import { FAQView } from './_FAQView'

export const revalidate = 60

export const metadata: Metadata = buildMetadata({
  title: 'Frequently Asked Questions',
  description: 'Answers to common questions about solar, batteries, EV charging, government rebates and Bluven Energy installation.',
  path: '/faq',
})

export default async function FAQPage() {
  const data = await api.faq().catch(() => ({ docs: [] }))

  // Build FAQPage JSON-LD — Google may show these as rich snippets
  const ldEntries = data.docs.slice(0, 20).map(item => ({
    question: item.question,
    answer: richTextToPlain(item.answer, 500) || 'See website for full answer.',
  }))

  return (
    <>
      <JsonLd data={[
        faqLd(ldEntries),
        breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'FAQ', path: '/faq' },
        ]),
      ]} />
      <FAQView items={data.docs as any} />
    </>
  )
}
