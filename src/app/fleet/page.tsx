import type { Metadata } from 'next'
import Link from 'next/link'
import FleetBrowser from '@/components/FleetBrowser'
import { getAllCars } from '@/lib/fleet'
export const metadata: Metadata = {
  title: 'The Zavi Fleet',
  description:
    'Explore the Zavi fleet. Explore luxury cars, supercars and SUVs by brand, model, category and daily rental price.',
  alternates: { canonical: '/fleet' },
}
export default function FleetPage() {
  const cars = getAllCars()
  return (
    <>
      <header className="z-page-hero">
        <div className="container-lux">
          <div className="z-hero-row">
            <div>
              <p className="z-kicker">
                <T>The Zavi fleet</T>
              </p>
              <h1>
                <T>Browse rental cars</T>
              </h1>
              <p className="z-lead">
                <T>Filter by brand, model, category or daily rate.</T>
              </p>
            </div>
            <span>
              {cars.length} <T>vehicles in the collection</T>
            </span>
          </div>
        </div>
      </header>
      <div className="container-lux">
        <FleetBrowser cars={cars} />
      </div>
    </>
  )
}

import { T } from '@/components/RegionalProvider'
