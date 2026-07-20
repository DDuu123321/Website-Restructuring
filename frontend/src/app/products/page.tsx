import type { Metadata } from 'next'
import { buildMetadata, breadcrumbLd } from '@/lib/seo'
import { JsonLd } from '@/components/ui/JsonLd'
import { ProductsView } from './_ProductsView'

export const metadata: Metadata = buildMetadata({
  title: 'Products — Solar, Battery, EV Charging',
  description: 'Solar panels, battery storage, EV charging and commercial energy solutions — Tier-1 components, engineered and installed by 180+ local service partners across Australia.',
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
