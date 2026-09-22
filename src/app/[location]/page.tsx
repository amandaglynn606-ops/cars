import { notFound } from 'next/navigation'
import { locationPages } from '@/lib/location-pages'
import { findLocationRoute, locationHref, locationDescription } from '@/lib/location-routing'
import { destinationMedia } from '@/lib/destination-media'
import LandingDetail from '@/components/LandingDetail'
export const dynamic = 'force-dynamic'
type Props = { params: Promise<{ location: string }> }
export async function generateMetadata({ params }: Props) {
  const page = findLocationRoute((await params).location, locationPages)
  if (!page) return {}
  const title = page.name + ' Luxury Car Rental'
  const description = locationDescription(page)
  const media = destinationMedia[page.slug] || destinationMedia[page.photo]
  return {
    title,
    description,
    alternates: { canonical: locationHref(page) },
    openGraph: {
      title: title + ' | Zavi',
      description,
      url: locationHref(page),
      images: [media.src],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: [media.src],
    },
  }
}
export default async function Page({ params }: Props) {
  const location = findLocationRoute((await params).location, locationPages)
  if (!location) notFound()
  return <LandingDetail location={location} />
}
