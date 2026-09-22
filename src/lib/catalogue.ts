import type { Car, RentalPeriod, ReservedDates } from './types'
export const categorySlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
export const carHref = (car: Car) => `/fleet/${car.brandSlug}/${car.modelSlug}`
export const monthlyCarHref = (car: Pick<Car, 'brandSlug' | 'modelSlug'>) =>
  `/monthly-luxury-car-rental/${car.brandSlug}/${car.modelSlug}`
export const vehicleSearchText = (car: Car) =>
  [car.name, car.brand, car.model, car.year, ...car.categories, ...car.keywords]
    .join(' ')
    .toLowerCase()
export function searchDestination(
  query: string,
  cars: { name: string; model: string; keywords: string[]; href: string; searchText: string }[],
  brands: { name: string }[],
) {
  const value = query.trim()
  if (!value) return '/fleet'
  const normalized = categorySlug(value)
  if (normalized) {
    const brand = brands.find((brand) => categorySlug(brand.name) === normalized)
    if (brand) return '/brands/' + categorySlug(brand.name)
    const exact = cars.filter((car) =>
      [car.name, car.model, ...car.keywords].some((name) => categorySlug(name) === normalized),
    )
    if (exact.length === 1) return exact[0].href
  }
  const words = value.toLowerCase().split(/\s+/)
  const matches = cars.filter((car) => words.every((word) => car.searchText.includes(word)))
  if (matches.length === 1) return matches[0].href
  const matchingBrands =
    normalized.length >= 3
      ? brands.filter((brand) => categorySlug(brand.name).startsWith(normalized))
      : []
  if (matchingBrands.length === 1) return '/brands/' + categorySlug(matchingBrands[0].name)
  return '/fleet?' + new URLSearchParams({ search: value }).toString()
}
export const rateFor = (car: Car, period: RentalPeriod) => car.pricing[period]
export const availabilityLabels = {
  available: 'Available',
  reserved: 'Reserved',
  unavailable: 'Unavailable',
  maintenance: 'Maintenance',
}
export const todayDubai = (date = new Date()) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dubai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
export const validDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(value)) &&
  new Date(value).toISOString().slice(0, 10) === value
export const datesOverlap = (start: string, end: string, otherStart: string, otherEnd: string) =>
  start < otherEnd && end > otherStart
