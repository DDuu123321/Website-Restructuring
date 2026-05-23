import type { Metadata, Viewport } from 'next'
import { Providers } from '@/components/layout/Providers'
import { MarqueeBar } from '@/components/layout/MarqueeBar'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { ChatWidget } from '@/components/layout/ChatWidget'
import { JsonLd } from '@/components/ui/JsonLd'
import { SITE, organizationLd } from '@/lib/seo'

import '@/styles/design-system.css'
import '@/styles/chrome.css'
import '@/styles/home.css'
import '@/styles/inner.css'
import '@/styles/scroll-fx.css'

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" data-lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Montserrat:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <JsonLd data={organizationLd()} />
        <Providers>
          <MarqueeBar />
          <Nav />
          <main>{children}</main>
          <Footer />
          <ChatWidget />
        </Providers>
      </body>
    </html>
  )
}
