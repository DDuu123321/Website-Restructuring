import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { api } from '@/api/client'
import { buildMetadata, articleLd, breadcrumbLd, SITE } from '@/lib/seo'
import { JsonLd } from '@/components/ui/JsonLd'
import { Reveal } from '@/components/ui/Reveal'
import { RichText, richTextToPlain } from '@/components/ui/RichText'

export const revalidate = 60

interface PageProps { params: { slug: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = await api.newsBySlug(params.slug).catch(() => null)
  if (!article) return buildMetadata({ title: 'Not found', noindex: true })

  return buildMetadata({
    title: article.seo?.metaTitle || article.title,
    description: article.seo?.metaDescription || article.summary,
    path: `/news/${article.slug}`,
    image: article.coverImage ? api.imgUrl(article.coverImage, 'hero') : undefined,
    type: 'article',
    publishedTime: article.publishedAt,
  })
}

// Pre-generate static params for known articles
export async function generateStaticParams() {
  try {
    const data = await api.news({ limit: 100 })
    return data.docs.map(a => ({ slug: a.slug }))
  } catch {
    return []
  }
}

export default async function NewsArticlePage({ params }: PageProps) {
  const article = await api.newsBySlug(params.slug).catch(() => null)
  if (!article) notFound()

  const description = article.summary || richTextToPlain(article.content, 160)

  return (
    <>
      <JsonLd data={[
        articleLd({
          title: article.title,
          description,
          slug: article.slug,
          publishedAt: article.publishedAt,
          author: article.author,
          image: article.coverImage ? api.imgUrl(article.coverImage, 'hero') : undefined,
        }),
        breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Insights & News', path: '/news' },
          { name: article.title, path: `/news/${article.slug}` },
        ]),
      ]} />

      <article className="section" style={{ paddingTop: 120 }}>
        <div className="container" style={{ maxWidth: 880 }}>
          <Reveal>
            <Link href="/news" style={{ fontSize: 13.5, color: 'var(--bv-gray-500)' }}>← All articles</Link>
            <div className="meta" style={{ display: 'flex', gap: 12, fontSize: 12.5, color: 'var(--bv-gray-500)', margin: '20px 0' }}>
              <span>{article.category.toUpperCase()}</span>
              {article.readTime && <span>· {article.readTime} min read</span>}
              {article.publishedAt && <span>· {new Date(article.publishedAt).toLocaleDateString()}</span>}
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: 700, lineHeight: 1.15, margin: '0 0 20px' }}>
              {article.title}
            </h1>
            <p style={{ fontSize: 19, color: 'var(--bv-gray-700)', lineHeight: 1.55, marginBottom: 32 }}>
              {article.summary}
            </p>
            {article.coverImage && (
              <img
                src={api.imgUrl(article.coverImage, 'hero')}
                alt={article.coverImage.alt}
                style={{ width: '100%', borderRadius: 'var(--radius-2xl)', marginBottom: 40 }}
              />
            )}
            <RichText data={article.content} className="prose" />
          </Reveal>
        </div>
      </article>
    </>
  )
}
