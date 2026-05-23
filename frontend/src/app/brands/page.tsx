import type { Metadata } from 'next'
import { api } from '@/api/client'
import { buildMetadata, breadcrumbLd } from '@/lib/seo'
import { JsonLd } from '@/components/ui/JsonLd'
import { BrandsView } from './_BrandsView'

export const revalidate = 60

export const metadata: Metadata = buildMetadata({
  title: 'Brand partners — Tier-1 only',
  description: 'Tesla, BYD, Sungrow, GoodWe, Trina, JinKO, SiGenergy and FoxESS. Every brand we install is Tier-1 with 5+ years of Australian field data.',
  path: '/brands',
})

export default async function BrandsPage() {
  const data = await api.brands().catch(() => ({ docs: [] }))
  return (
    <>
      <JsonLd data={breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: 'Brand Partners', path: '/brands' },
      ])} />
      <BrandsView brands={data.docs as any} />
    </>
  )
}
