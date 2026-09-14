'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import type { Car, RentalPeriod } from '@/lib/types'
import { formatPrice } from '@/lib/format'
import { rateFor } from '@/lib/fleet'

const COLOUR_SWATCHES: Record<string, string> = {
  black: '#101012',
  white: '#f2f2f0',
  grey: '#8a8a90',
  gray: '#8a8a90',
  silver: '#c9c9cd',
  red: '#b5232b',
  blue: '#1f3f80',
  'light-blue': '#7fb2d8',
  'dark-blue': '#16294f',
  green: '#1f5136',
  'light-green': '#8fbf6a',
  yellow: '#e0b526',
  orange: '#d2711f',
  gold: '#c2a054',
  brown: '#5c4433',
  beige: '#cfbfa4',
  purple: '#54306b',
  pink: '#c86a92',
}

export const swatchFor = (slug: string) => COLOUR_SWATCHES[slug] ?? '#55555c'

export default function CarCard({
  car,
  period = 'daily',
  priority = false,
}: {
  car: Car
  period?: RentalPeriod
  priority?: boolean
}) {
  const [hovered, setHovered] = useState(false)

  const rate = rateFor(car, period)
  // rateFor falls back to the other period, so label what is actually shown.
  const shownPeriod: RentalPeriod = car.pricing[period] != null ? period : period === 'daily' ? 'monthly' : 'daily'
  const wasRate = shownPeriod === 'daily' ? car.pricing.dailyWas : car.pricing.monthlyWas

  // Second photo becomes the hover state when the car has one.
  const primary = car.images[0]
  const secondary = car.images[1] ?? primary

  return (
    <Link
      href={`/fleet/${car.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative block overflow-hidden rounded-sm bg-ink-900"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={primary.src}
          alt={car.name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-all duration-[900ms] ease-[var(--ease-lux)] group-hover:scale-107"
          style={{ opacity: hovered && secondary !== primary ? 0 : 1 }}
        />
        {secondary !== primary && (
          <Image
            src={secondary.src}
            alt=""
            aria-hidden
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-all duration-[900ms] ease-[var(--ease-lux)] group-hover:scale-107"
            style={{ opacity: hovered ? 1 : 0 }}
          />
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/15 to-transparent" />

        {wasRate && (
          <span className="absolute top-4 left-4 rounded-full bg-gold-500 px-3 py-1 text-[10px] tracking-[0.16em] uppercase text-ink-950">
            Offer
          </span>
        )}

        {car.bodyType && (
          <span className="absolute top-4 right-4 rounded-full border border-white/20 bg-ink-950/55 px-3 py-1 text-[10px] tracking-[0.16em] uppercase text-bone/85 backdrop-blur-sm">
            {car.bodyType}
          </span>
        )}
      </div>

      <div className="relative p-6">
        {car.brand && <p className="eyebrow mb-2">{car.brand}</p>}

        <h3 className="font-display text-2xl leading-tight transition-colors duration-300 group-hover:text-gold-500">
          {car.name}
        </h3>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted">
          {car.specs.horsepower && <span>{car.specs.horsepower} hp</span>}
          {car.specs.zeroToHundredKph && <span>0&ndash;100 in {car.specs.zeroToHundredKph}s</span>}
          {car.specs.topSpeedKph && <span>{car.specs.topSpeedKph} km/h</span>}
        </div>

        {car.colors.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            {car.colors.slice(0, 5).map((colour) => (
              <span
                key={colour.slug}
                title={colour.name}
                className="h-3.5 w-3.5 rounded-full border border-white/25"
                style={{ background: swatchFor(colour.slug) }}
              />
            ))}
            {car.colors.length > 5 && (
              <span className="text-[10px] text-muted">+{car.colors.length - 5}</span>
            )}
          </div>
        )}

        <div className="hairline mt-5 flex items-end justify-between pt-5">
          <div>
            {rate == null ? (
              <p className="text-sm text-muted">Price on request</p>
            ) : (
              <>
                {wasRate && (
                  <p className="text-xs text-muted line-through">
                    {formatPrice(wasRate, car.pricing.currency)}
                  </p>
                )}
                <p className="font-display text-xl">
                  {formatPrice(rate, car.pricing.currency)}
                  <span className="ml-1 text-xs text-muted">
                    / {shownPeriod === 'monthly' ? 'month' : 'day'}
                  </span>
                </p>
              </>
            )}
          </div>

          <span className="text-[10px] tracking-[0.16em] uppercase text-gold-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            View &rarr;
          </span>
        </div>
      </div>
    </Link>
  )
}
