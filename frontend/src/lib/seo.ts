import type { Metadata } from 'next'

export const SITE = {
  name: 'Bluven Energy',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  defaultTitle: "Bluven Energy — Australia's smartest solar, battery & EV charging",
  defaultDescription:
    "Australian-engineered solar, battery and EV charging systems. Designed by senior engineers, installed and serviced by 137+ local service partners across Australia.",
  locale: 'en_AU',
  twitter: '@bluvenenergy',
}

interface BuildMetaArgs {
  title?: string
  description?: string
  path?: string             // e.g. '/news/article-slug'
  image?: string            // absolute URL or path
  type?: 'website' | 'article'
  publishedTime?: string
  noindex?: boolean
}

/** Build a Metadata object for any page. Use in `generateMetadata` exports. */
export function buildMetadata(args: BuildMetaArgs = {}): Metadata {
  const { title, description, path = '/', image, type = 'website', publishedTime, noindex } = args
  const fullTitle = title ? `${title} — ${SITE.name}` : SITE.defaultTitle
  const desc = description || SITE.defaultDescription
  const url = SITE.url + path
  const ogImage = image
    ? (image.startsWith('http') ? image : SITE.url + image)
    : SITE.url + '/og-default.jpg'

  return {
    title: fullTitle,
    description: desc,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: type as any,
      title: fullTitle,
      description: desc,
      url,
      siteName: SITE.name,
      locale: SITE.locale,
      images: [{ url: ogImage, width: 1200, height: 630, alt: fullTitle }],
      ...(type === 'article' && publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: desc,
      images: [ogImage],
      site: SITE.twitter,
    },
  }
}

// ── JSON-LD helpers ──

export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': SITE.url + '#organization',
    name: SITE.name,
    url: SITE.url,
    logo: SITE.url + '/bluven-logo.png',
    description: SITE.defaultDescription,
    telephone: '+611300258836',
    email: 'hello@bluven.com.au',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Unit 14, 39 Herbert St',
      addressLocality: 'St Leonards',
      addressRegion: 'NSW',
      postalCode: '2065',
      addressCountry: 'AU',
    },
    areaServed: [
      { '@type': 'AdministrativeArea', name: 'New South Wales' },
      { '@type': 'AdministrativeArea', name: 'Victoria' },
      { '@type': 'AdministrativeArea', name: 'Queensland' },
    ],
    sameAs: [
      'https://www.facebook.com/bluvenenergy',
      'https://www.linkedin.com/company/bluven-energy',
      'https://www.instagram.com/bluvenenergy',
    ],
  }
}

export function articleLd(args: {
  title: string
  description: string
  slug: string
  publishedAt?: string
  author?: string
  image?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: args.title,
    description: args.description,
    datePublished: args.publishedAt,
    dateModified: args.publishedAt,
    author: { '@type': 'Organization', name: args.author || SITE.name },
    publisher: { '@type': 'Organization', name: SITE.name, logo: { '@type': 'ImageObject', url: SITE.url + '/bluven-logo.png' } },
    image: args.image ? [args.image] : [SITE.url + '/og-default.jpg'],
    url: `${SITE.url}/news/${args.slug}`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE.url}/news/${args.slug}` },
  }
}

export function projectLd(args: {
  title: string
  description: string
  slug: string
  location: string
  image?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: args.title,
    description: args.description,
    image: args.image ? [args.image] : undefined,
    contentLocation: { '@type': 'Place', name: args.location },
    creator: { '@type': 'Organization', name: SITE.name },
    url: `${SITE.url}/projects/${args.slug}`,
  }
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: SITE.url + it.path,
    })),
  }
}

export function faqLd(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(it => ({
      '@type': 'Question',
      name: it.question,
      acceptedAnswer: { '@type': 'Answer', text: it.answer },
    })),
  }
}
