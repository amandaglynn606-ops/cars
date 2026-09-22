import Image from 'next/image'
import Link from 'next/link'
import { locationPages } from '@/lib/location-pages'
import { locationGroups, locationEmirates } from '@/lib/location-routing'
import { destinationMedia } from '@/lib/destination-media'
import { T } from '@/components/RegionalProvider'
import Icon from '@/components/Icon'
import './locations.css'
export const metadata = {
  title: 'Luxury Car Rental Locations Across the UAE',
  description:
    'Explore rental locations by emirate, from Dubai neighbourhoods to UAE coastal stays. Explore cars and check delivery arrangements for your address.',
  alternates: { canonical: '/locations' },
}
export default function Page() {
  const groups = locationGroups(locationPages)
  return (
    <div className="z-destination-page">
      <header className="container-lux z-destination-index-heading">
        <p className="z-kicker">
          <T>Across the UAE</T>
        </p>
        <h1>
          <T>Find your destination</T>
        </h1>
        <p>
          <T>
            Explore the listed locations by emirate. Choose your area to plan a meeting point,
            review cars and request delivery. Availability, timing and charges are confirmed for
            your address.
          </T>
        </p>
        <nav aria-label="Emirates">
          {groups.map((group, index) => (
            <a key={group.name} href={'#' + locationEmirates[index].slug}>
              <T>{group.name}</T>
            </a>
          ))}
        </nav>
      </header>
      {groups.map((group, index) => (
        <section
          id={locationEmirates[index].slug}
          key={group.name}
          className="container-lux z-destination-section"
          aria-labelledby={'heading-' + index}
        >
          <div className="z-location-region-heading">
            <Link href={group.href} className="z-location-region-image">
              <Image
                src={destinationMedia[locationEmirates[index].slug].src}
                alt={destinationMedia[locationEmirates[index].slug].caption}
                fill
                sizes="(max-width:600px) 100vw, 300px"
              />
            </Link>
            <div>
              <h2 id={'heading-' + index}>
                <Link href={group.href}>
                  <T>{group.name}</T>
                </Link>
              </h2>
              <Link href={group.href} className="z-text-link">
                <T>Explore the emirate</T>
                <Icon name="arrow" size={18} />
              </Link>
            </div>
          </div>
          <div className="z-location-directory">
            {group.links.map((link) => (
              <Link href={link.href} key={link.href} className="z-location-link">
                <div>
                  <h3>{link.name}</h3>
                  <span>
                    <T>Plan your rental</T>
                    <Icon name="arrow" size={18} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
