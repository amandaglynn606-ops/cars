import { notFound } from 'next/navigation'
import { findBodyTypeBySlug } from '@/lib/fleet'
import CollectionPage from '@/components/CollectionPage'
export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const name = findBodyTypeBySlug(category)
  return {
    title: name ? name + ' Car Rental in Dubai' : 'Collection not found',
    description: name
      ? `Browse the ${name} rental category in Dubai. Compare vehicles, listed daily rates and photos, then choose your rental dates.`
      : undefined,
    alternates: { canonical: '/categories/' + category },
  }
}
export default async function Page({ params }: { params: Promise<{ category: string }> }) {
  const name = findBodyTypeBySlug((await params).category)
  if (!name) notFound()
  return <CollectionPage name={name} type="category" />
}
