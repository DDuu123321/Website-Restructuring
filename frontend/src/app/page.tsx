import { api } from '@/api/client'
import { HomeView } from './_components/HomeView'

export const revalidate = 60   // ISR every 60s

export default async function HomePage() {
  // Server-side fetch for SEO — pages render with real data
  // News section was removed from homepage per meeting feedback (still available at /news)
  const [projectsRes, testimonialsRes] = await Promise.all([
    api.projects({ featured: true, limit: 3 }).catch(() => ({ docs: [] })),
    api.testimonials({ featured: true, limit: 3 }).catch(() => ({ docs: [] })),
  ])

  return (
    <HomeView
      featuredProjects={projectsRes.docs}
      featuredTestimonials={testimonialsRes.docs}
    />
  )
}
