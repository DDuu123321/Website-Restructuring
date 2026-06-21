import type { Metadata, Viewport } from 'next'
import { Montserrat, JetBrains_Mono } from 'next/font/google'
import { Providers } from '@/components/layout/Providers'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { ChatWidget } from '@/components/layout/ChatWidget'
import { JsonLd } from '@/components/ui/JsonLd'
import { SITE, organizationLd } from '@/lib/seo'
import { api } from '@/api/client'

import '@/styles/design-system.css'
import '@/styles/chrome.css'
import '@/styles/home.css'
import '@/styles/inner.css'

// Self-hosted at build time (no render-blocking Google Fonts request).
// Cormorant Garamond was dropped — it was loaded but never referenced in any CSS.
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-montserrat',
  display: 'swap',
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.defaultTitle, template: `%s — ${SITE.name}` },
  description: SITE.defaultDescription,
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE.url }],
  keywords: [
    'solar', 'solar panels', 'battery storage', 'EV charging', 'Australia',
    'solar installer Sydney', 'solar Melbourne', 'solar Brisbane',
    'Tesla Powerwall', 'BYD battery', 'federal battery rebate',
    'Bluven Energy',
  ],
  creator: SITE.name,
  publisher: SITE.name,
  formatDetection: { telephone: true, email: true, address: true },
  alternates: { canonical: SITE.url },
  openGraph: {
    type: 'website',
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: SITE.defaultTitle,
    description: SITE.defaultDescription,
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: 'summary_large_image',
    site: SITE.twitter,
    creator: SITE.twitter,
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  // Favicon + apple-touch-icon are auto-served by Next.js file convention
  // from app/icon.png and app/apple-icon.jpg (real Bluven logo).
  manifest: '/manifest.webmanifest',
}

export const viewport: Viewport = {
  themeColor: '#0a1828',
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await api.siteSettings().catch(() => null)
  const chat = settings?.chat
  const chatEnabled = chat?.enabled !== false   // default on; respects the admin toggle
  return (
    <html lang="en-AU" data-lang="en" className={`${montserrat.variable} ${jetbrainsMono.variable}`}>
      <body>
        <JsonLd data={organizationLd()} />
        <Providers>
          <Nav />
          <main>{children}</main>
          <Footer />
          {chatEnabled && <ChatWidget greeting={chat?.greeting || undefined} />}
        </Providers>
      </body>
    </html>
  )
}
