import type { Metadata } from 'next'
import { buildMetadata, breadcrumbLd } from '@/lib/seo'
import { JsonLd } from '@/components/ui/JsonLd'
import { ProductsView } from './_ProductsView'

export const metadata: Metadata = buildMetadata({
  title: 'Products — Solar, Battery, EV Charging',
  description: 'Four engineered packages: Starter, Essential, Premium, Commercial. Tier-1 panels, BYD/Tesla/Sungrow batteries, EV chargers, installed by 137+ local service partners across Australia.',
  path: '/products',
})

export default function ProductsPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: 'Products', path: '/products' },
      ])} />
      <ProductsView />
    </>
  )
}
