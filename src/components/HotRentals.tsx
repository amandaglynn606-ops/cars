'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { Car } from '@/lib/types'
import { carHref } from '@/lib/catalogue'
import { warmCarPhoto } from '@/lib/warm-car-photo'
import Icon from './Icon'

export default function HotRentals({ cars }: { cars: Car[] }) {
  const { t } = useRegional()

  const [selected, setSelected] = useState(cars[0]?.id)
  const reducedMotion = useReducedMotion()
  const car = cars.find((car) => car.id === selected) || cars[0]
  if (!car) return null
  return (
    <div className="z-hot-showcase">
      <div
        className="z-hot-stage"
        id="hot-rental-preview"
        role="region"
        aria-label={t('Selected hot rental')}
      >
        <div className="z-hot-photo">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={car.id}
              className="z-hot-photo-layer"
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.3, ease: 'easeInOut' }}
            >
              <Image
                src={car.featuredImage || car.images[0].src}
                alt={car.name}
                fill
                sizes="(max-width: 900px) 100vw, 65vw"
                loading="eager"
              />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="z-hot-details">
          <div className="z-hot-title" role="status">
            <div>
              <p className="z-kicker">
                <T>{car.brand}</T>
              </p>
              <h3>
                <T>{car.model}</T>
              </h3>
            </div>
            <div className="z-hot-specs">
              <span>
                <T>{car.bodyType}</T>
              </span>
              <span>
                <T>{[car.transmission, car.drivetrain].filter(Boolean).join(' · ')}</T>
              </span>
            </div>
          </div>
          <div className="z-hot-book">
            <p>
              {car.pricing.daily === null ? 'On request' : <Price amount={car.pricing.daily} />}
              <span>
                <T> </T>
                <T>/ day</T>
              </span>
            </p>
            <Link
              href={carHref(car)}
              className="z-button"
              aria-label={'View hot rental: ' + car.name}
            >
              <T>Explore this car </T>
              <Icon name="arrow" size={18} />
            </Link>
          </div>
        </div>
      </div>
      <div className="z-hot-lineup" role="group" aria-label={t('Choose a hot rental')}>
        <p className="z-kicker">
          <T>In the collection </T>
          <span>
            <T>{String(cars.length).padStart(2, '0')}</T> <T>cars</T>
          </span>
        </p>
        {cars.map((item, index) => (
          <article key={item.id} data-vehicle={item.id}>
            <button
              type="button"
              aria-label={'Preview ' + item.name}
              aria-pressed={car.id === item.id}
              aria-controls="hot-rental-preview"
              onPointerEnter={() => warmCarPhoto(item, '(max-width: 900px) 100vw, 65vw')}
              onFocus={() => warmCarPhoto(item, '(max-width: 900px) 100vw, 65vw')}
              onClick={() => {
                warmCarPhoto(item, '(max-width: 900px) 100vw, 65vw')
                setSelected(item.id)
              }}
            >
              <span className="z-hot-number">
                <T>{String(index + 1).padStart(2, '0')}</T>
              </span>
              <span className="z-hot-thumb">
                <Image src={item.featuredImage || item.images[0].src} alt="" fill sizes="100px" />
              </span>
              <span className="z-hot-choice">
                <span>
                  <T>{item.brand}</T>
                </span>
                <strong>
                  <T>{item.model}</T>
                </strong>
                <span>
                  {item.pricing.daily === null ? (
                    'On request'
                  ) : (
                    <Price amount={item.pricing.daily} />
                  )}
                  <T> </T>
                  <T>/ day</T>
                </span>
              </span>
              <Icon name="arrow" size={18} />
            </button>
          </article>
        ))}
      </div>
    </div>
  )
}

import { T, Price } from '@/components/RegionalProvider'

import { useRegional } from './RegionalProvider'
