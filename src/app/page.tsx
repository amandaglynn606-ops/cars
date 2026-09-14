import Link from 'next/link'
import Image from 'next/image'
import Hero from '@/components/Hero'
import CarCard from '@/components/CarCard'
import Reveal from '@/components/Reveal'
import { getAllCars, getFeaturedCars, getBrands, getBodyTypes } from '@/lib/fleet'
import { siteConfig } from '@/lib/config'

const STEPS = [
  {
    n: '01',
    title: 'Choose your car',
    body: 'Browse the fleet and pick your model, colour and rental basis.',
  },
  {
    n: '02',
    title: 'Send the enquiry',
    body: 'One tap sends your dates, location and details straight to our WhatsApp.',
  },
  {
    n: '03',
    title: 'We confirm',
    body: 'A specialist replies with availability, final pricing and handover options.',
  },
  {
    n: '04',
    title: 'We deliver',
    body: 'Your car arrives at your hotel, residence or terminal, fully valeted.',
  },
]

const ASSURANCES = [
  { title: 'No deposit held', body: 'We never charge or block funds through this website.' },
  { title: 'Free delivery', body: 'Complimentary handover anywhere inside Dubai.' },
  { title: 'Fully insured', body: 'Comprehensive cover included on every rental.' },
  { title: '24/7 support', body: 'A real person on WhatsApp, day or night.' },
]

export default function HomePage() {
  const all = getAllCars()
  const featured = getFeaturedCars(6)
  const brands = getBrands()
  const bodyTypes = getBodyTypes().slice(0, 6)

  // A representative photo for each body-type tile.
  const tileImage = (type: string) =>
    all.find((c) => c.bodyType === type && c.images.length > 0)?.images[0].src

  return (
    <>
      <Hero cars={getFeaturedCars(4)} />

      {/* Assurances */}
      <section className="border-y border-white/8 bg-ink-900">
        <Reveal stagger className="container-lux grid gap-8 py-14 sm:grid-cols-2 lg:grid-cols-4">
          {ASSURANCES.map((item) => (
            <div key={item.title}>
              <p className="font-display text-lg">{item.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* Featured fleet */}
      <section className="container-lux py-24 md:py-32">
        <Reveal className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-4">The collection</p>
            <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.02]">
              Our most requested
            </h2>
          </div>
          <Link
            href="/fleet"
            className="rounded-full border border-white/20 px-7 py-3 text-xs tracking-[0.16em] uppercase transition-colors duration-300 hover:border-gold-500 hover:text-gold-500"
          >
            View all {all.length}
          </Link>
        </Reveal>

        <Reveal stagger className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((car) => (
            <CarCard key={car.slug} car={car} />
          ))}
        </Reveal>
      </section>

      {/* Body types */}
      <section className="border-t border-white/8 bg-ink-900 py-24 md:py-32">
        <div className="container-lux">
          <Reveal className="mb-14">
            <p className="eyebrow mb-4">Browse by</p>
            <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.02]">
              Every kind of drive
            </h2>
          </Reveal>

          <Reveal stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {bodyTypes.map((type) => {
              const image = tileImage(type.name)
              return (
                <Link
                  key={type.name}
                  href={`/fleet?type=${encodeURIComponent(type.name)}`}
                  className="group relative aspect-[16/10] overflow-hidden rounded-sm bg-ink-800"
                >
                  {image && (
                    <Image
                      src={image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover opacity-55 transition-all duration-[900ms] ease-[var(--ease-lux)] group-hover:scale-108 group-hover:opacity-75"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                    <p className="font-display text-2xl transition-colors group-hover:text-gold-500">
                      {type.name}
                    </p>
                    <p className="text-xs text-muted">{type.count} cars</p>
                  </div>
                </Link>
              )
            })}
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section className="container-lux py-24 md:py-32">
        <Reveal className="mb-16 max-w-2xl">
          <p className="eyebrow mb-4">How it works</p>
          <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.02]">
            Booked in a single message
          </h2>
          <p className="mt-5 leading-relaxed text-muted">
            No checkout, no card details, no waiting on email. Tell us what you want and we handle
            the rest over WhatsApp.
          </p>
        </Reveal>

        <Reveal stagger className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <div key={step.n} className="hairline pt-6">
              <p className="font-display text-4xl text-gold-500">{step.n}</p>
              <p className="mt-4 font-display text-xl">{step.title}</p>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">{step.body}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* Marques */}
      <section className="border-y border-white/8 bg-ink-900 py-20">
        <div className="container-lux">
          <Reveal className="mb-10 text-center">
            <p className="eyebrow">Marques in the fleet</p>
          </Reveal>
          <Reveal stagger className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
            {brands.map((brand) => (
              <Link
                key={brand.name}
                href={`/fleet?brand=${encodeURIComponent(brand.name)}`}
                className="font-display text-xl text-bone/45 transition-colors duration-300 hover:text-gold-500 md:text-2xl"
              >
                {brand.name}
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="container-lux py-28 text-center md:py-36">
        <Reveal>
          <p className="eyebrow mb-5">Ready when you are</p>
          <h2 className="font-display mx-auto max-w-3xl text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.02]">
            Your car is waiting in {siteConfig.locations[0]}
          </h2>
          <div className="mt-11 flex flex-wrap justify-center gap-4">
            <Link
              href="/book"
              className="rounded-full bg-gold-500 px-10 py-4 text-xs tracking-[0.18em] uppercase text-ink-950 transition-transform duration-300 hover:scale-[1.03]"
            >
              Start a booking
            </Link>
            <Link
              href="/fleet"
              className="rounded-full border border-bone/25 px-10 py-4 text-xs tracking-[0.18em] uppercase transition-colors duration-300 hover:border-gold-500 hover:text-gold-500"
            >
              Browse the fleet
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  )
}
