import type { Metadata } from 'next'
import { api } from '@/api/client'
import { buildMetadata, breadcrumbLd } from '@/lib/seo'
import { JsonLd } from '@/components/ui/JsonLd'
import { RebatesView } from './_RebatesView'
import type { RebatesPage } from '@/types/cms'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const data = await api.rebatesPage().catch(() => null)
  return buildMetadata({
    title: data?.seo?.metaTitle || 'Solar & Battery Rebates in Australia (2026)',
    description:
      data?.seo?.metaDescription ||
      "Federal and state solar and battery rebates explained — the Cheaper Home Batteries Program, solar STCs, the NSW Virtual Power Plant incentive and Victoria's Solar Homes rebate. We handle all the paperwork.",
    path: '/rebates',
  })
}

export default async function Page() {
  const data = await api.rebatesPage().catch(() => ({}) as RebatesPage)
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Rebates', path: '/rebates' },
        ])}
      />
      <RebatesView data={data} />
    </>
  )
}
