import type { MetadataRoute } from 'next'
import { api } from '@/api/client'
import { SITE } from '@/lib/seo'

export const revalidate = 3600  // re-generate sitemap hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE.url + '/',           lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: SITE.url + '/products',   lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: SITE.url + '/projects',   lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: SITE.url + '/news',       lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: SITE.url + '/brands',     lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: SITE.url + '/who-we-are', lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: SITE.url + '/faq',        lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: SITE.url + '/contact',    lastModified: now, changeFrequency: 'yearly',  priority: 0.5 },
    { url: SITE.url + '/quote',      lastModified: now, changeFrequency: 'yearly',  priority: 0.9 },
    { url: SITE.url + '/privacy',    lastModified: now, changeFrequency: 'yearly',  priority: 0.2 },
    { url: SITE.url + '/terms',      lastModified: now, changeFrequency: 'yearly',  priority: 0.2 },
    { url: SITE.url + '/cookies',    lastModified: now, changeFrequency: 'yearly',  priority: 0.2 },
  ]

  // Dynamic CMS pages
  let dynamicRoutes: MetadataRoute.Sitemap = []
  try {
    const [news, projects] = await Promise.all([
      api.news({ limit: 200 }),
      api.projects({ limit: 200 }),
    ])

    dynamicRoutes = [
      ...news.docs.map(a => ({
        url: `${SITE.url}/news/${a.slug}`,
        lastModified: a.updatedAt ? new Date(a.updatedAt) : now,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
      ...projects.docs.map(p => ({
        url: `${SITE.url}/projects/${p.slug}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
    ]
  } catch {
    // CMS unavailable — return static routes only
  }

  return [...staticRoutes, ...dynamicRoutes]
}
