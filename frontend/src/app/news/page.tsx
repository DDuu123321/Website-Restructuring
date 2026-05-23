import { Metadata } from 'next'
import { api } from '@/api/client'
import { buildMetadata, breadcrumbLd } from '@/lib/seo'
import { JsonLd } from '@/components/ui/JsonLd'
import { NewsListView } from './_NewsListView'

export const revalidate = 60

export const metadata: Metadata = buildMetadata({
  title: 'Insights & News',
  description: 'Plain-English deep dives on solar, batteries, rebates and Australian clean-energy policy.',
  path: '/news',
})

export default async function NewsListPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const data = await api.news({ limit: 12, category: searchParams.category }).catch(() => ({ docs: [] }))

  return (
    <>
      <JsonLd data={breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: 'Insights & News', path: '/news' },
      ])} />
      <NewsListView articles={data.docs as any} initialCategory={searchParams.category || ''} />
    </>
  )
}
