import Image from 'next/image'
import Link from 'next/link'
import type { LocationPage } from '@/lib/location-pages'
import { locationHref, locationDescription } from '@/lib/location-routing'
import { locationPages } from '@/lib/location-pages'
import type { OccasionPage } from '@/lib/occasion-pages'
import { occasionPages } from '@/lib/occasion-pages'
import { destinationMedia } from '@/lib/destination-media'
import { getAllCars } from '@/lib/fleet'
import { landingCars } from '@/lib/landing-fleet'
import { siteConfig } from '@/lib/config'
import FleetBrowser from './FleetBrowser'
import BookingForm from './BookingForm'
import { T } from './RegionalProvider'
import Icon from './Icon'
import '@/app/locations/locations.css'

export default function LandingDetail({
  location,
  occasion,
}: {
  location?: LocationPage
  occasion?: OccasionPage
}) {
  const entry = location || occasion!
  const kind = location ? 'locations' : 'occasions'
  const cars = getAllCars(),
    selection = landingCars(cars, location, occasion)
  const media = location ? destinationMedia[location.slug] || destinationMedia[location.photo] : occasion!.image
  const title = location
    ? location.slug === 'the-world-islands'
      ? 'Car rental for your World Islands stay'
      : 'Luxury car rental in ' + location.name
    : occasion!.title
  const nearby = location
    ? locationPages
        .filter((item) => item.slug !== location.slug && item.region === location.region)
        .slice(0, location.name === location.region ? undefined : 6)
    : occasionPages
        .filter((item) => item.slug !== occasion!.slug && item.group === occasion!.group)
        .slice(0, 4)
  const context = location
    ? `Delivery request: ${location.name}. Please confirm the property entrance and delivery arrangements.`
    : `Occasion: ${occasion!.name}. Please confirm suitability and any permissions for the intended use.`
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      {
        '@type': 'ListItem',
        position: 2,
        name: location ? 'Rental locations' : 'Rent by occasion',
        item: siteConfig.url + '/' + kind,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: entry.name,
        item: siteConfig.url + (location ? locationHref(location) : '/occasions/' + entry.slug),
      },
    ],
  }
  const structuredData = [
    breadcrumb,
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id':
        siteConfig.url +
        (location ? locationHref(location) : '/occasions/' + occasion!.slug) +
        '#webpage',
      url: siteConfig.url + (location ? locationHref(location) : '/occasions/' + occasion!.slug),
      name: title,
      description: location ? locationDescription(location) : occasion!.description,
      inLanguage: 'en',
      image: siteConfig.url + media.src,
      isPartOf: { '@type': 'WebSite', name: 'Zavi', url: siteConfig.url },
    },
  ]
  return (
    <div className="z-destination-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />
      <header className="z-destination-hero container-lux">
        <div className="z-destination-intro">
          <p className="z-kicker">
            <T>
              {location
                ? 'Your destination, your drive'
                : 'The occasion deserves a considered choice'}
            </T>
          </p>
          <h1 lang="en">{title}</h1>
          <p className="z-destination-lead" lang="en">
            {entry.intro}
          </p>
          <a href="#request-rental" className="z-button">
            <T>Request your dates</T>
            <Icon name="arrow" size={18} />
          </a>
        </div>
        <figure className="z-destination-visual">
          <Image
            src={media.src}
            alt={occasion?.image.alt || media.caption}
            fill
            sizes="(max-width: 1440px) 100vw, 1360px"
            quality={90}
            priority
          />
        </figure>
      </header>
      <nav className="z-destination-jump container-lux" aria-label="Page sections">
        <a href="#plan-your-rental">
          <T>{location ? 'Plan your stay' : 'Plan the occasion'}</T>
        </a>
        <a href="#recommended-cars">
          <T>Explore the cars</T>
        </a>
        <a href="#request-rental">
          <T>Request a quote</T>
        </a>
        <a href="#rental-details">
          <T>Rental questions</T>
        </a>
      </nav>
      <section
        id="plan-your-rental"
        className="container-lux z-destination-section"
        aria-labelledby="plan-heading"
      >
        <p className="z-kicker">
          <T>The details that make the difference</T>
        </p>
        <h2 id="plan-heading">
          <T>{location ? 'Plan your arrival' : 'Before the occasion'}</T>
        </h2>
        {occasion && (
          <div className="z-occasion-guide" lang="en">
            <article>
              <h3>{occasion.dubaiHeading}</h3>
              <p>{occasion.dubaiGuide}</p>
              <Link href={locationHref(occasion.locationSlug)} className="z-text-link">
                Plan the location <Icon name="arrow" size={16} />
              </Link>
            </article>
            <aside>
              <h3>Choosing the right car</h3>
              <p>{occasion.carAdvice}</p>
            </aside>
          </div>
        )}
        <div className="z-destination-planning">
          <article>
            <span aria-hidden="true">01</span>
            <h3>
              <T>{location ? 'Your meeting point' : 'Your schedule'}</T>
            </h3>
            <p lang="en">{location?.arrival || occasion!.plan}</p>
          </article>
          <article>
            <span aria-hidden="true">02</span>
            <h3>
              <T>{location ? 'Choose around your plans' : 'The practical details'}</T>
            </h3>
            <p lang="en">{location?.planning || occasion!.practical}</p>
          </article>
          <article>
            <span aria-hidden="true">03</span>
            <h3>
              <T>Confirm your quote</T>
            </h3>
            <p>
              <T>
                Ask for the full price for your dates, the mileage allowance, deposit, insurance and
                any delivery charges. The team confirms the vehicle and rental terms before your
                booking is agreed.
              </T>
            </p>
          </article>
        </div>
      </section>
      <section
        id="recommended-cars"
        className="container-lux z-destination-section z-destination-fleet"
        aria-labelledby="cars-heading"
      >
        <div className="z-destination-section-head">
          <div>
            <p className="z-kicker">
              <T>The Zavi collection</T>
            </p>
            <h2 id="cars-heading">
              <T>Cars to consider</T>
            </h2>
          </div>
          <Link href="/fleet" className="z-text-link">
            <T>View the full fleet</T>
            <Icon name="arrow" size={16} />
          </Link>
        </div>
        <p className="z-note">
          <T>
            Compare these available catalogue models and their listed rates. Availability for your
            dates and suitability for the intended use require confirmation.
          </T>
        </p>
        <FleetBrowser cars={selection} />
      </section>
      <section
        id="request-rental"
        className="container-lux z-destination-section"
        aria-labelledby="quote-heading"
      >
        <p className="z-kicker">
          <T>Make it yours</T>
        </p>
        <h2 id="quote-heading">
          <T>Request your rental</T>
        </h2>
        <p className="z-note">
          <T>
            Choose your car and dates, then add the details of your plans. Sending this form creates
            a pending request; no payment is taken.
          </T>
        </p>
        <BookingForm
          cars={cars}
          initialLocation={location?.region || 'Dubai'}
          initialNotes={context}
        />
      </section>
      <section
        id="rental-details"
        className="container-lux z-destination-section"
        aria-labelledby="details-heading"
      >
        <h2 id="details-heading">
          <T>Useful to know</T>
        </h2>
        <div className="z-destination-faq">
          <details open>
            <summary lang="en">
              {entry.question}
              <span aria-hidden="true">+</span>
            </summary>
            <p lang="en">{entry.answer}</p>
          </details>
          <details>
            <summary>
              <T>What do I need before the rental is confirmed?</T>
              <span aria-hidden="true">+</span>
            </summary>
            <p>
              <T>
                Ask the team to confirm driver age, licence eligibility, documents, deposit and
                insurance requirements for your booking. Share contact details here, and provide any
                required identity documents only through the channel agreed with the team.
              </T>
            </p>
          </details>
          <details>
            <summary>
              <T>Are delivery or special-use costs included in the daily price?</T>
              <span aria-hidden="true">+</span>
            </summary>
            <p>
              <T>
                The catalogue displays recorded vehicle rates. Your final quote must confirm
                delivery, collection, additional drivers and any separately approved use or service.
                Do not assume a hotel, venue or event package is included.
              </T>
            </p>
          </details>
        </div>
      </section>
      <section
        className="container-lux z-destination-section z-destination-related"
        aria-labelledby="related-heading"
      >
        <h2 id="related-heading">
          <T>
            {location
              ? location.name === location.region
                ? 'Locations in ' + location.region
                : 'Explore more of ' + location.region
              : 'More ways to drive'}
          </T>
        </h2>
        <div>
          {nearby.map((item) => (
            <Link href={location ? locationHref(item) : '/occasions/' + item.slug} key={item.slug}>
              {item.name}
              <Icon name="arrow" size={18} />
            </Link>
          ))}
        </div>
        <Link href={'/' + kind} className="z-text-link">
          <T>{location ? 'View all locations' : 'View all occasions'}</T>
          <Icon name="arrow" size={16} />
        </Link>
      </section>
    </div>
  )
}
