import { notFound } from 'next/navigation'
import { findBrandBySlug } from '@/lib/fleet'
import CollectionPage from '@/components/CollectionPage'
export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params
  const name = findBrandBySlug(brand)
  return {
    title: name ? name + ' Rental in Dubai' : 'Marque not found',
    description: name
      ? `Explore ${name} rental models in Dubai. View listed daily rates, photos and specifications, then send a request for your dates.`
      : undefined,
    alternates: { canonical: '/brands/' + brand },
  }
}
export default async function Page({ params }: { params: Promise<{ brand: string }> }) {
  const name = findBrandBySlug((await params).brand)
  if (!name) notFound()
  return <CollectionPage name={name} type="brand" />
}
