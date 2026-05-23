import type { Metadata } from 'next'
import { api } from '@/api/client'
import { buildMetadata, breadcrumbLd } from '@/lib/seo'
import { JsonLd } from '@/components/ui/JsonLd'
import { ContactView } from './_ContactView'

export const revalidate = 300

export const metadata: Metadata = buildMetadata({
  title: 'Contact Bluven Energy',
  description: 'Talk to a real engineer — Sydney, Melbourne, Brisbane. Phone, email, or request a free quote online.',
  path: '/contact',
})

export default async function ContactPage() {
  const settings = await api.siteSettings().catch(() => ({} as any))
  return (
    <>
      <JsonLd data={breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: 'Contact', path: '/contact' },
      ])} />
      <ContactView settings={settings as any} />
    </>
  )
}
