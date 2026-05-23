import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/seo'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: 'Bluven',
    description: SITE.defaultDescription,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0c2236',
    icons: [
      { src: '/bluven-mark.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/bluven-mark.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
