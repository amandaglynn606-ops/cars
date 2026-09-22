'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import type { Car, RentalPeriod } from '@/lib/types'
import { carHref, monthlyCarHref } from '@/lib/catalogue'
import Icon from './Icon'
import { useRegional } from './RegionalProvider'
import { photographedColours, colourPreview, colourSwatch } from '@/lib/image-variants'
import { buildQuickChatUrl } from '@/lib/whatsapp'
import WhatsappIcon from './WhatsappIcon'
export const swatchFor = (s: string) =>
  ({
    black: '#151515',
    white: '#efefef',
    gray: '#8c8c8c',
    grey: '#8c8c8c',
    yellow: '#dfbc29',
    red: '#a82222',
    blue: '#26405c',
    green: '#345544',
    orange: '#d47b30',
    silver: '#a5a5a5',
    'light-green': '#9dca3a',
    'light-blue': '#91acbc',
  })[s] || '#75604e'
export default function CarCard({
  car,
  period = 'daily',
  index = 0,
  query = '',
  initialColour = '',
  eager = false,
}: {
  car: Car
  period?: RentalPeriod
  index?: number
  query?: string
  initialColour?: string
  eager?: boolean
}) {
  const { t } = useRegional()
  const [colour, setColour] = useState(initialColour)
  const colours = photographedColours(car)
  const href =
    (period === 'monthly' ? monthlyCarHref(car) : carHref(car)) +
    query +
    (colour ? (query ? '&' : '?') + 'colour=' + encodeURIComponent(colour) : '')
  const photo = colourPreview(car, colour).image?.src
  const was = car.pricing[period === 'daily' ? 'dailyWas' : 'monthlyWas']
  const price = car.pricing[period]
  return (
    <article className="z-car-card" data-vehicle={car.id}>
      <div className="z-car-image">
        <Link href={href} aria-label={'View ' + car.name}>
          {photo && (
            <Image
              src={photo}
              alt={car.name + (colour ? ' in ' + colours.find((c) => c.slug === colour)?.name : '')}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="z-car-photo"
              loading={eager ? 'eager' : 'lazy'}
            />
          )}
        </Link>
      </div>
      <div className="z-car-content">
        <div className="z-car-heading">
          <div className="z-car-title">
            <p className="z-kicker">
              <T>{car.brand}</T>
            </p>
            <h3>
              <Link href={href}>
                <T>{car.model}</T>
              </Link>
            </h3>
          </div>
          <Link href={href} className="z-car-link" aria-label={'View vehicle: ' + car.name}>
            <T>View vehicle </T>
            <Icon name="arrow" size={17} />
          </Link>
        </div>
        <div className="z-car-bottom">
          {colours.length > 1 ? (
            <div className="z-card-colours" aria-label={car.name + ' photo colours'}>
              {colours.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  aria-label={'Show ' + c.name + ' ' + car.name}
                  aria-pressed={colour === c.slug}
                  onClick={() => setColour(c.slug)}
                  title={c.name}
                >
                  <span className="z-colour-dot" style={{ background: colourSwatch(c.slug) }} />
                </button>
              ))}
              <span className="sr-only">
                <T>
                  {colour
                    ? colours.find((c) => c.slug === colour)?.name
                    : colours.length + ' colours'}
                </T>
              </span>
            </div>
          ) : (
            <div className="z-card-colours z-card-colours-spacer" aria-hidden="true" />
          )}
          <div className="z-card-price">
            {period === 'monthly' && car.pricing.daily !== null && car.pricing.daily > 0 && (
              <p className="z-monthly-saving">
                <T>20% off · 30-day rental</T>
              </p>
            )}
            {was !== null && price !== null && was > price && (
              <del
                className="z-old-price"
                aria-label={period === 'monthly' ? t('30 days at the daily rate') : undefined}
              >
                {<Price amount={was} />}
              </del>
            )}
            <p className="z-price">
              {price !== null ? <Price amount={price} /> : <T>On request</T>}
              <span>
                <T> </T>/ <T>{period === 'daily' ? 'day' : 'month'}</T>
              </span>
            </p>
          </div>
        </div>
      </div>
      <a
        href={buildQuickChatUrl(car, period, colours.find((item) => item.slug === colour)?.name)}
        target="_blank"
        rel="noopener noreferrer"
        className="z-car-whatsapp"
        aria-label={t('Enquire on WhatsApp') + ': ' + car.name}
      >
        <WhatsappIcon size={20} />
        <T>WhatsApp</T>
        <Icon name="arrow" size={16} />
      </a>
    </article>
  )
}

import { T, Price } from '@/components/RegionalProvider'
