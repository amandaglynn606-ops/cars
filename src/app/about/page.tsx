import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Reveal from '@/components/Reveal'
import { getAllCars, getBrands, getFeaturedCars } from '@/lib/fleet'
import { siteConfig } from '@/lib/config'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'A Dubai-based luxury and supercar rental company, delivering across the Emirates with no online payments and no hidden fees.',
}

export default function AboutPage() {
  const cars = getAllCars()
  const brands = getBrands()
  const hero = getFeaturedCars(1)[0]

  const stats = [
    { value: `${cars.length}+`, label: 'Vehicles in the fleet' },
    { value: `${brands.length}`, label: 'Marques represented' },
    { value: '24/7', label: 'WhatsApp support' },
    { value: '0', label: 'Online payments taken' },
  ]

  return (
    <div className="pt-36 pb-24 md:pt-44">
      <div className="container-lux">
        <header className="mb-16 max-w-3xl">
          <p className="eyebrow mb-4">Who we are</p>
          <h1 className="font-display text-[clamp(2.5rem,7vw,5rem)] leading-[0.98]">
            Dubai&rsquo;s fleet, without the friction
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-bone/75">
            We rent supercars and luxury vehicles to residents and visitors across the Emirates.
            No checkout flows, no deposits taken by a website you have never used before &mdash;
            just a real conversation with someone who knows the cars.
          </p>
        </header>

        {hero && (
          <Reveal className="relative mb-20 aspect-[21/9] overflow-hidden rounded-sm">
            <Image
              src={hero.images[0].src}
              alt=""
              fill
              sizes="100vw"
              className="object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 to-transparent" />
          </Reveal>
        )}

        <Reveal stagger className="grid gap-10 border-y border-white/10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-5xl text-gold-500">{stat.value}</p>
              <p className="mt-2.5 text-sm text-muted">{stat.label}</p>
            </div>
          ))}
        </Reveal>

        <div className="mt-24 grid gap-14 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow mb-4">How we work</p>
            <h2 className="font-display text-[clamp(1.85rem,4vw,2.75rem)] leading-[1.05]">
              One message, one specialist
            </h2>
          </Reveal>
          <Reveal className="space-y-5 leading-[1.85] text-bone/75">
            <p>
              Every enquiry that leaves this site arrives on our WhatsApp complete &mdash; the car,
              the colour, your dates, your delivery address and any notes you left. Nobody has to
              call you back to ask what you meant.
            </p>
            <p>
              From there a specialist confirms availability, walks you through the deposit and
              mileage terms, and arranges handover at your hotel, residence or terminal. Insurance
              is included on every rental, and delivery inside{' '}
              {siteConfig.locations[0].split(' ')[0]} is complimentary.
            </p>
            <p>
              We hold no card details and take no payment online. That is deliberate: it keeps your
              details with you until you have spoken to a person.
            </p>
          </Reveal>
        </div>

        <Reveal className="mt-24 text-center">
          <Link
            href="/fleet"
            className="inline-block rounded-full border border-gold-500/45 px-10 py-4 text-xs tracking-[0.18em] uppercase text-gold-500 transition-colors duration-300 hover:bg-gold-500 hover:text-ink-950"
          >
            See the fleet
          </Link>
        </Reveal>
      </div>
    </div>
  )
}
