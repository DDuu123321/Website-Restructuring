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

export interface News {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  category: 'industry' | 'policy' | 'knowledge' | 'company' | 'case-study'
  featured: boolean
  coverImage?: Media
  summary: string
  content: any  // Lexical/Slate richtext JSON
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
  status: 'draft' | 'published'
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
  testimonial?: {
    quote?: string
    customerName?: string
    customerSuburb?: string
  }
}

export interface FAQItem {
  id: string
  question: string
  question_zh?: string
  answer: any
  answer_zh?: any
  category: 'general' | 'pricing' | 'installation' | 'products' | 'support' | 'grid'
  sortOrder: number
  published: boolean
}

export interface Testimonial {
  id: string
  customerName: string
  suburb: string
  rating: '5' | '4' | '3' | '2' | '1'
  review: string
  systemInstalled?: string
  status: 'new' | 'reviewed' | 'hidden'
  pinned?: boolean
  sortOrder: number
  createdAt?: string
}

export interface Brand {
  id: string
  name: string
  logo: Media
  category: string[]
  tagline?: string
  websiteUrl?: string
  description?: string
  featured: boolean
  sortOrder: number
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
  bestTime?: string
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
