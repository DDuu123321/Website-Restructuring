/**
 * ArticleImportPanel — paste an AI-written HTML article and have it fill the
 * News form, instead of typing title / slug / summary / body by hand.
 *
 * Rendered as a `ui` field at the top of the News edit view. A `ui` field's
 * component receives only the raw field config (no `path`, no form helpers —
 * see RenderFields' presentational branch), so the target field names are
 * hard-coded here; that is fine, this panel exists for exactly one collection.
 *
 * Filling other fields goes through the form reducer:
 *   dispatchFields({ type: 'UPDATE', path: 'title', value })
 * with one wrinkle for `content`. The Lexical field remounts on
 * `key={JSON.stringify({ initialValue, path })}`, keyed on initialValue and NOT
 * on value — dispatching value alone updates what gets SAVED while the editor
 * keeps showing the old article. So the richText dispatch carries both;
 * `initialValue` never reaches the server (the form submits field.value only),
 * so this is display-only.
 *
 * Nothing is written until the editor presses Save — except the cover image,
 * which has to become a Media document before it can be referenced.
 */
import React, { useRef, useState } from 'react'
import { useForm } from 'payload/components/forms'
import {
  parseArticleHtml, slugify, readingMinutes, CATEGORIES, type ParsedArticle,
} from './html-to-lexical'

const CATEGORY_LABELS: Record<string, string> = {
  industry: 'Industry News',
  policy: 'Policy & Rebates',
  knowledge: 'Solar Knowledge',
  company: 'Company Updates',
  'case-study': 'Case Studies',
}

/** The skeleton the editor hands to an AI. Deliberately content-only: the
 *  website already draws its own header, nav and footer around every article,
 *  so a template that included them would duplicate the site chrome inside the
 *  article body. */
const AI_TEMPLATE = `Write a news article for Bluven Energy (Australian solar, battery and
EV-charging installer) and return ONLY HTML in exactly this shape — no markdown
fence, no <html>/<head>/<body>, no site header or footer:

<article
  data-category="industry"
  data-author="Bluven Energy Team">
  <h1>The headline goes here</h1>
  <p data-summary>One or two sentences that work as the article's teaser on the
  news listing page.</p>

  <h2>A section heading</h2>
  <p>Body paragraph. You may use <strong>bold</strong>, <em>italic</em> and
  <a href="https://www.bluven.com.au/quote">links</a>.</p>

  <ul>
    <li>Bullet point</li>
    <li>Another bullet point</li>
  </ul>

  <h2>Another section</h2>
  <p>More body copy.</p>

  <blockquote>A pull quote, if one fits.</blockquote>
</article>

RULES
- data-category must be one of: industry | policy | knowledge | company | case-study
- Allowed tags only: h1 h2 h3 p ul ol li strong em a blockquote br
- No images, tables, inline styles, classes or scripts — images are added
  separately in the CMS.
- Australian English. Never invent prices, savings figures, customer numbers,
  ratings or rebate dollar amounts.`

type Status = { kind: 'idle' | 'busy' | 'ok' | 'warn' | 'error'; message?: string; details?: string[] }

