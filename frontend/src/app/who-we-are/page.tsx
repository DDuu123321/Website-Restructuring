import type { Metadata } from 'next'
import { buildMetadata, breadcrumbLd } from '@/lib/seo'
import { JsonLd } from '@/components/ui/JsonLd'
import { AboutView } from './_AboutView'

export const revalidate = 60

export const metadata: Metadata = buildMetadata({
  title: 'Who we are — Engineers first',
  description: "Bluven Energy is an Australian-based, engineering-led provider of premium solar and battery energy storage systems, delivered by a CPEng-certified team.",
  path: '/who-we-are',
})

export default function AboutPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: 'Who We Are', path: '/who-we-are' },
      ])} />
      <AboutView />
    </>
  )
}
