import type { Metadata } from 'next'
import { api } from '@/api/client'
import { ReviewsView } from './_ReviewsView'
import { buildMetadata } from '@/lib/seo'

export const revalidate = 30

export const metadata: Metadata = buildMetadata({
  title: 'Customer Reviews',
  description: "Real reviews from Bluven Energy customers across Australia. Share your own experience — no account required.",
  path: '/reviews',
})

export default async function ReviewsPage() {
  const res = await api.testimonials({ limit: 100 }).catch(() => null)
  const reviews = res?.docs ?? []
  return <ReviewsView reviews={reviews} />
}