const ArticleImportPanel: React.FC = () => {
  const { dispatchFields, setModified } = useForm()
  const [html, setHtml] = useState('')
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [coverName, setCoverName] = useState('')
  const htmlFileRef = useRef<HTMLInputElement>(null)
  const coverRef = useRef<HTMLInputElement>(null)

  const set = (path: string, value: unknown, extra: Record<string, unknown> = {}) =>
    dispatchFields({ type: 'UPDATE', path, value, ...extra } as never)

  const onPickHtmlFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setHtml(await file.text())
    setStatus({ kind: 'idle' })
  }

  const copyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(AI_TEMPLATE)
      setStatus({ kind: 'ok', message: 'Template copied — paste it into ChatGPT or Claude.' })
    } catch {
      setOpen(true)
      setStatus({ kind: 'warn', message: 'Could not reach the clipboard — the template is shown below, copy it manually.' })
    }
  }

  /** Upload the chosen cover photo and return its Media id. */
  const uploadCover = async (file: File, alt: string): Promise<string | number> => {
    const form = new FormData()
    form.append('file', file)
    form.append('_payload', JSON.stringify({ alt: alt || file.name }))
    const res = await fetch('/api/media', { method: 'POST', credentials: 'include', body: form })
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { errors?: { message?: string }[]; message?: string }
      throw new Error(body.errors?.[0]?.message || body.message || `Cover upload failed (HTTP ${res.status})`)
    }
    const body = (await res.json()) as { doc: { id: string | number } }
    return body.doc.id
  }

  const apply = async () => {
    if (status.kind === 'busy') return
    setStatus({ kind: 'busy', message: 'Reading the article…' })

    let parsed: ParsedArticle
    try {
      parsed = parseArticleHtml(html)
    } catch (e) {
      setStatus({ kind: 'error', message: e instanceof Error ? e.message : 'Could not read that HTML.' })
      return
    }

    if (!parsed.title && !html.trim()) {
      setStatus({ kind: 'error', message: 'Paste the article first.' })
      return
    }

    const notes = [...parsed.warnings]

    // Cover image, if one was chosen — the only step that writes before Save.
    const coverFile = coverRef.current?.files?.[0]
    if (coverFile) {
      try {
        setStatus({ kind: 'busy', message: `Uploading ${coverFile.name}…` })
        const id = await uploadCover(coverFile, parsed.title)
        set('coverImage', id)
      } catch (e) {
        setStatus({ kind: 'error', message: e instanceof Error ? e.message : 'Cover upload failed.' })
        return
      }
    }

    if (parsed.title) {
      set('title', parsed.title)
      set('slug', slugify(parsed.title))
    } else {
      notes.push('No <h1> found — the title is still empty.')
    }
    if (parsed.summary) set('summary', parsed.summary)
    else notes.push('No summary found — write one before saving, it is required.')

    if (parsed.category) set('category', parsed.category)
    if (parsed.author) set('author', parsed.author)

    // Both value and initialValue: the second is what makes the Lexical editor
    // actually re-render with the imported body (see the note at the top).
    set('content', parsed.content, { initialValue: parsed.content })
    set('readTime', readingMinutes(parsed.content))

    setModified(true)

    const filled = [
      parsed.title && 'title',
      parsed.title && 'slug',
      parsed.summary && 'summary',
      parsed.category && `category (${CATEGORY_LABELS[parsed.category]})`,
      parsed.author && 'author',
      'body',
      'read time',
      coverFile && 'cover image',
    ].filter(Boolean) as string[]

    setStatus({
      kind: notes.length ? 'warn' : 'ok',
      message: `Filled ${filled.join(', ')}. Check it over, then press Save.`,
      details: notes,
    })
  }

  const tone = {
    ok:    { bg: '#f0fdf4', border: '#bbf7d0', fg: '#166534' },
    warn:  { bg: '#fffbeb', border: '#fde68a', fg: '#92400e' },
    error: { bg: '#fef2f2', border: '#fecaca', fg: '#b91c1c' },
  }[status.kind === 'busy' || status.kind === 'idle' ? 'ok' : status.kind]

  return (
    <div style={wrap}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#042744' }}>📄 Import an AI-written article</span>
        <button type="button" onClick={copyTemplate} style={ghost}>1 · Copy the AI template</button>
        <button type="button" onClick={() => setOpen((o) => !o)} style={link}>
          {open ? 'Hide template' : 'Show template'}
        </button>
      </div>
      <p style={hint}>
        Paste the template into ChatGPT or Claude, ask for the article, then paste the HTML it returns below.
        The site adds its own header, footer and styling — the template is content only.
      </p>

      {open && <pre style={pre}>{AI_TEMPLATE}</pre>}

      <textarea
        value={html}
        onChange={(e) => { setHtml(e.target.value); if (status.kind !== 'busy') setStatus({ kind: 'idle' }) }}
        placeholder={'2 · Paste the article HTML here…'}
        rows={8}
        style={area}
        spellCheck={false}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
        <button type="button" onClick={() => htmlFileRef.current?.click()} style={ghost}>
          …or upload an .html file
        </button>
        <input ref={htmlFileRef} type="file" accept=".html,.htm,.txt,text/html,text/plain" onChange={onPickHtmlFile} style={{ display: 'none' }} />

        <span style={{ color: '#94a3b8' }}>|</span>

        <button type="button" onClick={() => coverRef.current?.click()} style={ghost}>
          3 · Choose cover image{coverName ? ' ✓' : ' (optional)'}
        </button>
        <input
          ref={coverRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          onChange={(e) => setCoverName(e.target.files?.[0]?.name || '')}
          style={{ display: 'none' }}
        />
        {coverName && <span style={{ fontSize: 12.5, color: '#475569' }}>{coverName}</span>}

        <button
          type="button"
          onClick={apply}
          disabled={status.kind === 'busy' || !html.trim()}
          style={primary(status.kind === 'busy' || !html.trim())}
        >
          {status.kind === 'busy' ? (status.message || 'Working…') : '4 · Fill the form'}
        </button>
      </div>

      {status.kind !== 'idle' && status.kind !== 'busy' && (
        <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, fontSize: 13.5, background: tone.bg, border: `1px solid ${tone.border}`, color: tone.fg }}>
          <b>{status.message}</b>
          {status.details && status.details.length > 0 && (
            <ul style={{ margin: '6px 0 0', paddingLeft: 20, fontSize: 12.5 }}>
              {status.details.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

const wrap: React.CSSProperties = {
  margin: '4px 0 26px',
  padding: '16px 18px',
  border: '1px solid #c9d5e2',
  borderRadius: 10,
  background: '#fbfdff',
}
const hint: React.CSSProperties = { margin: '8px 0 12px', fontSize: 12.5, color: '#6b7280', lineHeight: 1.5 }
const area: React.CSSProperties = {
  width: '100%', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 12.5, lineHeight: 1.5, padding: 12, borderRadius: 8, border: '1px solid #c9d5e2', resize: 'vertical',
}
const pre: React.CSSProperties = {
  ...area, background: '#f8fafc', maxHeight: 300, overflow: 'auto', whiteSpace: 'pre-wrap', marginBottom: 12,
}
const ghost: React.CSSProperties = {
  padding: '7px 14px', borderRadius: 8, border: '1px solid #c9d5e2', background: '#fff',
  color: '#042744', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
}
const link: React.CSSProperties = {
  padding: 0, border: 'none', background: 'none', color: '#0a4d89',
  fontSize: 12.5, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit',
}
const primary = (disabled: boolean): React.CSSProperties => ({
  padding: '8px 18px', borderRadius: 8, border: 'none',
  background: disabled ? '#f3f4f6' : '#ffc61f',
  color: disabled ? '#9ca3af' : '#042744',
  fontWeight: 700, fontSize: 13.5, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
  marginLeft: 'auto',
})

export default ArticleImportPanel
