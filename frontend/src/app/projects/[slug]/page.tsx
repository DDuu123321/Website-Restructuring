import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { api } from '@/api/client'
import { buildMetadata, projectLd, breadcrumbLd } from '@/lib/seo'
import { JsonLd } from '@/components/ui/JsonLd'
import { Reveal } from '@/components/ui/Reveal'
import { RichText } from '@/components/ui/RichText'

export const revalidate = 60

interface PageProps { params: { slug: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const p = await api.projectBySlug(params.slug).catch(() => null)
  if (!p) return buildMetadata({ title: 'Not found', noindex: true })
  return buildMetadata({
    title: p.title,
    description: p.summary,
    path: `/projects/${p.slug}`,
    image: p.coverImage ? api.imgUrl(p.coverImage, 'hero') : undefined,
  })
}

export async function generateStaticParams() {
  try {
    const data = await api.projects({ limit: 100 })
    return data.docs.map(p => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const p = await api.projectBySlug(params.slug).catch(() => null)
  if (!p) notFound()

  return (
    <>
      <JsonLd data={[
        projectLd({
          title: p.title,
          description: p.summary,
          slug: p.slug,
          location: p.location,
          image: p.coverImage ? api.imgUrl(p.coverImage, 'hero') : undefined,
        }),
        breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Projects', path: '/projects' },
          { name: p.title, path: `/projects/${p.slug}` },
        ]),
      ]} />

      <article className="section" style={{ paddingTop: 120 }}>
        <div className="container" style={{ maxWidth: 1100 }}>
          <Reveal>
            <Link href="/projects" style={{ fontSize: 13.5, color: 'var(--bv-gray-500)' }}>← All projects</Link>
            <div style={{ display: 'flex', gap: 14, fontSize: 13, color: 'var(--bv-gray-500)', margin: '20px 0' }}>
              <span>{p.location}</span>
              {p.specs?.completionYear && <span>· {p.specs.completionYear}</span>}
              {p.specs?.solarKw && <span>· {p.specs.solarKw} kW solar</span>}
              {p.specs?.batteryKwh && <span>· {p.specs.batteryKwh} kWh battery</span>}
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: 700, lineHeight: 1.15, margin: '0 0 24px' }}>
              {p.title}
            </h1>
            <p style={{ fontSize: 19, color: 'var(--bv-gray-700)', lineHeight: 1.55, marginBottom: 40, maxWidth: 720 }}>{p.summary}</p>

            <img src={api.imgUrl(p.coverImage, 'hero')} alt={p.coverImage.alt} style={{ width: '100%', borderRadius: 'var(--radius-2xl)', marginBottom: 40 }} />

            {p.specs && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24, padding: '32px 0', borderTop: '1px solid var(--bv-gray-100)', borderBottom: '1px solid var(--bv-gray-100)', marginBottom: 40 }}>
                {p.specs.solarKw && <SpecBlock label="Solar" value={`${p.specs.solarKw} kW`} />}
                {p.specs.batteryKwh && <SpecBlock label="Battery" value={`${p.specs.batteryKwh} kWh`} />}
                {p.specs.panels && <SpecBlock label="Panels" value={String(p.specs.panels)} />}
                {p.specs.inverter && <SpecBlock label="Inverter" value={p.specs.inverter} />}
                {p.specs.battery && <SpecBlock label="Battery brand" value={p.specs.battery} />}
              </div>
            )}

            {p.description && <RichText data={p.description} />}

            {p.gallery && p.gallery.length > 0 && (
              <div className="news-grid" style={{ marginTop: 40 }}>
                {p.gallery.map((g, i) => (
                  <img key={i} src={api.imgUrl(g.image, 'card')} alt={g.image.alt} style={{ width: '100%', borderRadius: 'var(--radius-lg)' }} />
                ))}
              </div>
            )}

            {p.testimonial?.quote && (
              <div style={{ background: 'var(--bv-cream)', padding: 40, borderRadius: 'var(--radius-2xl)', marginTop: 40 }}>
                <div style={{ color: 'var(--bv-amber-500)', fontSize: 24, marginBottom: 16 }}>"</div>
                <p style={{ fontSize: 20, lineHeight: 1.55 }}>{p.testimonial.quote}</p>
                <div style={{ marginTop: 20, fontSize: 14, color: 'var(--bv-gray-700)' }}>
                  <b>{p.testimonial.customerName}</b>
                  {p.testimonial.customerSuburb && <span> · {p.testimonial.customerSuburb}</span>}
                </div>
              </div>
            )}
          </Reveal>
        </div>
      </article>
    </>
  )
}

function SpecBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--bv-gray-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, fontFamily: 'var(--font-display)' }}>{value}</div>
    </div>
  )
}
