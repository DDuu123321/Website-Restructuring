import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ConfiguratorView } from './_ConfiguratorView'
import { CATALOG } from './_catalog'

interface Params { productId: string }

export function generateStaticParams(): Params[] {
  return Object.keys(CATALOG).map(productId => ({ productId }))
}

export const dynamicParams = false

export function generateMetadata({ params }: { params: Params }): Metadata {
  const product = CATALOG[params.productId]
  if (!product) return { title: 'Configure your system' }
  return {
    title: `Configure ${product.name}`,
    description: product.tagline,
  }
}

export default function ConfigurePage({ params }: { params: Params }) {
  const product = CATALOG[params.productId]
  if (!product) notFound()
  return <ConfiguratorView productId={params.productId} />
}
