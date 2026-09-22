'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import type { Car, RentalPeriod } from '@/lib/types'
import {
  emptyFilters,
  filterCars,
  priceBounds,
  fleetFacets,
  readFleetFilters,
  fleetFilterParams,
  filterErrors,
  type FleetFilters,
} from '@/lib/catalogue'
import CarCard from './CarCard'
import Icon from './Icon'
import { useRegional } from './RegionalProvider'
type MultiKey = 'categories' | 'brands' | 'models' | 'seats'
const labels: Record<MultiKey, string> = {
  categories: 'Category',
  brands: 'Brand',
  models: 'Model',
  seats: 'Seats',
}
const multiKeys = Object.keys(labels) as MultiKey[]
export default function FleetBrowser({
  cars,
  lockedBrand,
  lockedBodyType,
  period = 'daily',
}: {
  cars: Car[]
  period?: RentalPeriod
  lockedBrand?: string
  lockedBodyType?: string
  brands?: { name: string; count: number }[]
  bodyTypes?: { name: string; count: number }[]
}) {
  const pathname = usePathname()
  const { t, currency, rate, money } = useRegional()
  const displayPrice = (value: string) =>
    value === '' ? '' : String(Math.round(Number(value) * rate * 100) / 100)
  const basePrice = (value: string) => (value === '' ? '' : String(Number(value) / rate))
  const searchParams = useSearchParams()
  const initial: FleetFilters = {
    ...emptyFilters,
    brands: lockedBrand ? [lockedBrand] : [],
    categories: lockedBodyType ? [lockedBodyType] : [],
  }
  const filters = useMemo(
    () =>
      readFleetFilters(new URLSearchParams(searchParams.toString()), lockedBrand, lockedBodyType),
    [searchParams, lockedBrand, lockedBodyType],
  )
  const setFilters = (value: FleetFilters | ((previous: FleetFilters) => FleetFilters)) => {
    const next = typeof value === 'function' ? value(filters) : value
    const params = fleetFilterParams(next)
    window.history.replaceState(null, '', pathname + (params.size ? '?' + params.toString() : ''))
  }
  const [draft, setDraft] = useState<FleetFilters>(initial)
  const [open, setOpen] = useState(false),
    [visible, setVisible] = useState(12)
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    setVisible(12)
  }, [filters])
  useEffect(() => {
    if (open) {
      dialog.current?.showModal()
      document.body.style.overflow = 'hidden'
    } else {
      dialog.current?.close()
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])
  const facets = useMemo(() => fleetFacets(cars, filters, period), [cars, filters, period])
  const draftFacets = useMemo(() => fleetFacets(cars, draft, period), [cars, draft, period])
  const found = useMemo(() => filterCars(cars, filters, period), [cars, filters, period])
  const bounds = priceBounds(cars, period)
  const set = <K extends keyof FleetFilters>(key: K, value: FleetFilters[K]) =>
    setFilters((f) => ({ ...f, [key]: value }))
  const clear = () => setFilters({ ...initial })
  const isLocked = (k: MultiKey) =>
    (k === 'brands' && !!lockedBrand) || (k === 'categories' && !!lockedBodyType)
  const active = multiKeys
    .flatMap((k) =>
      filters[k].map((v) => ({
        key: k,
        value: v,
        label: v,
      })),
    )
    .filter((c) => !isLocked(c.key))
  const activeCount =
    active.length +
    ['search', 'minPrice', 'maxPrice'].filter((k) => filters[k as keyof FleetFilters]).length
  function filterPanel(state: FleetFilters, update: (f: FleetFilters) => void, mobile = false) {
    const options = mobile ? draftFacets : facets
    const toggle = (k: MultiKey, v: string) =>
      update({
        ...state,
        [k]: state[k].includes(v) ? state[k].filter((x) => x !== v) : [...state[k], v],
      })
    return (
      <div className="z-filter-fields">
        {multiKeys
          .filter((k) => !isLocked(k) && (options[k].length > 0 || k === 'models'))
          .map((k) => (
            <details
              key={k}
              open={['categories', 'brands', 'models'].includes(k)}
              className="z-filter-group"
            >
              <summary>
                <T>{labels[k]}</T>
                <span>{state[k].length || '+'}</span>
              </summary>
              <div className="z-filter-options">
                {options[k].length ? (
                  options[k].map(({ value: v, count }) => (
                    <label key={v}>
                      <input
                        type="checkbox"
                        checked={state[k].includes(v)}
                        disabled={count === 0 && !state[k].includes(v)}
                        onChange={() => toggle(k, v)}
                      />
                      <span>
                        <T>{t(v)}</T>
                      </span>
                      <small aria-hidden="true">{count}</small>
                    </label>
                  ))
                ) : (
                  <p className="z-note">
                    <T>No recorded options.</T>
                  </p>
                )}
              </div>
            </details>
          ))}
        <fieldset className="z-filter-group z-price-filter">
          <legend>
            <T>{period === 'monthly' ? 'Price / 30 days' : 'Price / day'}</T>
          </legend>
          <div className="z-two-fields">
            <label>
              <T>Min</T> <T>{currency}</T>
              <input
                type="number"
                min="0"
                step="any"
                max={bounds ? Number(displayPrice(String(bounds.max))) : undefined}
                placeholder={displayPrice(String(bounds?.min || 0))}
                value={displayPrice(state.minPrice)}
                onChange={(e) => update({ ...state, minPrice: basePrice(e.target.value) })}
              />
            </label>
            <label>
              <T>Max</T> <T>{currency}</T>
              <input
                type="number"
                min="0"
                step="any"
                placeholder={displayPrice(String(bounds?.max || 14000))}
                value={displayPrice(state.maxPrice)}
                onChange={(e) => update({ ...state, maxPrice: basePrice(e.target.value) })}
              />
            </label>
          </div>
        </fieldset>
        {filterErrors(state).map((error) => (
          <p className="z-error" role="alert" key={error}>
            <T>{error}</T>
          </p>
        ))}
        {!mobile && (
          <button className="z-clear" onClick={clear}>
            <T>Clear all filters </T>
            <Icon name="close" size={14} />
          </button>
        )}
      </div>
    )
  }
  return (
    <div className="z-fleet-browser">
      <div className="z-fleet-layout">
        <aside className="z-sidebar" aria-label={t('Filter fleet')}>
          <div className="z-sidebar-title">
            <Icon name="filter" />
            <h2>
              <T>Filter fleet</T>
            </h2>
          </div>
          {filterPanel(filters, setFilters)}
        </aside>
        <div className="z-fleet-results">
          <div className="z-results-toolbar">
            <button
              className="z-mobile-filter z-button z-button-outline"
              onClick={() => {
                setDraft(structuredClone(filters))
                setOpen(true)
              }}
            >
              <Icon name="filter" size={17} />
              <T>Filter </T>
              {activeCount > 0 && '(' + activeCount + ')'}
            </button>
            <p className="z-result-count" role="status" aria-live="polite">
              <strong>{found.length}</strong> <T>vehicles found</T>
            </p>
            <label className="z-sort">
              <T>Sort by</T>
              <select
                aria-label={t('Sort by')}
                value={filters.sort}
                onChange={(e) => set('sort', e.target.value as FleetFilters['sort'])}
              >
                <option value="featured">
                  <T>Featured</T>
                </option>
                <option value="price-asc">
                  <T>Price: Low to High</T>
                </option>
                <option value="price-desc">
                  <T>Price: High to Low</T>
                </option>
                <option value="newest">
                  <T>Newest</T>
                </option>
                <option value="name">
                  <T>Name: A–Z</T>
                </option>
              </select>
            </label>
          </div>
          {activeCount > 0 && (
            <div className="z-active-filters">
              {active.map((c) => (
                <button
                  key={c.key + c.value}
                  onClick={() =>
                    set(
                      c.key,
                      filters[c.key].filter((v) => v !== c.value),
                    )
                  }
                  aria-label={'Remove ' + c.label + ' filter'}
                >
                  <T>{c.label}</T>
                  <Icon name="close" size={12} />
                </button>
              ))}
              {(['search', 'minPrice', 'maxPrice'] as const)
                .filter((k) => filters[k])
                .map((k) => (
                  <button
                    key={k}
                    onClick={() => set(k, '')}
                    aria-label={k === 'search' ? 'Clear search' : undefined}
                  >
                    <T>
                      {k === 'search'
                        ? filters[k]
                        : `${t(k === 'minPrice' ? 'Min' : 'Max')} ${money(Number(filters[k]))}`}
                    </T>
                    <Icon name="close" size={12} />
                  </button>
                ))}
              <button className="z-chip-clear" onClick={clear}>
                <T>Clear all</T>
              </button>
            </div>
          )}
          <div className="z-fleet-grid">
            {found.slice(0, visible).map((c) => (
              <CarCard key={c.id} car={c} period={period} />
            ))}
          </div>
          {!found.length && (
            <div className="z-empty">
              <Icon name="search" size={32} />
              <h2>
                <T>No matching vehicles</T>
              </h2>
              <p>
                <T>
                  No vehicles match this selection. Adjust a filter to discover more of the
                  collection.
                </T>
              </p>
              <button className="z-button" onClick={clear}>
                <T>Clear all filters</T>
              </button>
            </div>
          )}
          {found.length > visible && (
            <div className="z-load-more">
              <p>
                <T>Showing </T>
                {Math.min(visible, found.length)} <T>of </T>
                {found.length} <T>vehicles</T>
              </p>
              <button
                className="z-button z-button-outline"
                onClick={() => setVisible((v) => v + 12)}
              >
                <T>Explore more vehicles </T>
                <Icon name="arrow" size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
      <dialog
        ref={dialog}
        className="z-filter-dialog"
        aria-label={t('Filter fleet')}
        onCancel={() => setOpen(false)}
      >
        <div className="z-drawer-top">
          <h2>
            <T>Filter fleet</T>
          </h2>
          <button
            className="z-icon-button"
            aria-label={t('Close filters')}
            onClick={() => setOpen(false)}
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="z-drawer-body">{filterPanel(draft, setDraft, true)}</div>
        <div className="z-drawer-bottom">
          <button className="z-clear" onClick={() => setDraft({ ...initial })}>
            <T>Clear all</T>
          </button>
          <button
            className="z-button"
            onClick={() => {
              setFilters(draft)
              setOpen(false)
            }}
          >
            <T>Apply filters · </T>
            {filterCars(cars, draft, period).length} <T>vehicles</T>
          </button>
        </div>
      </dialog>
    </div>
  )
}

import { T } from '@/components/RegionalProvider'
