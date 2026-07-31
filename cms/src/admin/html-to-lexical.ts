/**
 * Turn an AI-written HTML article into the pieces the News form needs.
 *
 * Runs in the admin bundle (browser), so it parses with the built-in DOMParser
 * — no jsdom, nothing Node-only, which would break the webpack SPA build. All
 * DOM access is inside functions: this module is also imported on the server
 * when the collection config loads.
 *
 * The output node shapes match what BOTH sides accept: the Lexical editor in
 * the admin and the public renderer at frontend/src/components/ui/RichText.tsx.
 * That renderer understands paragraph, heading, list, listitem, quote, link,
 * linebreak and text only — anything else it degrades to a bare <span>, so we
 * never emit anything else and report what we dropped instead.
 */

// ── Lexical node builders (same shapes as scripts/seed-faq.ts) ──
const FMT = { bold: 1, italic: 2, strikethrough: 4, underline: 8, code: 16 } as const

type Node = Record<string, unknown>

const textNode = (text: string, format = 0): Node => ({
  type: 'text', text, format, style: '', mode: 'normal', detail: 0, version: 1,
})
const block = (type: string, children: Node[], extra: Node = {}): Node => ({
  type, children, direction: 'ltr', format: '', indent: 0, version: 1, ...extra,
})
export const emptyEditorState = (): Node => ({
  root: block('root', [block('paragraph', [])]),
})

export interface ParsedArticle {
  title: string
  summary: string
  category?: string
  author?: string
  /** SEO overrides for the News `seo` group; the site falls back to title & summary when absent. */
  metaTitle?: string
  metaDescription?: string
  content: Node
  /** Non-fatal things the editor should know about, e.g. dropped images. */
  warnings: string[]
}

/** The five values the News.category select accepts. */
export const CATEGORIES = ['industry', 'policy', 'knowledge', 'company', 'case-study'] as const

/** Site chrome an AI may wrap the article in. The page already supplies its own
 *  header, nav and footer, so importing them would duplicate them inside the
 *  article body. Dropped silently — they are never article content. */
const CHROME = new Set(['SCRIPT', 'STYLE', 'NAV', 'HEADER', 'FOOTER', 'ASIDE', 'NOSCRIPT', 'IFRAME', 'FORM', 'BUTTON', 'SVG'])

/** Inline elements that map onto a text-format bit. */
const INLINE_FORMAT: Record<string, number> = {
  STRONG: FMT.bold, B: FMT.bold,
  EM: FMT.italic, I: FMT.italic,
  S: FMT.strikethrough, DEL: FMT.strikethrough, STRIKE: FMT.strikethrough,
  U: FMT.underline,
  CODE: FMT.code, KBD: FMT.code, SAMP: FMT.code,
}

/** Collapse runs of whitespace the way HTML rendering does. */
const squash = (s: string) => s.replace(/\s+/g, ' ')

