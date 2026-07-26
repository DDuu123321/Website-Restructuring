/**
 * Types matching the Payload CMS collections.
 * Keep in sync with cms/src/collections/*.ts
 */

export interface Media {
  id: string
  alt: string
  caption?: string
  url: string
  filename: string
  mimeType: string
  width?: number
  height?: number
  sizes?: {
    thumbnail?: { url: string; width: number; height: number }
    card?:      { url: string; width: number; height: number }
    hero?:      { url: string; width: number; height: number }
  }
}

/** Page-builder sections — mirrors cms/src/blocks/layoutBlocks.ts. */
export type LayoutBlock =
  | { blockType: 'richText'; id?: string; heading?: string; body: any }
  | { blockType: 'imageText'; id?: string; image: Media; imageSide?: 'left' | 'right'; heading?: string; body: any }
  | { blockType: 'gallery'; id?: string; columns?: '2' | '3'; images: { image: Media; caption?: string }[] }
  | { blockType: 'stats'; id?: string; items: { value: string; label: string }[] }
  | { blockType: 'pullQuote'; id?: string; text: string; name?: string; detail?: string }
  | { blockType: 'callToAction'; id?: string; heading: string; text?: string; buttonLabel?: string; buttonHref?: string }
  | { blockType: 'video'; id?: string; url: string; caption?: string }

export interface News {
  id: string
  title: string
  slug: string
  category: 'industry' | 'policy' | 'knowledge' | 'company' | 'case-study'
  featured: boolean
  coverImage?: Media
  summary: string
  content: any  // Lexical/Slate richtext JSON
  layout?: LayoutBlock[]
  author?: string
  readTime?: number
  publishedAt?: string
  seo?: { metaTitle?: string; metaDescription?: string }
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  title: string
  slug: string
  featured: boolean
  sortOrder: number
  coverImage: Media
  gallery?: { image: Media; caption?: string }[]
  location: string
  systemType: 'solar' | 'solar-battery' | 'solar-ev' | 'full' | 'commercial' | 'battery-retrofit'
  specs?: {
    solarKw?: number
    batteryKwh?: number
    panels?: number
    inverter?: string
    battery?: string
    completionYear?: number
  }
  summary: string
  description?: any
  layout?: LayoutBlock[]
  testimonial?: {
    quote?: string
    customerName?: string
    customerSuburb?: string
  }
}

export interface FAQItem {
  id: string
  question: string
  answer: any
  category: 'general' | 'pricing' | 'installation' | 'products' | 'support' | 'grid'
  sortOrder: number
  published: boolean
}

export interface TeamMember {
  id: string
  name: string
  title: string
  photo?: Media
  bio?: string
  certifications?: { cert: string }[]
  linkedin?: string
  sortOrder: number
}

export interface QuoteRequest {
  id?: string
  firstName: string
  lastName?: string
  email: string
  phone: string
  propertyType?: string
  roofType?: string
  address?: string
  suburb?: string
  state?: string
  postcode?: string
  timeline?: string
  components?: string[]
  systemKw?: number
  batteryKwh?: number
  monthlyBill?: number
  usagePattern?: string
  notes?: string
  /** Honeypot — always empty for real users; bots that fill it are rejected. */
  hp?: string
  source?: {
    referrer?: string
    utm_source?: string
    utm_campaign?: string
    packagePreset?: string
  }
}

export interface AssessmentRequest {
  id?: string
  // Contact
  firstName: string
  lastName?: string
  email: string
  phone: string
  address?: string
  suburb?: string
  state?: string
  postcode: string
  /** Honeypot — always empty for real users; bots that fill it are rejected. */
  hp?: string
  // Quiz raw answers (camelCase to match the CMS group)
  answers: {
    homeSize: string
    occupants: string
    activityTime: string
    majorLoads: string[]
    solarStatus: string
    batteryStatus: string
    mainGoal: string[]
    billLevel: string
  }
  // Computed result snapshot
  result: {
    householdType: string
    recommendationType: string
    fitLevel: string
    summary: string
    nextStep: string
    billReasons: { reason: string }[]
    profile: {
      usage: string
      daytime: string
      night: string
      load: string
      backup: string
    }
    scores: Record<string, number>
  }
  source?: {
    referrer?: string
    utm_source?: string
    utm_campaign?: string
  }
}

export interface SiteSettings {
  phone?: string
  phoneHref?: string
  email?: string
  quoteEmail?: string
  address?: {
    street?: string
    suburb?: string
    state?: string
    postcode?: string
    country?: string
  }
  social?: {
    facebook?: string
    instagram?: string
    linkedin?: string
    youtube?: string
  }
  seo?: {
    siteName?: string
    defaultDescription?: string
    ogImage?: Media
    googleAnalyticsId?: string
  }
  announcement?: {
    enabled?: boolean
    text?: string
    linkText?: string
    linkUrl?: string
  }
  chat?: {
    enabled?: boolean
    greeting?: string
  }
}

export interface PaginatedResponse<T> {
  docs: T[]
  totalDocs: number
  totalPages: number
  page: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
  nextPage: number | null
  prevPage: number | null
}
