import { permanentRedirect, notFound } from 'next/navigation'
import { findBrandBySlug } from '@/lib/fleet'
export default async function Page({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params
  if (!findBrandBySlug(brand)) notFound()
  permanentRedirect('/brands/' + brand)
}
