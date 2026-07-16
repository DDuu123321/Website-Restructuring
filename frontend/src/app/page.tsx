import { api } from '@/api/client'
import { HomeView } from './_components/HomeView'

export const revalidate = 60   // ISR every 60s

export default async function HomePage() {
  // Server-side fetch for SEO — pages render with real data
  // News section was removed from homepage per meeting feedback (still available at /news)
  // Recent installations: pull real project photos (mostly portrait phone shots) for the 3D album.
  const projectsRes = await api.projects({ limit: 12 }).catch(() => ({ docs: [] }))

  return (
    <HomeView
      featuredProjects={projectsRes.docs}
    />
  )
}
