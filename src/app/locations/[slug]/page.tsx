import { notFound, permanentRedirect } from 'next/navigation'
import { findLocation } from '@/lib/location-pages'
import { locationHref } from '@/lib/location-routing'
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const location = findLocation((await params).slug)
  if (!location) notFound()
  permanentRedirect(locationHref(location))
}
