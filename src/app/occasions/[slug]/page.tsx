import { notFound } from 'next/navigation'
import { findOccasion } from '@/lib/occasion-pages'
import LandingDetail from '@/components/LandingDetail'
export const dynamic = 'force-dynamic'
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params,
    page = findOccasion(slug)
  if (!page) return {}
  return {
    title: page.name + ' Car Rental in Dubai',
    description: page.description,
    alternates: { canonical: '/occasions/' + slug },
    openGraph: {
      type: 'website',
      title: page.name + ' Car Rental in Dubai | Zavi',
      description: page.description,
      url: '/occasions/' + page.slug,
      images: [{ url: page.image.src, alt: page.image.alt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.name + ' Car Rental in Dubai | Zavi',
      description: page.description,
      images: [page.image.src],
    },
  }
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const occasion = findOccasion(slug)
  if (!occasion) notFound()
  return <LandingDetail occasion={occasion} />
}