/** Build the inline children of one block element. */
function inlineChildren(el: Element, format: number, warnings: string[]): Node[] {
  const out: Node[] = []
  el.childNodes.forEach((node) => {
    if (node.nodeType === 3) {
      const t = squash(node.textContent || '')
      if (t) out.push(textNode(t, format))
      return
    }
    if (node.nodeType !== 1) return
    const child = node as Element
    const tag = child.tagName.toUpperCase()

    if (CHROME.has(tag)) return
    if (tag === 'BR') { out.push({ type: 'linebreak', version: 1 }); return }
    if (tag === 'IMG') {
      const src = child.getAttribute('src') || '(no src)'
      warnings.push(`Dropped an inline image (${src.slice(0, 60)}) — add pictures with the image button in the editor below, or a Page Builder block.`)
      return
    }
    if (tag === 'A') {
      const url = (child.getAttribute('href') || '').trim()
      const kids = inlineChildren(child, format, warnings)
      if (!kids.length) return
      if (!url) { out.push(...kids); return }
      out.push(block('link', kids, {
        fields: { linkType: 'custom', url, newTab: /^https?:\/\//i.test(url) },
      }))
      return
    }
    const bit = INLINE_FORMAT[tag]
    out.push(...inlineChildren(child, bit ? format | bit : format, warnings))
  })
  return out
}

/** Convert one block-level element into zero or more Lexical blocks. */
function blockNodes(el: Element, warnings: string[]): Node[] {
  const tag = el.tagName.toUpperCase()
  if (CHROME.has(tag)) return []

  if (/^H[1-6]$/.test(tag)) {
    const kids = inlineChildren(el, 0, warnings)
    if (!kids.length) return []
    // H1 belongs to the page title, so demote it — an article body that starts
    // a second H1 competes with the headline the template already produced.
    const level = Math.min(6, Math.max(2, Number(tag[1])))
    return [block('heading', kids, { tag: `h${level}` })]
  }

  if (tag === 'P') {
    const kids = inlineChildren(el, 0, warnings)
    return kids.length ? [block('paragraph', kids)] : []
  }

  if (tag === 'BLOCKQUOTE') {
    const kids = childBlocks(el, warnings)
    // The renderer puts text straight inside <blockquote>, so flatten one level
    // of paragraphs rather than nesting them.
    const flat = kids.flatMap((n) =>
      (n as { type?: string }).type === 'paragraph' ? ((n as { children?: Node[] }).children || []) : [n],
    )
    return flat.length ? [block('quote', flat)] : []
  }

  if (tag === 'UL' || tag === 'OL') {
    const items: Node[] = []
    Array.from(el.children).forEach((li, i) => {
      if (li.tagName.toUpperCase() !== 'LI') return
      const kids = inlineChildren(li, 0, warnings)
      if (kids.length) items.push(block('listitem', kids, { value: i + 1 }))
    })
    if (!items.length) return []
    return [block('list', items, {
      tag: tag.toLowerCase(),
      listType: tag === 'OL' ? 'number' : 'bullet',
      start: 1,
    })]
  }

  if (tag === 'HR') return []

  if (tag === 'TABLE') {
    warnings.push('Dropped a table — the article renderer has no table support.')
    return []
  }

  if (tag === 'IMG') {
    const src = el.getAttribute('src') || '(no src)'
    warnings.push(`Dropped an image (${src.slice(0, 60)}) — add pictures with the image button in the editor below, or a Page Builder block.`)
    return []
  }

  // DIV / SECTION / ARTICLE / MAIN and friends: recurse.
  const nested = childBlocks(el, warnings)
  if (nested.length) return nested

  // A wrapper with only loose text in it still carries content.
  const kids = inlineChildren(el, 0, warnings)
  return kids.length ? [block('paragraph', kids)] : []
}

function childBlocks(parent: Element, warnings: string[]): Node[] {
  const out: Node[] = []
  let loose: Node[] = []
  parent.childNodes.forEach((node) => {
    if (node.nodeType === 3) {
      const t = squash(node.textContent || '')
      if (t.trim()) loose.push(textNode(t))
      return
    }
    if (node.nodeType !== 1) return
    const el = node as Element
    const tag = el.tagName.toUpperCase()
    // Inline element sitting directly in a container — gather into a paragraph.
    if (INLINE_FORMAT[tag] || tag === 'A' || tag === 'SPAN' || tag === 'BR') {
      loose.push(...inlineChildren(el, 0, warnings))
      return
    }
    if (loose.length) { out.push(block('paragraph', loose)); loose = [] }
    out.push(...blockNodes(el, warnings))
  })
  if (loose.length) out.push(block('paragraph', loose))
  return out
}

/** First non-empty text of the first matching selector. */
function pick(root: ParentNode, selectors: string[]): string {
  for (const sel of selectors) {
    const el = root.querySelector(sel)
    const t = squash(el?.textContent || '').trim()
    if (t) return t
  }
  return ''
}

/**
 * Parse an AI-written article. Accepts a full HTML document, a bare fragment,
 * or plain text; metadata may come from data-attributes, <meta> tags or simply
 * the first <h1> and first paragraph.
 */
export function parseArticleHtml(input: string): ParsedArticle {
  const warnings: string[] = []
  const raw = (input || '').trim()
  if (!raw) return { title: '', summary: '', content: emptyEditorState(), warnings: ['Nothing to import.'] }

  // Plain text (no tags at all): treat blank-line-separated blocks as paragraphs.
  if (!/<[a-z!/][\s\S]*>/i.test(raw)) {
    const paras = raw.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean)
    const [first, ...rest] = paras
    return {
      title: first ? first.slice(0, 200) : '',
      summary: rest[0] ? rest[0].slice(0, 400) : '',
      content: { root: block('root', (rest.length ? rest : paras).map((p) => block('paragraph', [textNode(p)]))) },
      warnings: ['Imported as plain text — headings, links and lists could not be detected.'],
    }
  }

  const doc = new DOMParser().parseFromString(raw, 'text/html')
  const scope: ParentNode =
    doc.querySelector('article') || doc.querySelector('main') || doc.body

  // ── Metadata ──
  const attrOf = (name: string): string => {
    const holder = doc.querySelector(`[data-${name}]`)
    // squash: attribute values written across several source lines keep their
    // newlines, and they must not reach a single-line form field.
    const fromAttr = squash(holder?.getAttribute(`data-${name}`) || '').trim()
    if (fromAttr) return fromAttr
    const meta = doc.querySelector(`meta[name="${name}"]`)
    return squash(meta?.getAttribute('content') || '').trim()
  }

  const title =
    attrOf('title') ||
    pick(scope, ['h1']) ||
    squash(doc.querySelector('title')?.textContent || '').trim()

  const summary =
    attrOf('summary') ||
    pick(scope, ['[data-summary]', '.summary', 'p.lede', '.lede']) ||
    squash(doc.querySelector('meta[name="description"]')?.getAttribute('content') || '').trim()

  const rawCategory = attrOf('category').toLowerCase().replace(/[\s_]+/g, '-')
  const category = (CATEGORIES as readonly string[]).includes(rawCategory) ? rawCategory : undefined
  if (rawCategory && !category) {
    warnings.push(`Unknown category "${rawCategory}" — pick one in the sidebar.`)
  }
  const author = attrOf('author') || undefined
  const metaTitle = attrOf('meta-title') || undefined
  const metaDescription = attrOf('meta-description') || undefined

  // ── Body: drop whatever was already consumed as the title or summary ──
  const working = scope.cloneNode(true) as Element
  const h1 = working.querySelector('h1')
  if (h1 && squash(h1.textContent || '').trim() === title) h1.remove()
  working.querySelectorAll('[data-summary], .summary').forEach((el) => el.remove())
  if (summary) {
    // A summary lifted from the first paragraph must not repeat in the body.
    const firstP = working.querySelector('p')
    if (firstP && squash(firstP.textContent || '').trim() === summary) firstP.remove()
  }

  const children = childBlocks(working, warnings)
  if (!children.length) warnings.push('No article body was found in that HTML.')

  return {
    title,
    summary,
    category,
    author,
    metaTitle,
    metaDescription,
    content: { root: block('root', children.length ? children : [block('paragraph', [])]) },
    warnings: Array.from(new Set(warnings)),
  }
}

/** Slug the same way the collection hook would, but tolerant of titles that
 *  strip to nothing (a Chinese headline would otherwise produce an empty slug
 *  and fail the required check with a confusing message). */
export function slugify(title: string): string {
  const s = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim()
  if (s) return s.slice(0, 80)
  const d = new Date()
  return `article-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Rough reading time in whole minutes, at 200 words per minute. */
export function readingMinutes(content: Node): number {
  let words = 0
  const walk = (n: unknown): void => {
    if (!n || typeof n !== 'object') return
    const node = n as { type?: string; text?: string; children?: unknown[]; root?: unknown }
    if (node.root) return walk(node.root)
    if (node.type === 'text' && typeof node.text === 'string') {
      words += node.text.split(/\s+/).filter(Boolean).length
    }
    if (Array.isArray(node.children)) node.children.forEach(walk)
  }
  walk(content)
  return Math.max(1, Math.round(words / 200))
}
