import type { Metadata } from 'next'
import FleetBrowser from '@/components/FleetBrowser'
import { getAllCars, getBrands, getBodyTypes } from '@/lib/fleet'

export const metadata: Metadata = {
  title: 'The Fleet',
  description:
    'Browse every supercar, SUV and luxury saloon available to rent in Dubai, with daily and monthly rates.',
}

export default function FleetPage() {
  const cars = getAllCars()
  const brands = getBrands()
  const bodyTypes = getBodyTypes()

  return (
    <div className="container-lux pt-36 pb-24 md:pt-44">
      <header className="mb-14 max-w-2xl">
        <p className="eyebrow mb-4">{cars.length} vehicles available</p>
        <h1 className="font-display text-[clamp(2.5rem,7vw,5rem)] leading-[0.98]">The Fleet</h1>
        <p className="mt-5 leading-relaxed text-muted">
          From weekend supercars to long-term executive SUVs. Every rate below includes insurance
          and delivery inside Dubai.
        </p>
      </header>

      <FleetBrowser cars={cars} brands={brands} bodyTypes={bodyTypes} />
    </div>
  )
}
