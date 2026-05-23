/* ============================================================
   Bluven API client
   Fetches data from the Payload CMS REST API.

   Usage:
     const articles = await bvApi.news({ limit: 6, featured: true })
     const projects = await bvApi.projects({ limit: 9 })
     const faqs     = await bvApi.faq({ category: 'pricing' })
     await bvApi.submitQuote(formData)
     await bvApi.submitTestimonial({ customerName, review, ... })
   ============================================================ */

(function () {
  // In development the server is on :3001.
  // In production the frontend is served from the same origin.
  const BASE =
    window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
      ? 'http://localhost:3001'
      : window.location.origin

  const API = BASE + '/api'

  // ── Generic fetch helper ────────────────────────────────
  async function apiFetch(path, opts = {}) {
    const res = await fetch(API + path, {
      headers: { 'Content-Type': 'application/json' },
      ...opts,
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body?.errors?.[0]?.message || `API error ${res.status}`)
    }
    return res.json()
  }

  function qs(params = {}) {
    const parts = []
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null || v === '') continue
      if (k === 'where' && typeof v === 'object') {
        // Payload where-query: serialize each key
        for (const [wk, wv] of Object.entries(v)) {
          for (const [op, val] of Object.entries(wv)) {
            parts.push(`where[${wk}][${op}]=${encodeURIComponent(val)}`)
          }
        }
      } else {
        parts.push(`${k}=${encodeURIComponent(v)}`)
      }
    }
    return parts.length ? '?' + parts.join('&') : ''
  }

  // ── Public API ──────────────────────────────────────────
  window.bvApi = {

    // ── News ──────────────────────────────────────────────
    news({ limit = 9, category, featured, page = 1 } = {}) {
      const where = {}
      if (category) where.category = { equals: category }
      if (featured === true) where.featured = { equals: true }
      return apiFetch('/news' + qs({ limit, page, sort: '-publishedAt', depth: 1, where: Object.keys(where).length ? where : undefined }))
    },

    newsItem(slug) {
      return apiFetch('/news' + qs({ where: { slug: { equals: slug } }, depth: 2, limit: 1 }))
        .then(r => r.docs?.[0] || null)
    },

    // ── Projects ─────────────────────────────────────────
    projects({ limit = 9, systemType, featured, page = 1 } = {}) {
      const where = {}
      if (systemType) where.systemType = { equals: systemType }
      if (featured === true) where.featured = { equals: true }
      return apiFetch('/projects' + qs({ limit, page, sort: 'sortOrder', depth: 1, where: Object.keys(where).length ? where : undefined }))
    },

    projectItem(slug) {
      return apiFetch('/projects' + qs({ where: { slug: { equals: slug } }, depth: 2, limit: 1 }))
        .then(r => r.docs?.[0] || null)
    },

    // ── FAQ ──────────────────────────────────────────────
    faq({ category, lang = 'en' } = {}) {
      const where = { published: { equals: true } }
      if (category) where.category = { equals: category }
      return apiFetch('/faq' + qs({ limit: 100, sort: 'sortOrder', depth: 0, locale: lang, where }))
    },

    // ── Testimonials ──────────────────────────────────────
    testimonials({ limit = 8, featured } = {}) {
      const where = { status: { equals: 'approved' } }
      if (featured === true) where.featured = { equals: true }
      return apiFetch('/testimonials' + qs({ limit, sort: 'sortOrder', depth: 0, where }))
    },

    // ── Brands ───────────────────────────────────────────
    brands({ category } = {}) {
      const where = {}
      if (category) where['category'] = { in: category }
      return apiFetch('/brands' + qs({ limit: 50, sort: 'sortOrder', depth: 1, where: Object.keys(where).length ? where : undefined }))
    },

    // ── Team ─────────────────────────────────────────────
    team() {
      return apiFetch('/team' + qs({ limit: 20, sort: 'sortOrder', depth: 1 }))
    },

    // ── Site settings (global) ───────────────────────────
    siteSettings() {
      return apiFetch('/globals/site-settings?depth=1')
    },

    // ── Quote form submission ─────────────────────────────
    submitQuote(data) {
      return apiFetch('/quotes', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    // ── Testimonial submission ────────────────────────────
    submitTestimonial(data) {
      return apiFetch('/testimonials', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    // ── AI Chat ──────────────────────────────────────────
    chat(messages) {
      return apiFetch('/chat', {
        method: 'POST',
        body: JSON.stringify({ messages }),
      })
    },

    // ── Utility ──────────────────────────────────────────
    imgUrl(mediaDoc, size = 'card') {
      if (!mediaDoc) return ''
      // Payload generates sized variants
      const sized = mediaDoc?.sizes?.[size]
      const url = sized?.url || mediaDoc?.url || ''
      if (!url) return ''
      return url.startsWith('http') ? url : BASE + url
    },
  }
})()
