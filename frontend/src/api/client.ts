/**
 * Bluven CMS API client — works in both Server Components and Client Components.
 *
 * Server-side: hits CMS_URL directly (http://localhost:3001 or production CMS).
 * Client-side: hits /api/* (proxied to CMS in dev, NEXT_PUBLIC_CMS_URL in prod).
 */

import type {
  News, Project, FAQItem, Brand, TeamMember, Testimonial, SiteSettings, QuoteRequest, AssessmentRequest,
  PaginatedResponse, Media,
} from '@/types/cms'

function getApiBase(): string {
  // Server-side: hit CMS directly
  if (typeof window === 'undefined') {
    return (process.env.CMS_URL || 'http://localhost:3001') + '/api'
  }
  // Client-side in dev: rewrites send /api to CMS
  // Client-side in prod: NEXT_PUBLIC_CMS_URL or same-origin /api
  const cms = process.env.NEXT_PUBLIC_CMS_URL
  return cms ? `${cms}/api` : '/api'
}

class ApiError extends Error {
  constructor(message: string, public status: number, public body?: unknown) {
    super(message)
  }
}

async function request<T>(
  path: string,
  opts: RequestInit & { revalidate?: number | false } = {}
): Promise<T> {
  const { revalidate, ...rest } = opts
  const init: RequestInit & { next?: { revalidate?: number | false } } = {
    headers: { 'Content-Type': 'application/json' },
    ...rest,
  }
  // Next.js: opt into ISR / static rendering for GET requests
  if (typeof window === 'undefined' && (init.method === undefined || init.method === 'GET')) {
    init.next = { revalidate: revalidate ?? 60 }   // default 60s revalidation
  }

  const res = await fetch(getApiBase() + path, init)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const msg = (body as any)?.errors?.[0]?.message || `API error ${res.status}`
    throw new ApiError(msg, res.status, body)
  }
  return res.json() as Promise<T>
}

// ── Query string helper for Payload's where[field][op]=value syntax ──
type WhereClause = Record<string, Record<string, string | number | boolean>>

function buildQuery(params: Record<string, any>): string {
  const parts: string[] = []
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue
    if (k === 'where' && typeof v === 'object') {
      for (const [field, ops] of Object.entries(v as WhereClause)) {
        for (const [op, val] of Object.entries(ops)) {
          parts.push(`where[${field}][${op}]=${encodeURIComponent(String(val))}`)
        }
      }
    } else {
      parts.push(`${k}=${encodeURIComponent(String(v))}`)
    }
  }
  return parts.length ? '?' + parts.join('&') : ''
}

// ── Public API ──
export const api = {
  // News — draft state removed 2026-05-26 (everything publicly visible on save)
  news(args: { limit?: number; page?: number; category?: string; featured?: boolean } = {}) {
    const where: WhereClause = {}
    if (args.category) where.category = { equals: args.category }
    if (args.featured === true) where.featured = { equals: true }
    return request<PaginatedResponse<News>>(
      '/news' + buildQuery({
        limit: args.limit ?? 9,
        page: args.page ?? 1,
        sort: '-publishedAt',
        depth: 1,
        where,
      })
    )
  },
  newsBySlug(slug: string) {
    return request<PaginatedResponse<News>>(
      '/news' + buildQuery({ where: { slug: { equals: slug } }, depth: 2, limit: 1 })
    ).then(r => r.docs[0] ?? null)
  },

  // Projects — draft state removed 2026-05-26 (everything publicly visible on save)
  projects(args: { limit?: number; systemType?: string; featured?: boolean } = {}) {
    const where: WhereClause = {}
    if (args.systemType) where.systemType = { equals: args.systemType }
    if (args.featured === true) where.featured = { equals: true }
    return request<PaginatedResponse<Project>>(
      '/projects' + buildQuery({ limit: args.limit ?? 9, sort: 'sortOrder', depth: 1, where })
    )
  },
  projectBySlug(slug: string) {
    return request<PaginatedResponse<Project>>(
      '/projects' + buildQuery({ where: { slug: { equals: slug } }, depth: 2, limit: 1 })
    ).then(r => r.docs[0] ?? null)
  },

  // FAQ
  faq(args: { category?: string; locale?: string } = {}) {
    const where: WhereClause = { published: { equals: true } }
    if (args.category) where.category = { equals: args.category }
    return request<PaginatedResponse<FAQItem>>(
      '/faq' + buildQuery({ limit: 100, sort: 'sortOrder', depth: 0, locale: args.locale, where })
    )
  },

  // Testimonials — pinned first, then by sortOrder, then newest first
  // Excludes hidden reviews. Pass { pinned: true } to filter to homepage-pinned only.
  testimonials(args: { limit?: number; page?: number; pinned?: boolean } = {}) {
    const where: WhereClause = { status: { not_equals: 'hidden' } }
    if (args.pinned === true) where.pinned = { equals: true }
    return request<PaginatedResponse<Testimonial>>(
      '/testimonials' + buildQuery({
        limit: args.limit ?? 8,
        page: args.page ?? 1,
        sort: '-pinned,sortOrder,-createdAt',
        depth: 0,
        where,
      }),
      { revalidate: 30 }
    )
  },
  submitTestimonial(data: Partial<Testimonial>) {
    return request<{ doc: Testimonial }>('/testimonials', {
      method: 'POST', body: JSON.stringify(data),
    })
  },

  // Brands
  brands() {
    return request<PaginatedResponse<Brand>>(
      '/brands' + buildQuery({ limit: 50, sort: 'sortOrder', depth: 1 })
    )
  },

  // Team
  team() {
    return request<PaginatedResponse<TeamMember>>(
      '/team' + buildQuery({ limit: 20, sort: 'sortOrder', depth: 1 })
    )
  },

  // Site settings
  siteSettings() {
    return request<SiteSettings>('/globals/site-settings?depth=1')
  },

  // Quote submission
  submitQuote(data: Partial<QuoteRequest>) {
    return request<{ doc: QuoteRequest }>('/quotes', {
      method: 'POST', body: JSON.stringify(data),
    })
  },

  // Assessment submission (Free Assessment quiz)
  submitAssessment(data: AssessmentRequest) {
    return request<{ doc: AssessmentRequest }>('/assessments', {
      method: 'POST', body: JSON.stringify(data),
    })
  },

  // AI Chat
  chat(messages: { role: 'user' | 'assistant'; content: string }[]) {
    return request<{ reply: string }>('/chat', {
      method: 'POST', body: JSON.stringify({ messages }),
    })
  },

  // Image URL helper
  imgUrl(media: Media | string | null | undefined, size: 'thumbnail' | 'card' | 'hero' | 'original' = 'card'): string {
    if (!media) return ''
    if (typeof media === 'string') return media
    let url = ''
    if (size !== 'original' && media.sizes?.[size]?.url) url = media.sizes[size]!.url
    else url = media.url || ''
    if (!url) return ''
    if (url.startsWith('http')) return url
    // Make absolute when running in Server Components
    if (typeof window === 'undefined') {
      return (process.env.CMS_URL || 'http://localhost:3001') + url
    }
    return url
  },
}

export { ApiError }
