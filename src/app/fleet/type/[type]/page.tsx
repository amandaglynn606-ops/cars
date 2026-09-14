import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import FleetBrowser from '@/components/FleetBrowser'
import CategoryHeader from '@/components/CategoryHeader'
import {
  getBrands,
  getBodyTypes,
  getCarsByBodyType,
  findBodyTypeBySlug,
  categorySlug,
  priceBounds,
  categoryImage,
} from '@/lib/fleet'

export const dynamicParams = false

export function generateStaticParams() {
  return getBodyTypes().map((type) => ({ type: categorySlug(type.name) }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>
}): Promise<Metadata> {
  const { type: slug } = await params
  const bodyType = findBodyTypeBySlug(slug)
  if (!bodyType) return { title: 'Category not found' }

  const cars = getCarsByBodyType(bodyType)
  const bounds = priceBounds(cars, 'daily')

  return {
    title: `${bodyType} Rental Dubai`,
    description: `${cars.length} ${bodyType.toLowerCase()} vehicles available to rent in Dubai${
      bounds ? `, from ${bounds.min} AED per day` : ''
    }. Free delivery inside Dubai, insurance included.`,
  }
}

export default async function BodyTypePage({ params }: { params: Promise<{ type: string }> }) {
  const { type: slug } = await params
  const bodyType = findBodyTypeBySlug(slug)
  if (!bodyType) notFound()

  const cars = getCarsByBodyType(bodyType)

  return (
    <div className="pt-28 pb-24">
      <CategoryHeader
        eyebrow="Category"
        title={bodyType}
        count={cars.length}
        image={categoryImage(cars)}
        bounds={priceBounds(cars, 'daily')}
        breadcrumb={
          <>
            <Link href="/fleet" className="link-sweep transition-colors hover:text-gold-500">
              Fleet
            </Link>
            <span aria-hidden>/</span>
            <span className="text-bone/75">{bodyType}</span>
          </>
        }
      />

      <div className="container-lux mt-14">
        <FleetBrowser
          cars={cars}
          brands={getBrands()}
          bodyTypes={getBodyTypes()}
          lockedBodyType={bodyType}
        />
      </div>
    </div>
  )
}
