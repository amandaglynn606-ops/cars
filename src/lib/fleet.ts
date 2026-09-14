import fleetData from '@data/fleet.json'
import type { Car, RentalPeriod } from './types'

const fleet = fleetData as Car[]

export const getAllCars = (): Car[] => fleet

export const getCarBySlug = (slug: string): Car | undefined =>
  fleet.find((car) => car.slug === slug)

export const getFeaturedCars = (limit = 8): Car[] =>
  fleet.filter((car) => car.featured).slice(0, limit)

/** Unique brands, ordered by how many cars each has. */
export const getBrands = (): { name: string; count: number }[] => {
  const counts = new Map<string, number>()
  for (const car of fleet) {
    if (car.brand) counts.set(car.brand, (counts.get(car.brand) ?? 0) + 1)
  }
  return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
}

export const getBodyTypes = (): { name: string; count: number }[] => {
  const counts = new Map<string, number>()
  for (const car of fleet) {
    if (car.bodyType) counts.set(car.bodyType, (counts.get(car.bodyType) ?? 0) + 1)
  }
  return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
}

/** The advertised rate for a period, falling back to the other period when absent. */
export const rateFor = (car: Car, period: RentalPeriod): number | null =>
  car.pricing[period] ?? car.pricing[period === 'daily' ? 'monthly' : 'daily']

export interface FleetFilters {
  brand?: string
  bodyType?: string
  period?: RentalPeriod
  minPrice?: number
  maxPrice?: number
  search?: string
  sort?: 'price-asc' | 'price-desc' | 'name' | 'power'
}

export function filterCars(cars: Car[], filters: FleetFilters): Car[] {
  const period = filters.period ?? 'daily'
  let result = cars

  if (filters.brand) result = result.filter((c) => c.brand === filters.brand)
  if (filters.bodyType) result = result.filter((c) => c.bodyType === filters.bodyType)

  if (filters.search) {
    const q = filters.search.toLowerCase().trim()
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.brand ?? '').toLowerCase().includes(q) ||
        (c.bodyType ?? '').toLowerCase().includes(q),
    )
  }

  if (filters.minPrice != null || filters.maxPrice != null) {
    result = result.filter((c) => {
      const rate = rateFor(c, period)
      if (rate == null) return false
      if (filters.minPrice != null && rate < filters.minPrice) return false
      if (filters.maxPrice != null && rate > filters.maxPrice) return false
      return true
    })
  }

  const sorted = [...result]
  switch (filters.sort) {
    case 'price-asc':
      sorted.sort((a, b) => (rateFor(a, period) ?? Infinity) - (rateFor(b, period) ?? Infinity))
      break
    case 'price-desc':
      sorted.sort((a, b) => (rateFor(b, period) ?? 0) - (rateFor(a, period) ?? 0))
      break
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'power':
      sorted.sort((a, b) => (b.specs.horsepower ?? 0) - (a.specs.horsepower ?? 0))
      break
    default:
      sorted.sort((a, b) => (rateFor(b, period) ?? 0) - (rateFor(a, period) ?? 0))
  }
  return sorted
}

/** Cars of the same body type, used for the "you may also like" rail. */
export const getRelatedCars = (car: Car, limit = 4): Car[] =>
  fleet
    .filter((c) => c.slug !== car.slug && (c.brand === car.brand || c.bodyType === car.bodyType))
    .sort((a, b) => (a.brand === car.brand ? -1 : 1) - (b.brand === car.brand ? -1 : 1))
    .slice(0, limit)

/* --- Categories -------------------------------------------------------- */

/** URL-safe form of a brand or body-type name ("Rolls Royce" -> "rolls-royce"). */
export const categorySlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export const findBrandBySlug = (slug: string): string | undefined =>
  getBrands().find((b) => categorySlug(b.name) === slug)?.name

export const findBodyTypeBySlug = (slug: string): string | undefined =>
  getBodyTypes().find((t) => categorySlug(t.name) === slug)?.name

export const getCarsByBrand = (brand: string): Car[] =>
  fleet.filter((car) => car.brand === brand)

export const getCarsByBodyType = (bodyType: string): Car[] =>
  fleet.filter((car) => car.bodyType === bodyType)

/**
 * Lowest and highest advertised rate across a set of cars, for the given basis.
 * Returns null when no car in the set is priced on that basis.
 */
export function priceBounds(cars: Car[], period: RentalPeriod): { min: number; max: number } | null {
  const rates = cars.map((c) => c.pricing[period]).filter((r): r is number => r != null)
  if (rates.length === 0) return null
  return { min: Math.min(...rates), max: Math.max(...rates) }
}

/** A representative photo for a category tile. */
export const categoryImage = (cars: Car[]): string | undefined =>
  cars.find((c) => c.images.length > 0)?.images[0].src
