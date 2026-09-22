import { permanentRedirect, notFound } from 'next/navigation'
import { findBodyTypeBySlug } from '@/lib/fleet'
export default async function Page({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params
  const slug = type === 'super-sport' ? 'supersport' : type
  if (!findBodyTypeBySlug(slug)) notFound()
  permanentRedirect('/categories/' + slug)
}
