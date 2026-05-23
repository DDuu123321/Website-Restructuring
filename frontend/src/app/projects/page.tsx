import type { Metadata } from 'next'
import { api } from '@/api/client'
import { buildMetadata, breadcrumbLd } from '@/lib/seo'
import { JsonLd } from '@/components/ui/JsonLd'
import { ProjectsListView } from './_ProjectsListView'

export const revalidate = 60

export const metadata: Metadata = buildMetadata({
  title: 'Projects we’ve built',
  description: 'Real installation case studies from across NSW, VIC and QLD — solar, battery, EV charging and commercial systems.',
  path: '/projects',
})

export default async function ProjectsPage() {
  const data = await api.projects({ limit: 24 }).catch(() => ({ docs: [] }))
  return (
    <>
      <JsonLd data={breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: 'Projects', path: '/projects' },
      ])} />
      <ProjectsListView projects={data.docs as any} />
    </>
  )
}
