'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import CarCard from './CarCard'
import { filterCars, priceBounds, categorySlug, type FleetFilters } from '@/lib/fleet'
import { formatPrice } from '@/lib/format'
import type { Car, RentalPeriod } from '@/lib/types'

const SORTS: { value: NonNullable<FleetFilters['sort']>; label: string }[] = [
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'power', label: 'Most powerful' },
  { value: 'name', label: 'A to Z' },
]

const PAGE = 12

export default function FleetBrowser({
  cars,
  brands,
  bodyTypes,
  lockedBrand,
  lockedBodyType,
}: {
  cars: Car[]
  brands: { name: string; count: number }[]
  bodyTypes: { name: string; count: number }[]
  /** When set, this category is fixed and its filter row is hidden. */
  lockedBrand?: string
  lockedBodyType?: string
}) {
  const [brand, setBrand] = useState('')
  const [bodyType, setBodyType] = useState('')
  const [period, setPeriod] = useState<RentalPeriod>('daily')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<NonNullable<FleetFilters['sort']>>('price-desc')
  const [maxPrice, setMaxPrice] = useState<number | null>(null)
  const [visible, setVisible] = useState(PAGE)

  // Bounds follow the rental basis, so the slider is meaningful in both modes.
  const bounds = useMemo(() => priceBounds(cars, period), [cars, period])

  const results = useMemo(
    () =>
      filterCars(cars, {
        brand: lockedBrand ?? brand ?? undefined,
        bodyType: lockedBodyType ?? bodyType ?? undefined,
        period,
        search,
        sort,
        maxPrice: maxPrice ?? undefined,
      }),
    [cars, lockedBrand, brand, lockedBodyType, bodyType, period, search, sort, maxPrice],
  )

  const shown = results.slice(0, visible)
  const dirty = brand || bodyType || search || maxPrice != null

  const reset = () => {
    setBrand('')
    setBodyType('')
    setSearch('')
    setMaxPrice(null)
    setVisible(PAGE)
  }

  const bump = <T,>(setter: (v: T) => void) => (value: T) => {
    setter(value)
    setVisible(PAGE)
  }

  const chip = (selected: boolean) =>
    `rounded-full border px-4 py-2 text-xs tracking-wide transition-colors duration-300 ${
      selected
        ? 'border-gold-500 bg-gold-500 text-ink-950'
        : 'border-white/12 text-bone/65 hover:border-white/35 hover:text-bone'
    }`

  const fieldCls =
    'rounded-full border border-white/12 bg-ink-850 px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-faint focus:border-gold-500'

  return (
    <div>
      {/* Sticky control bar - stays reachable while scrolling a long grid */}
      <div className="sticky top-[4.5rem] z-30 -mx-6 mb-8 bg-ink-950/85 px-6 py-4 backdrop-blur-xl md:-mx-10 md:px-10">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <input
            value={search}
            onChange={(e) => bump(setSearch)(e.target.value)}
            placeholder="Search model or marque..."
            aria-label="Search the fleet"
            className={`${fieldCls} w-full lg:max-w-64`}
          />

          <div className="flex items-center gap-2">
            {(['daily', 'monthly'] as RentalPeriod[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setPeriod(p)
                  setMaxPrice(null)
                  setVisible(PAGE)
                }}
                className={chip(period === p)}
              >
                {p === 'daily' ? 'Per day' : 'Per month'}
              </button>
            ))}
          </div>

          {bounds && bounds.min < bounds.max && (
            <label className="flex flex-1 items-center gap-3 text-xs text-muted">
              <span className="shrink-0">Up to</span>
              <input
                type="range"
                min={bounds.min}
                max={bounds.max}
                step={Math.max(1, Math.round((bounds.max - bounds.min) / 60))}
                value={maxPrice ?? bounds.max}
                onChange={(e) => bump(setMaxPrice)(Number(e.target.value))}
                aria-label={`Maximum ${period === 'daily' ? 'daily' : 'monthly'} rate`}
                className="h-1 w-full min-w-28 cursor-pointer appearance-none rounded-full bg-ink-600 accent-gold-500"
              />
              <span className="w-24 shrink-0 text-right font-medium text-bone">
                {formatPrice(maxPrice ?? bounds.max)}
              </span>
            </label>
          )}

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as NonNullable<FleetFilters['sort']>)}
            aria-label="Sort results"
            className={`${fieldCls} lg:ml-auto`}
          >
            {SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category rows - hidden for whichever dimension this page has locked */}
      <div className="mb-8 space-y-3">
        {!lockedBrand && (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => bump(setBrand)('')} className={chip(!brand)}>
              All marques
            </button>
            {brands.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => bump(setBrand)(item.name === brand ? '' : item.name)}
                className={chip(brand === item.name)}
              >
                {item.name}
                <span className="ml-1.5 opacity-55">{item.count}</span>
              </button>
            ))}
          </div>
        )}

        {!lockedBodyType && (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => bump(setBodyType)('')} className={chip(!bodyType)}>
              All types
            </button>
            {bodyTypes.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => bump(setBodyType)(item.name === bodyType ? '' : item.name)}
                className={chip(bodyType === item.name)}
              >
                {item.name}
                <span className="ml-1.5 opacity-55">{item.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Inside a locked category, offer the sibling categories as links */}
        {lockedBrand && (
          <div className="flex flex-wrap gap-2">
            <Link href="/fleet" className={chip(false)}>
              All marques
            </Link>
            {brands.map((item) => (
              <Link
                key={item.name}
                href={`/fleet/brand/${categorySlug(item.name)}`}
                className={chip(item.name === lockedBrand)}
              >
                {item.name}
                <span className="ml-1.5 opacity-55">{item.count}</span>
              </Link>
            ))}
          </div>
        )}

        {lockedBodyType && (
          <div className="flex flex-wrap gap-2">
            <Link href="/fleet" className={chip(false)}>
              All types
            </Link>
            {bodyTypes.map((item) => (
              <Link
                key={item.name}
                href={`/fleet/type/${categorySlug(item.name)}`}
                className={chip(item.name === lockedBodyType)}
              >
                {item.name}
                <span className="ml-1.5 opacity-55">{item.count}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="hairline mb-8 flex items-center justify-between pt-5 text-sm text-muted">
        <p>
          {results.length} {results.length === 1 ? 'vehicle' : 'vehicles'}
        </p>
        {dirty && (
          <button type="button" onClick={reset} className="link-sweep text-gold-500">
            Clear filters
          </button>
        )}
      </div>

      {shown.length === 0 ? (
        <div className="py-28 text-center">
          <p className="font-display display-md">Nothing matches that</p>
          <p className="mt-4 text-sm text-muted">
            Try a different marque, type, or widen the price range.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-8 rounded-full border border-gold-500/45 px-8 py-3.5 text-[0.7rem] tracking-[0.16em] uppercase text-gold-500 transition-colors hover:bg-gold-500 hover:text-ink-950"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((car, i) => (
              <CarCard key={car.slug} car={car} period={period} priority={i < 3} />
            ))}
          </div>

          {visible < results.length && (
            <div className="mt-16 text-center">
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE)}
                className="rounded-full border border-white/20 px-9 py-4 text-[0.7rem] tracking-[0.16em] uppercase transition-colors duration-300 hover:border-gold-500 hover:text-gold-500"
              >
                Load more ({results.length - visible} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
