import Papa from 'papaparse'

/**
 * Detect the current collection slug from the admin URL.
 * Returns null if not on a collection list/edit page.
 * Examples:
 *   /admin/collections/quotes        → "quotes"
 *   /admin/collections/quotes/abc123 → "quotes"
 *   /admin                           → null
 */
export function detectCollectionSlug(): string | null {
  if (typeof window === 'undefined') return null
  const parts = window.location.pathname.split('/').filter(Boolean)
  // ['admin', 'collections', '<slug>', ...]
  if (parts[0] === 'admin' && parts[1] === 'collections' && parts[2]) {
    return parts[2]
  }
  return null
}

/**
 * Flatten a Payload document for CSV serialisation.
 * Nested objects become dot-separated keys ("source.referrer"); arrays
 * of primitives become semicolon-joined strings; arrays of objects are
 * JSON-stringified.
 */
export function flattenDoc(doc: Record<string, unknown>, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(doc)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (v === null || v === undefined) {
      out[key] = ''
    } else if (Array.isArray(v)) {
      if (v.length === 0) {
        out[key] = ''
      } else if (v.every((x) => typeof x === 'string' || typeof x === 'number')) {
        out[key] = v.join('; ')
      } else {
        out[key] = JSON.stringify(v)
      }
    } else if (typeof v === 'object') {
      Object.assign(out, flattenDoc(v as Record<string, unknown>, key))
    } else {
      out[key] = String(v)
    }
  }
  return out
}

export function triggerDownload(filename: string, content: string, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob(['﻿' + content], { type: mime })   // BOM for Excel UTF-8
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export async function fetchAllDocs(slug: string, where?: string): Promise<Record<string, unknown>[]> {
  const params = new URLSearchParams({ limit: '10000', depth: '0' })
  // `where` is a raw query-string suffix, e.g. "where[status][equals]=new"
  const query = where ? `${params.toString()}&${where}` : params.toString()
  const res = await fetch(`/api/${slug}?${query}`, { credentials: 'include' })
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  const body = (await res.json()) as { docs?: Record<string, unknown>[] }
  return body.docs ?? []
}

export function docsToCsv(docs: Record<string, unknown>[]): string {
  if (docs.length === 0) return ''
  const flat = docs.map((d) => flattenDoc(d))
  // Union of all keys (so sparsely-populated columns still appear)
  const headers = Array.from(
    flat.reduce<Set<string>>((set, row) => {
      Object.keys(row).forEach((k) => set.add(k))
      return set
    }, new Set()),
  )
  return Papa.unparse({ fields: headers, data: flat.map((r) => headers.map((h) => r[h] ?? '')) })
}

export async function parseCsvFile(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (result) => resolve(result.data),
      error: (err) => reject(err),
    })
  })
}

/**
 * Reverse flattenDoc: turn a row of dot-keys back into nested objects.
 * Also splits semicolon-joined values back into arrays for known
 * multi-value fields.
 */
export function rowToPayload(row: Record<string, string>, arrayFields: string[] = []): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(row)) {
    if (v === '' || v === undefined || v === null) continue
    const value: unknown = arrayFields.includes(k)
      ? v.split(';').map((s) => s.trim()).filter(Boolean)
      : v
    // Nest dot-paths back into objects: "source.utm_source" → { source: { utm_source: ... } }
    const path = k.split('.')
    let cursor: Record<string, unknown> = out
    for (let i = 0; i < path.length - 1; i++) {
      const segment = path[i]
      if (typeof cursor[segment] !== 'object' || cursor[segment] === null) {
        cursor[segment] = {}
      }
      cursor = cursor[segment] as Record<string, unknown>
    }
    cursor[path[path.length - 1]] = value
  }
  return out
}
