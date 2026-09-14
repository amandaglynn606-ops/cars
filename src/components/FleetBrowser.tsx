'use client'

import { useMemo, useState } from 'react'
import CarCard from './CarCard'
import { filterCars, type FleetFilters } from '@/lib/fleet'
import type { Car, RentalPeriod } from '@/lib/types'

const SORTS: { value: NonNullable<FleetFilters['sort']>; label: string }[] = [
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'power', label: 'Most powerful' },
  { value: 'name', label: 'A to Z' },
]

export default function FleetBrowser({
  cars,
  brands,
  bodyTypes,
  initialBrand = '',
  initialBodyType = '',
}: {
  cars: Car[]
  brands: { name: string; count: number }[]
  bodyTypes: { name: string; count: number }[]
  initialBrand?: string
  initialBodyType?: string
}) {
  const [brand, setBrand] = useState(initialBrand)
  const [bodyType, setBodyType] = useState(initialBodyType)
  const [period, setPeriod] = useState<RentalPeriod>('daily')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<NonNullable<FleetFilters['sort']>>('price-desc')
  const [visible, setVisible] = useState(12)

  const results = useMemo(
    () => filterCars(cars, { brand: brand || undefined, bodyType: bodyType || undefined, period, search, sort }),
    [cars, brand, bodyType, period, search, sort],
  )

  const shown = results.slice(0, visible)
  const active = brand || bodyType || search

  const reset = () => {
    setBrand('')
    setBodyType('')
    setSearch('')
    setVisible(12)
  }

  const chip = (selected: boolean) =>
    `rounded-full border px-4 py-2 text-xs tracking-wide transition-colors duration-300 ${
      selected
        ? 'border-gold-500 bg-gold-500 text-ink-950'
        : 'border-white/15 text-bone/70 hover:border-white/40 hover:text-bone'
    }`

  return (
    <div>
      {/* Controls */}
      <div className="mb-10 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setVisible(12)
            }}
            placeholder="Search by model, marque or type&hellip;"
            aria-label="Search the fleet"
            className="w-full rounded-sm border border-white/15 bg-ink-800 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted focus:border-gold-500 sm:max-w-xs"
          />

          <div className="flex items-center gap-2">
            {(['daily', 'monthly'] as RentalPeriod[]).map((p) => (
              <button key={p} type="button" onClick={() => setPeriod(p)} className={chip(period === p)}>
                {p === 'daily' ? 'Per day' : 'Per month'}
              </button>
            ))}
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as NonNullable<FleetFilters['sort']>)}
            aria-label="Sort results"
            className="rounded-sm border border-white/15 bg-ink-800 px-4 py-3 text-sm outline-none focus:border-gold-500 sm:ml-auto"
          >
            {SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setBrand('')} className={chip(!brand)}>
            All marques
          </button>
          {brands.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => {
                setBrand(item.name === brand ? '' : item.name)
                setVisible(12)
              }}
              className={chip(brand === item.name)}
            >
              {item.name}
              <span className="ml-1.5 opacity-55">{item.count}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setBodyType('')} className={chip(!bodyType)}>
            All types
          </button>
          {bodyTypes.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => {
                setBodyType(item.name === bodyType ? '' : item.name)
                setVisible(12)
              }}
              className={chip(bodyType === item.name)}
            >
              {item.name}
              <span className="ml-1.5 opacity-55">{item.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="hairline mb-8 flex items-center justify-between pt-6 text-sm text-muted">
        <p>
          {results.length} {results.length === 1 ? 'vehicle' : 'vehicles'}
        </p>
        {active && (
          <button type="button" onClick={reset} className="text-gold-500 hover:underline">
            Clear filters
          </button>
        )}
      </div>

      {shown.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-display text-3xl">Nothing matches that</p>
          <p className="mt-3 text-sm text-muted">Try a different marque, type or search term.</p>
          <button
            type="button"
            onClick={reset}
            className="mt-7 rounded-full border border-gold-500/45 px-7 py-3 text-xs tracking-[0.16em] uppercase text-gold-500 transition-colors hover:bg-gold-500 hover:text-ink-950"
          >
            Reset
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((car, i) => (
              <CarCard key={car.slug} car={car} period={period} priority={i < 3} />
            ))}
          </div>

          {visible < results.length && (
            <div className="mt-14 text-center">
              <button
                type="button"
                onClick={() => setVisible((v) => v + 12)}
                className="rounded-full border border-white/20 px-9 py-4 text-xs tracking-[0.18em] uppercase transition-colors duration-300 hover:border-gold-500 hover:text-gold-500"
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
