import { notFound, permanentRedirect } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import { getCarByRoute, getRelatedCars } from '@/lib/fleet'
import { reservedDates } from '@/lib/db'
import { carHref, monthlyCarHref, categorySlug } from '@/lib/catalogue'
import { siteConfig } from '@/lib/config'
import CarGallery from '@/components/CarGallery'
import CarCard from '@/components/CarCard'
import ReserveVehicle from '@/components/ReserveVehicle'
import VehicleTitle from '@/components/VehicleTitle'
import { rentalPeriodRates } from '@/lib/monthly-pricing'
export type VehicleDetailProps = {
  params: Promise<{ slug: string; model: string }>
  searchParams: Promise<{
    start?: string
    end?: string
    location?: string
    colour?: string
    plan?: string
    event?: string
  }>
}
export async function vehicleMetadata(
  { params }: Pick<VehicleDetailProps, 'params'>,
  monthly = false,
) {
  const p = await params
  const car = getCarByRoute(p.slug, p.model)
  if (!car || (monthly && (!car.pricing.daily || car.pricing.daily <= 0)))
    return { title: 'Vehicle not found' }
  const title = car.name + (monthly ? ' Monthly Rental in Dubai' : ' Rental in Dubai')
  const description = monthly
    ? `Rent the ${car.name} for 30 days in Dubai with 20% off the daily-rate equivalent. View available colours, monthly pricing and request your dates.`
    : null
  return {
    title,
    description,
    alternates: { canonical: monthly ? monthlyCarHref(car) : carHref(car) },
    openGraph: { title, description, images: car.images[0] ? [{ url: car.images[0].src }] : [] },
  }
}
export default async function VehicleDetail({
  params,
  searchParams,
  monthlyPage = false,
}: VehicleDetailProps & { monthlyPage?: boolean }) {
  const p = await params,
    query = await searchParams,
    car = getCarByRoute(p.slug, p.model)
  if (!car || (monthlyPage && (!car.pricing.daily || car.pricing.daily <= 0))) notFound()
  if (
    car.brandSlug !== p.slug ||
    car.modelSlug !== p.model ||
    (!monthlyPage && query.plan === 'monthly')
  ) {
    const q = new URLSearchParams()
    for (const k of ['start', 'end', 'location', 'colour', 'event'] as const)
      if (query[k]) q.set(k, query[k])
    permanentRedirect(
      (monthlyPage || query.plan === 'monthly' ? monthlyCarHref(car) : carHref(car)) +
        (q.size ? '?' + q.toString() : ''),
    )
  }
  const monthly = monthlyPage
  const displayedRate = monthly ? car.pricing.monthly : car.pricing.daily
  const previousRate = monthly ? car.pricing.monthlyWas : car.pricing.dailyWas
  const specs = [
    ['Category', car.bodyType],
    ['Model year', car.year],
    ['Seats', car.seats],
    ['Transmission', car.transmission],
    ['Drivetrain', car.drivetrain],
    ['Engine', car.specs.engine],
    ['Power', car.specs.horsepower ? car.specs.horsepower + ' hp' : null],
    ['0–100 km/h', car.specs.zeroToHundredKph ? car.specs.zeroToHundredKph + ' s' : null],
    ['Top speed', car.specs.topSpeedKph ? car.specs.topSpeedKph + ' km/h' : null],
    ['Exterior', car.exteriorColour],
    ['Interior', car.interiorColour],
  ].filter(([, v]) => v !== null && v !== undefined && v !== '')
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: car.name,
    brand: { '@type': 'Brand', name: car.brand },
    model: car.model,
    vehicleModelDate: car.year || undefined,
    image: car.images.map((i) => new URL(i.src, siteConfig.url).href),
    url: new URL(monthly ? monthlyCarHref(car) : carHref(car), siteConfig.url).href,
  }
  const nonce = (await headers()).get('x-nonce') || undefined
  return (
    <>
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <div className="container-lux z-detail">
        <div className="z-detail-grid">
          <CarGallery
            key={car.id + ':' + (query.colour || '')}
            car={car}
            initialColour={query.colour}
          />
          <dl className="z-specs z-vehicle-specs">
            {specs.map(([label, value]) => (
              <div key={String(label)}>
                <dt>
                  <T>{String(label)}</T>
                </dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <div className="z-detail-info">
            {monthly && (
              <p className="z-kicker z-vehicle-rental-label">
                <T>Monthly rental · 30 days</T>
              </p>
            )}
            <div className="z-vehicle-heading-row">
              <VehicleTitle name={car.name} />
              {car.bodyType && (
                <Link
                  className="z-vehicle-category"
                  href={'/categories/' + categorySlug(car.bodyType)}
                >
                  <T>{car.bodyType}</T>
                </Link>
              )}
            </div>
            <div className="z-detail-price">
              {previousRate && displayedRate && previousRate > displayedRate && (
                <del className="z-old-price">{<Price amount={previousRate} />}</del>
              )}
              <p className="z-price">
                {displayedRate ? <Price amount={displayedRate} /> : <T>Price on request</T>}
                <span>
                  <T> </T>
                  <T>{monthly ? '/ MONTH' : '/ DAY'}</T>
                </span>
              </p>
            </div>
            {monthly && car.pricing.daily && (
              <p className="z-note" style={{ marginBottom: 20 }}>
                <T>
                  30 days at 20% less than the daily rate. The crossed-out amount is the equivalent
                  of 30 daily rentals.
                </T>
              </p>
            )}
            <ReserveVehicle
              car={car}
              reservations={reservedDates()}
              {...query}
              plan={monthly ? 'monthly' : undefined}
            >
              <section className="z-enquiry-rates" aria-label="Rental rates">
                <dl className="z-enquiry-rate-grid">
                  {rentalPeriodRates(car.pricing).map(({ days, amount }) => (
                    <div key={days}>
                      <dt>
                        <T>{days === 1 ? '1 day' : `${days} days`}</T>
                      </dt>
                      <dd>
                        {amount !== null ? <Price amount={amount} /> : <T>Request a quote</T>}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            </ReserveVehicle>
          </div>
          {(monthly || !!car.pricing.daily) && (
            <p className="z-note z-vehicle-plan-link">
              <Link
                href={monthly ? '/monthly-luxury-car-rental' : monthlyCarHref(car)}
                className="z-text-link"
              >
                <T>{monthly ? 'Explore all monthly rentals' : 'View monthly rental offer'}</T>
              </Link>
            </p>
          )}
        </div>
        <section className="z-detail-section">
          <p className="z-note" style={{ marginTop: 15 }}>
            <T>
              Listed rental rates are subject to verification and a final quote. Mileage, deposit,
              delivery and other terms are confirmed before booking.
            </T>
          </p>
          {(car.mileage || car.deposit) && (
            <dl className="z-specs">
              {car.mileage && (
                <div>
                  <dt>
                    <T>Mileage</T>
                  </dt>
                  <dd>
                    <T>{car.mileage}</T>
                  </dd>
                </div>
              )}
              {car.deposit && (
                <div>
                  <dt>
                    <T>Deposit</T>
                  </dt>
                  <dd>
                    <T>{car.deposit}</T>
                  </dd>
                </div>
              )}
            </dl>
          )}
        </section>
        {car.features.length > 0 && (
          <section className="z-detail-section">
            <h2>
              <T>Vehicle features</T>
            </h2>
            <ul className="z-collection-links">
              {car.features.map((f) => (
                <li key={f}>
                  <T>{f}</T>
                </li>
              ))}
            </ul>
          </section>
        )}
        <section className="z-detail-section">
          <header className="z-section-heading">
            <div>
              <p className="z-kicker">
                <T>Related vehicles</T>
              </p>
              <h2>
                <T>Compare other cars</T>
              </h2>
            </div>
          </header>
          <div className="z-home-grid">
            {getRelatedCars(car)
              .filter((c) => !monthly || (c.pricing.daily !== null && c.pricing.daily > 0))
              .map((c) => (
                <CarCard key={c.id} car={c} period={monthly ? 'monthly' : 'daily'} />
              ))}
          </div>
        </section>
      </div>
    </>
  )
}

import { T, Price } from '@/components/RegionalProvider'
