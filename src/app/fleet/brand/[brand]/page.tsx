import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import FleetBrowser from '@/components/FleetBrowser'
import CategoryHeader from '@/components/CategoryHeader'
import {
  getBrands,
  getBodyTypes,
  getCarsByBrand,
  findBrandBySlug,
  categorySlug,
  priceBounds,
  categoryImage,
} from '@/lib/fleet'

export const dynamicParams = false

export function generateStaticParams() {
  return getBrands().map((brand) => ({ brand: categorySlug(brand.name) }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>
}): Promise<Metadata> {
  const { brand: slug } = await params
  const brand = findBrandBySlug(slug)
  if (!brand) return { title: 'Marque not found' }

  const cars = getCarsByBrand(brand)
  const bounds = priceBounds(cars, 'daily')

  return {
    title: `Rent ${brand} in Dubai`,
    description: `${cars.length} ${brand} vehicles available to rent in Dubai${
      bounds ? `, from ${bounds.min} AED per day` : ''
    }. Delivered to your hotel or residence, insurance included.`,
  }
}

export default async function BrandPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: slug } = await params
  const brand = findBrandBySlug(slug)
  if (!brand) notFound()

  const cars = getCarsByBrand(brand)

  return (
    <div className="pt-28 pb-24">
      <CategoryHeader
        eyebrow="Marque"
        title={brand}
        count={cars.length}
        image={categoryImage(cars)}
        bounds={priceBounds(cars, 'daily')}
        breadcrumb={
          <>
            <Link href="/fleet" className="link-sweep transition-colors hover:text-gold-500">
              Fleet
            </Link>
            <span aria-hidden>/</span>
            <span className="text-bone/75">{brand}</span>
          </>
        }
      />

      <div className="container-lux mt-14">
        <FleetBrowser
          cars={cars}
          brands={getBrands()}
          bodyTypes={getBodyTypes()}
          lockedBrand={brand}
        />
      </div>
    </div>
  )
}