export function availableFor(car: Car, start: string, end: string, reservations: ReservedDates[]) {
  if (car.availability !== 'available') return false
  if (!start || !end) return true
  if (!validDate(start) || !validDate(end) || end <= start) return false
  return !reservations.some(
    (r) => r.vehicleId === car.id && datesOverlap(start, end, r.start, r.end),
  )
}
export interface FleetFilters {
  search: string
  categories: string[]
  brands: string[]
  models: string[]
  seats: string[]
  minPrice: string
  maxPrice: string
  sort: 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'name'
}
export const emptyFilters: FleetFilters = {
  search: '',
  categories: [],
  brands: [],
  models: [],
  seats: [],
  minPrice: '',
  maxPrice: '',
  sort: 'featured',
}
export const multiFilterKeys = ['categories', 'brands', 'models', 'seats'] as const
export type MultiFilterKey = (typeof multiFilterKeys)[number]
export function readFleetFilters(
  params: URLSearchParams,
  brand?: string,
  category?: string,
): FleetFilters {
  const filters = structuredClone(emptyFilters)
  for (const key of multiFilterKeys) filters[key] = [...new Set(params.getAll(key).filter(Boolean))]
  for (const key of ['search', 'minPrice', 'maxPrice'] as const)
    filters[key] = params.get(key) || ''
  if (['featured', 'price-asc', 'price-desc', 'newest', 'name'].includes(params.get('sort') || ''))
    filters.sort = params.get('sort') as FleetFilters['sort']
  if (brand) filters.brands = [brand]
  if (category) filters.categories = [category]
  return filters
}
export function fleetFilterParams(filters: FleetFilters) {
  const params = new URLSearchParams()
  for (const key of multiFilterKeys) for (const value of filters[key]) params.append(key, value)
  for (const key of ['search', 'minPrice', 'maxPrice', 'sort'] as const)
    if (filters[key] && filters[key] !== emptyFilters[key]) params.set(key, filters[key])
  return params
}
export function filterErrors(filters: FleetFilters) {
  const errors: string[] = []
  const { minPrice, maxPrice } = filters
  if (
    [minPrice, maxPrice].some(
      (v) => v !== '' && (!/^\d+(?:\.\d+)?$/.test(v) || !Number.isFinite(Number(v))),
    )
  )
    errors.push('Enter a valid price of zero or more.')
  else if (minPrice !== '' && maxPrice !== '' && Number(minPrice) > Number(maxPrice))
    errors.push('Maximum price must be at least the minimum.')
  return errors
}
export function fleetFacets(cars: Car[], filters: FleetFilters, period: RentalPeriod = 'daily') {
  const valuesFor = (car: Car, key: MultiFilterKey): string[] => {
    switch (key) {
      case 'categories':
        return car.categories
      case 'brands':
        return car.brand ? [car.brand] : []
      case 'models':
        return [car.model]
      case 'seats':
        return car.seats ? [car.seats >= 5 ? '5+' : String(car.seats)] : []
    }
  }
  return Object.fromEntries(
    multiFilterKeys.map((key) => {
      const candidates = filterCars(cars, { ...filters, [key]: [] }, period)
      const counts = new Map<string, number>()
      for (const car of candidates)
        for (const value of new Set(valuesFor(car, key)))
          counts.set(value, (counts.get(value) || 0) + 1)
      const optionCars =
        key === 'models' && filters.brands.length
          ? cars.filter((car) => filters.brands.includes(car.brand || ''))
          : cars
      const values = [
        ...new Set([...optionCars.flatMap((car) => valuesFor(car, key)), ...filters[key]]),
      ].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      return [key, values.map((value) => ({ value, count: counts.get(value) || 0 }))]
    }),
  ) as Record<MultiFilterKey, { value: string; count: number }[]>
}
export function filterCars(cars: Car[], filters: FleetFilters, period: RentalPeriod = 'daily') {
  const f = filters
  if (filterErrors(f).length) return []
  const q = f.search.toLowerCase().trim().split(/\s+/).filter(Boolean)
  const result = cars.filter((c) => {
    const text = vehicleSearchText(c)
    return (
      q.every((word) => text.includes(word)) &&
      (!f.categories.length || f.categories.some((v) => c.categories.includes(v))) &&
      (!f.brands.length || f.brands.includes(c.brand || '')) &&
      (!f.models.length || f.models.includes(c.model)) &&
      (!f.seats.length ||
        (c.seats !== null && f.seats.includes(c.seats >= 5 ? '5+' : String(c.seats)))) &&
      (f.minPrice === '' ||
        (c.pricing[period] !== null && c.pricing[period] >= Number(f.minPrice))) &&
      (f.maxPrice === '' || (c.pricing[period] !== null && c.pricing[period] <= Number(f.maxPrice)))
    )
  })
  return [...result].sort((a, b) => {
    switch (f.sort) {
      case 'price-asc':
        return (
          (a.pricing[period] ?? Infinity) - (b.pricing[period] ?? Infinity) ||
          a.name.localeCompare(b.name)
        )
      case 'price-desc':
        return (b.pricing[period] ?? -1) - (a.pricing[period] ?? -1) || a.name.localeCompare(b.name)
      case 'newest':
        return (b.year ?? 0) - (a.year ?? 0) || a.name.localeCompare(b.name)
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return (
          Number(b.featured) - Number(a.featured) ||
          (b.pricing[period] ?? 0) - (a.pricing[period] ?? 0)
        )
    }
  })
}
export function priceBounds(cars: Car[], period: RentalPeriod) {
  const prices = cars.map((c) => c.pricing[period]).filter((p): p is number => p !== null)
  return prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : null
}
export const categoryImage = (cars: Car[]) => cars.find((c) => c.images.length)?.images[0].src
export function facetCounts(cars: Car[], field: 'brand' | 'categories') {
  const counts = new Map<string, number>()
  for (const c of cars)
    for (const value of field === 'brand' ? [c.brand] : c.categories)
      if (value) counts.set(value, (counts.get(value) || 0) + 1)
  return [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name))
}
