import FleetBrowser from './FleetBrowser'
import { getCarsByBrand, getCarsByBodyType } from '@/lib/fleet'
export default function CollectionPage({
  name,
  type,
}: {
  name: string
  type: 'brand' | 'category'
}) {
  const cars = type === 'brand' ? getCarsByBrand(name) : getCarsByBodyType(name)
  return (
    <>
      <header className="z-page-hero z-collection-hero">
        <div className="container-lux">
          <div className="z-hero-row">
            <div>
              <h1>
                <T>{name}</T>
              </h1>
              <p className="z-lead">
                <T>Compare models, photos and listed rental rates.</T>
              </p>
            </div>
            <span>
              {cars.length} <T>vehicles</T>
            </span>
          </div>
        </div>
      </header>
      <div className="container-lux">
        <FleetBrowser
          key={name}
          cars={cars}
          lockedBrand={type === 'brand' ? name : undefined}
          lockedBodyType={type === 'category' ? name : undefined}
        />
      </div>
    </>
  )
}

import { T } from '@/components/RegionalProvider'
