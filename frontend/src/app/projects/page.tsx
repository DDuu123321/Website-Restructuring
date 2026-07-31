import type { Metadata } from 'next'
import { api } from '@/api/client'
import { buildMetadata, breadcrumbLd } from '@/lib/seo'
import { JsonLd } from '@/components/ui/JsonLd'
import { ProjectsListView } from './_ProjectsListView'

export const revalidate = 60

export const metadata: Metadata = buildMetadata({
  title: 'Projects we’ve built',
  description: 'Real installation case studies from across WA, VIC, QLD and SA — solar and battery storage systems, every one engineered.',
  path: '/projects',
})

export default async function ProjectsPage() {
  // Fetch the whole catalogue: the list is sorted by sortOrder, so a small
  // limit silently hid every project past the cut — including the NSW and VIC
  // installs, which then never even produced a state filter button. The client
  // still renders 9 at a time behind "Load more", so this costs page weight,
  // not render time.
  const data = await api.projects({ limit: 100 }).catch(() => null)
  const projects = data?.docs ?? []
  return (
    <>
      <JsonLd data={breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: 'Projects', path: '/projects' },
      ])} />
      <ProjectsListView projects={projects} totalDocs={data?.totalDocs ?? projects.length} />
    </>
  )
}
