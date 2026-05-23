/**
 * Renders Lexical/Slate richtext from Payload CMS.
 * Pure React — works in both Server and Client Components.
 */

interface RichTextProps {
  data: any
  className?: string
}

export function RichText({ data, className }: RichTextProps) {
  if (!data) return null

  if (data.root && Array.isArray(data.root.children)) {
    return (
      <div className={className}>
        {data.root.children.map((child: any, i: number) => renderLexicalNode(child, i))}
      </div>
    )
  }

  if (Array.isArray(data)) {
    return (
      <div className={className}>
        {data.map((node, i) => renderSlateNode(node, i))}
      </div>
    )
  }

  return null
}

function renderLexicalNode(node: any, key: number): any {
  if (!node) return null
  const children = (node.children || []).map((c: any, i: number) => renderLexicalNode(c, i))

  switch (node.type) {
    case 'paragraph':  return <p key={key}>{children}</p>
    case 'heading':    { const Hn = `h${node.tag || 2}` as any; return <Hn key={key}>{children}</Hn> }
    case 'list':       return node.tag === 'ul' ? <ul key={key}>{children}</ul> : <ol key={key}>{children}</ol>
    case 'listitem':   return <li key={key}>{children}</li>
    case 'quote':      return <blockquote key={key}>{children}</blockquote>
    case 'link':       return <a key={key} href={node.fields?.url || node.url} target={node.fields?.newTab ? '_blank' : undefined} rel="noreferrer">{children}</a>
    case 'linebreak':  return <br key={key} />
    case 'text':       return formatText(node.text || '', node.format || 0, key)
    default:           return <span key={key}>{children}</span>
  }
}

function formatText(text: string, format: number, key: number) {
  let el: any = text
  if (format & 1)  el = <strong key={key}>{el}</strong>
  if (format & 2)  el = <em key={key}>{el}</em>
  if (format & 4)  el = <s key={key}>{el}</s>
  if (format & 8)  el = <u key={key}>{el}</u>
  if (format & 16) el = <code key={key}>{el}</code>
  return el
}

function renderSlateNode(node: any, key: number): any {
  if (typeof node.text === 'string') {
    let el: any = node.text
    if (node.bold) el = <strong key={key}>{el}</strong>
    if (node.italic) el = <em key={key}>{el}</em>
    if (node.underline) el = <u key={key}>{el}</u>
    return el
  }
  const children = (node.children || []).map((c: any, i: number) => renderSlateNode(c, i))
  switch (node.type) {
    case 'h1': return <h1 key={key}>{children}</h1>
    case 'h2': return <h2 key={key}>{children}</h2>
    case 'h3': return <h3 key={key}>{children}</h3>
    case 'ul': return <ul key={key}>{children}</ul>
    case 'ol': return <ol key={key}>{children}</ol>
    case 'li': return <li key={key}>{children}</li>
    case 'blockquote': return <blockquote key={key}>{children}</blockquote>
    case 'link': return <a key={key} href={node.url} target="_blank" rel="noreferrer">{children}</a>
    default:   return <p key={key}>{children}</p>
  }
}

/** Strip richtext to plain text for SEO descriptions / OG tags. */
export function richTextToPlain(data: any, max = 160): string {
  if (!data) return ''
  let out = ''
  function walk(node: any) {
    if (!node) return
    if (typeof node.text === 'string') { out += node.text + ' '; return }
    if (Array.isArray(node.children)) node.children.forEach(walk)
    else if (Array.isArray(node)) node.forEach(walk)
    else if (node.root) walk(node.root)
  }
  walk(data)
  return out.replace(/\s+/g, ' ').trim().slice(0, max)
}
