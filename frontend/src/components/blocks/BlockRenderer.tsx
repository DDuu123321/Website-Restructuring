import Link from 'next/link'
import { api } from '@/api/client'
import { RichText } from '@/components/ui/RichText'
import type { LayoutBlock, Media } from '@/types/cms'

/**
 * Renders CMS page-builder sections (the `layout` blocks field on News and
 * Projects — mirrors cms/src/blocks/layoutBlocks.ts). Server-safe: no hooks.
 * Styles live in src/styles/blocks.css (bvb-* classes).
 */
export function BlockRenderer({ blocks }: { blocks?: LayoutBlock[] | null }) {
  if (!blocks || blocks.length === 0) return null
  return (
    <div className="bvb">
      {blocks.map((b, i) => (
        <BlockSection key={b.id || i} block={b} />
      ))}
    </div>
  )
}

function BlockSection({ block }: { block: LayoutBlock }) {
  switch (block.blockType) {
    case 'richText':
      return (
        <section className="bvb-text">
          {block.heading && <h2 className="bvb-h">{block.heading}</h2>}
          <RichText data={block.body} className="prose" />
        </section>
      )

    case 'imageText':
      return (
        <section className={`bvb-imagetext ${block.imageSide === 'right' ? 'is-right' : ''}`}>
          <div className="bvb-imagetext-media">
            <BlockImg media={block.image} size="card" />
          </div>
          <div className="bvb-imagetext-body">
            {block.heading && <h2 className="bvb-h">{block.heading}</h2>}
            <RichText data={block.body} className="prose" />
          </div>
        </section>
      )

    case 'gallery':
      return (
        <section className={`bvb-gallery cols-${block.columns === '2' ? '2' : '3'}`}>
          {(block.images || []).map((g, i) => (
            <figure key={i} className="bvb-gallery-item">
              <BlockImg media={g.image} size="card" />
              {g.caption && <figcaption>{g.caption}</figcaption>}
            </figure>
          ))}
        </section>
      )

    case 'stats':
      return (
        <section className="bvb-stats">
          {(block.items || []).map((it, i) => (
            <div key={i} className="bvb-stat">
              <div className="bvb-stat-value">{it.value}</div>
              <div className="bvb-stat-label">{it.label}</div>
            </div>
          ))}
        </section>
      )

    case 'pullQuote':
      return (
        <section className="bvb-quote">
          <span className="bvb-quote-mark" aria-hidden="true">"</span>
          <p className="bvb-quote-text">{block.text}</p>
          {(block.name || block.detail) && (
            <div className="bvb-quote-by">
              {block.name && <b>{block.name}</b>}
              {block.name && block.detail && <span> · </span>}
              {block.detail && <span>{block.detail}</span>}
            </div>
          )}
        </section>
      )

    case 'callToAction':
      return (
        <section className="bvb-cta">
          <div className="bvb-cta-copy">
            <h2 className="bvb-cta-h">{block.heading}</h2>
            {block.text && <p className="bvb-cta-t">{block.text}</p>}
          </div>
          <Link className="btn btn-primary" href={block.buttonHref || '/quote'}>
            <span>{block.buttonLabel || 'Get a free quote'}</span> <span className="arrow">→</span>
          </Link>
        </section>
      )

    case 'video': {
      const yt = youtubeId(block.url)
      return (
        <section className="bvb-video">
          <div className="bvb-video-frame">
            {yt ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${yt}`}
                title={block.caption || 'Video'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video src={block.url} controls preload="metadata" playsInline />
            )}
          </div>
          {block.caption && <p className="bvb-video-caption">{block.caption}</p>}
        </section>
      )
    }

    default:
      return null
  }
}

function BlockImg({ media, size }: { media: Media | string; size: 'card' | 'hero' }) {
  const url = api.imgUrl(media as Media, size)
  if (!url) return null
  const m = typeof media === 'object' ? media : undefined
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={m?.alt || ''} loading="lazy" />
}

function youtubeId(url: string): string | null {
  const m = String(url || '').match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/
  )
  return m ? m[1] : null
}
