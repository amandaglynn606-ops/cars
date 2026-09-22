import Link from 'next/link'
import Icon from '@/components/Icon'
export default function NotFound() {
  return (
    <div className="container-lux z-section">
      <div className="z-empty">
        <p className="z-kicker">
          <T>Zavi · 404</T>
        </p>
        <h1 className="font-display display-lg">
          <T>Page not found</T>
        </h1>
        <p>
          <T>This page could not be found. Browse the fleet to find a vehicle.</T>
        </p>
        <Link href="/fleet" className="z-button">
          <T>Explore the fleet</T>
          <Icon name="arrow" />
        </Link>
      </div>
    </div>
  )
}

import { T } from '@/components/RegionalProvider'
