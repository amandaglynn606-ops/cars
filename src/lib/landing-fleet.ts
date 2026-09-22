import type { Car } from './types'
import type { LocationPage } from './location-pages'
import type { OccasionPage } from './occasion-pages'
export function landingCars(cars: Car[], location?: LocationPage, occasion?: OccasionPage): Car[] {
  const categories =
    occasion?.categories ||
    (location?.group === 'Residential stays'
      ? ['SUV', 'Sedan']
      : location?.group === 'City & business'
        ? ['Sedan', 'Luxury']
        : ['Luxury', 'SUV', 'Convertible'])
  const brands = occasion?.brands || []
  const candidates = cars
    .filter(
      (car) =>
        car.availability === 'available' &&
        car.pricing.daily !== null &&
        car.categories.some((category) => categories.includes(category)),
    )
    .sort(
      (a, b) =>
        Number(brands.includes(b.brand || '')) - Number(brands.includes(a.brand || '')) ||
        Number(b.featured) - Number(a.featured) ||
        a.name.localeCompare(b.name),
    )
  // Offer different models and makes before filling remaining positions.
  const selected: Car[] = [],
    seen = new Set<string>()
  for (const car of candidates)
    if (!seen.has(car.brand || '')) {
      selected.push(car)
      seen.add(car.brand || '')
      if (selected.length === 9) break
    }
  for (const car of candidates)
    if (selected.length < 9 && !selected.some((item) => item.id === car.id)) selected.push(car)
  return selected
}
