'use client'

import { useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useRegional } from './RegionalProvider'
import Link from 'next/link'
import Image from 'next/image'
import type { Car } from '@/lib/types'
import { categorySlug } from '@/lib/catalogue'
import { warmCarPhoto } from '@/lib/warm-car-photo'
import CarCarousel from './CarCarousel'
import Icon from './Icon'

export default function HomeBrandBrowser({
  brands,
  cars,
}: {
  brands: { name: string; count: number; logo: string | null }[]
  cars: Car[]
}) {
  const { t } = useRegional()

  const [selected, setSelected] = useState(brands[0]?.name || '')
  const row = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const { language } = useRegional()
  const scrollBrands = (direction: number) => {
    if (row.current)
      row.current.scrollBy({
        left: direction * (language === 'ar' ? -1 : 1) * (row.current.clientWidth + 8),
        behavior: reducedMotion ? 'instant' : 'smooth',
      })
  }
  const matches = cars.filter((car) => car.brand === selected)
  const warmBrand = (brand: string) =>
    cars
      .filter((car) => car.brand === brand)
      .slice(0, 3)
      .forEach((car) =>
        warmCarPhoto(car, '(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw'),
      )
  if (!brands.length) return null

  return (
    <div className="z-home-brand-browser">
      <div className="z-home-brand-row">
        <button
          className="z-home-brand-scroll is-previous"
          type="button"
          aria-label={t('Scroll to previous brands')}
          onClick={() => scrollBrands(-1)}
        >
          <Icon name="arrow" size={18} />
        </button>
        <div className="z-home-brands" ref={row} role="group" aria-label={t('Choose a car brand')}>
          {brands.map((brand) => (
            <button
              type="button"
              key={brand.name}
              aria-pressed={selected === brand.name}
              aria-controls="homepage-brand-cars"
              onPointerEnter={() => warmBrand(brand.name)}
              onFocus={() => warmBrand(brand.name)}
              onClick={() => {
                warmBrand(brand.name)
                setSelected(brand.name)
              }}
            >
              {brand.logo && (
                <Image
                  className="z-home-brand-logo"
                  src={brand.logo}
                  width={112}
                  height={92}
                  alt=""
                />
              )}
              <span className="z-home-brand-name">
                <T>{brand.name}</T>
              </span>
            </button>
          ))}
        </div>
        <button
          className="z-home-brand-scroll"
          type="button"
          aria-label={t('Scroll to more brands')}
          onClick={() => scrollBrands(1)}
        >
          <Icon name="arrow" size={18} />
        </button>
      </div>
      <div
        className="z-home-brand-results"
        id="homepage-brand-cars"
        role="region"
        aria-label={`${selected} rental cars`}
      >
        <div className="z-home-brand-results-heading">
          <p role="status">
            <T>{selected}</T>
          </p>
          <Link href={'/brands/' + categorySlug(selected)} className="z-text-link">
            <T>View all </T>
            <T>{selected}</T> <Icon name="arrow" size={16} />
          </Link>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selected}
            className="z-brand-carousel-transition"
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : -4 }}
            transition={{ duration: reducedMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <CarCarousel cars={matches} label={selected + ' rental cars'} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

import { T } from '@/components/RegionalProvider'
