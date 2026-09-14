import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import CarCard from '@/components/CarCard'
import CarGallery from '@/components/CarGallery'
import Reveal from '@/components/Reveal'
import { getAllCars, getCarBySlug, getRelatedCars } from '@/lib/fleet'
import { formatPrice } from '@/lib/format'
import { siteConfig } from '@/lib/config'

export const dynamicParams = false

export function generateStaticParams() {
  return getAllCars().map((car) => ({ slug: car.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const car = getCarBySlug(slug)
  if (!car) return { title: 'Car not found' }

  const rate = car.pricing.daily
    ? `from ${formatPrice(car.pricing.daily)} per day`
    : 'rates on request'

  return {
    title: `Rent ${car.name} in Dubai`,
    description: `Hire the ${car.name} in Dubai, ${rate}. Delivered to your hotel or residence, insurance included.`,
    openGraph: { images: car.images[0] ? [{ url: car.images[0].src }] : undefined },
  }
}

export default async function CarPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const car = getCarBySlug(slug)
  if (!car) notFound()

  const related = getRelatedCars(car)

  const specs = [
    car.specs.engine && { label: 'Engine', value: car.specs.engine },
    car.specs.horsepower && { label: 'Power', value: `${car.specs.horsepower} hp` },
    car.specs.torqueLbFt && { label: 'Torque', value: `${car.specs.torqueLbFt} lb-ft` },
    car.specs.zeroToHundredKph && {
      label: '0-100 km/h',
      value: `${car.specs.zeroToHundredKph}s`,
    },
    car.specs.topSpeedKph && { label: 'Top speed', value: `${car.specs.topSpeedKph} km/h` },
    car.bodyType && { label: 'Body', value: car.bodyType },
  ].filter(Boolean) as { label: string; value: string }[]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: car.name,
    image: car.images.map((i) => i.src),
    description: car.description.slice(0, 300),
    brand: car.brand ? { '@type': 'Brand', name: car.brand } : undefined,
    offers: car.pricing.daily
      ? {
          '@type': 'Offer',
          price: car.pricing.daily,
          priceCurrency: car.pricing.currency,
          availability: 'https://schema.org/InStock',
          url: `${siteConfig.url}/fleet/${car.slug}`,
        }
      : undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-lux pt-32 pb-24 md:pt-40">
        <nav className="mb-8 flex items-center gap-2 text-xs text-muted">
          <Link href="/fleet" className="transition-colors hover:text-gold-500">
            Fleet
          </Link>
          <span aria-hidden>/</span>
          {car.brand && (
            <>
              <Link
                href={`/fleet?brand=${encodeURIComponent(car.brand)}`}
                className="transition-colors hover:text-gold-500"
              >
                {car.brand}
              </Link>
              <span aria-hidden>/</span>
            </>
          )}
          <span className="text-bone/75">{car.name}</span>
        </nav>

        <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <CarGallery car={car} />

          <div className="lg:sticky lg:top-28 lg:self-start">
            {car.brand && <p className="eyebrow mb-4">{car.brand}</p>}
            <h1 className="font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1]">
              {car.name}
            </h1>

            {/* Pricing */}
            <div className="hairline mt-8 flex flex-wrap gap-10 pt-7">
              {car.pricing.daily && (
                <div>
                  <p className="eyebrow mb-2">Per day</p>
                  {car.pricing.dailyWas && (
                    <p className="text-xs text-muted line-through">
                      {formatPrice(car.pricing.dailyWas, car.pricing.currency)}
                    </p>
                  )}
                  <p className="font-display text-3xl text-gold-500">
                    {formatPrice(car.pricing.daily, car.pricing.currency)}
                  </p>
                </div>
              )}
              {car.pricing.monthly && (
                <div>
                  <p className="eyebrow mb-2">Per month</p>
                  {car.pricing.monthlyWas && (
                    <p className="text-xs text-muted line-through">
                      {formatPrice(car.pricing.monthlyWas, car.pricing.currency)}
                    </p>
                  )}
                  <p className="font-display text-3xl">
                    {formatPrice(car.pricing.monthly, car.pricing.currency)}
                  </p>
                </div>
              )}
              {!car.pricing.daily && !car.pricing.monthly && (
                <p className="text-muted">Rates on request.</p>
              )}
            </div>

            {specs.length > 0 && (
              <dl className="hairline mt-7 grid grid-cols-2 gap-x-8 gap-y-5 pt-7">
                {specs.map((spec) => (
                  <div key={spec.label}>
                    <dt className="eyebrow mb-1.5">{spec.label}</dt>
                    <dd className="text-sm text-bone/85">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href={`/book?car=${car.slug}`}
                className="rounded-full bg-gold-500 px-9 py-4 text-xs tracking-[0.18em] uppercase text-ink-950 transition-transform duration-300 hover:scale-[1.03]"
              >
                Reserve this car
              </Link>
              <Link
                href="/fleet"
                className="rounded-full border border-bone/25 px-9 py-4 text-xs tracking-[0.18em] uppercase transition-colors duration-300 hover:border-gold-500 hover:text-gold-500"
              >
                Back to fleet
              </Link>
            </div>

            <p className="mt-6 text-xs leading-relaxed text-muted">
              No payment is taken online. Send your enquiry and a specialist confirms availability,
              deposit and mileage terms on WhatsApp.
            </p>
          </div>
        </div>

        {car.description && (
          <Reveal className="mt-24 max-w-3xl">
            <p className="eyebrow mb-5">About this car</p>
            <p className="leading-[1.85] text-bone/75">{car.description}</p>
          </Reveal>
        )}

        {related.length > 0 && (
          <section className="mt-28">
            <Reveal className="mb-10">
              <p className="eyebrow mb-4">You may also like</p>
              <h2 className="font-display text-[clamp(1.75rem,4vw,2.75rem)]">Similar vehicles</h2>
            </Reveal>
            <Reveal stagger className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <CarCard key={item.slug} car={item} />
              ))}
            </Reveal>
          </section>
        )}
      </div>
    </>
  )
}
