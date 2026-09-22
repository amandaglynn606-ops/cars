import { permanentRedirect, notFound } from 'next/navigation'
import { getCarBySlug, findBodyTypeBySlug } from '@/lib/fleet'
import { carHref } from '@/lib/catalogue'
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { slug } = await params
  const car = getCarBySlug(slug)
  const query = new URLSearchParams()
  const values = await searchParams
  for (const key of ['start', 'end', 'location'])
    if (typeof values[key] === 'string') query.set(key, values[key])
  if (car) permanentRedirect(carHref(car) + (query.size ? '?' + query.toString() : ''))
  const category = slug === 'super-sport' ? 'supersport' : slug
  if (findBodyTypeBySlug(category)) permanentRedirect('/categories/' + category)
  notFound()
}
