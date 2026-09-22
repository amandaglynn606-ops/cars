import Image from 'next/image'
import Link from 'next/link'
import { occasionPages } from '@/lib/occasion-pages'
import { T } from '@/components/RegionalProvider'
import Icon from '@/components/Icon'
import '../locations/locations.css'
export const metadata = {
  title: 'Dubai Car Rental by Occasion | Dates, Gifts & Celebrations',
  description:
    'Plan a Dubai car rental for date nights, romantic getaways, surprise gifts, weddings, family outings and business events. Find practical advice and suitable cars.',
  alternates: { canonical: '/occasions' },
  openGraph: {
    title: 'Dubai car rental by occasion | Zavi',
    description: 'Find your occasion, choose a car and plan the details in Dubai.',
    url: '/occasions',
    images: [
      {
        url: '/occasions/dubai-date-night.webp',
        alt: 'Illustration of a Dubai-inspired waterfront date night',
      },
    ],
  },
}
export default function Page() {
  const groups = [...new Set(occasionPages.map((page) => page.group))]
  return (
    <div className="z-destination-page">
      <header className="container-lux z-destination-index-heading">
        <p className="z-kicker">
          <T>A reason to drive</T>
        </p>
        <h1>
          <T>Rent by occasion in Dubai</T>
        </h1>
        <p>
          <T>
            From a date for two to a celebration with everyone. Find the occasion, explore cars that
            fit your plans and share the details that matter for your rental.
          </T>
        </p>
        <nav aria-label="Occasion groups">
          {groups.map((group, index) => (
            <a href={'#occasion-group-' + index} key={group}>
              <T>{group}</T>
            </a>
          ))}
        </nav>
      </header>
      {groups.map((group, index) => (
        <section
          id={'occasion-group-' + index}
          className="container-lux z-destination-section z-occasion-group"
          key={group}
          aria-labelledby={'occasion-group-title-' + index}
        >
          <h2 id={'occasion-group-title-' + index}>
            <T>{group}</T>
          </h2>
          <div className="z-occasion-directory">
            {occasionPages
              .filter((page) => page.group === group)
              .map((page) => (
                <Link href={'/occasions/' + page.slug} key={page.slug} prefetch={false}>
                  <div className="z-occasion-card-image">
                    <Image
                      src={page.image.src}
                      alt={page.image.alt}
                      fill
                      sizes="(max-width:600px) 100vw, (max-width:1000px) 50vw, 33vw"
                    />
                  </div>
                  <div>
                    <h3 lang="en">{page.name}</h3>
                    <p lang="en">{page.description}</p>
                    <span>
                      <T>Plan the occasion</T>
                      <Icon name="arrow" size={18} />
                    </span>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      ))}
      <div className="container-lux z-occasion-image-note">
        <p>
          Occasion imagery sets the scene; vehicle colour previews show the cars offered for rental. Venue
          bookings, gifts and event services are not included in the vehicle rate.
        </p>
        <Link href="/image-credits">Image credits and illustration details</Link>
      </div>
    </div>
  )
}
