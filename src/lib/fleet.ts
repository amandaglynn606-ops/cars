import 'server-only'
import { allVehicles, db } from './db'
import { categorySlug, facetCounts, priceBounds, categoryImage, rateFor } from './catalogue'
import type { Car } from './types'
import { withMonthlyOffer } from './monthly-pricing'
export { categorySlug, priceBounds, categoryImage, rateFor }
export const getAllCars = (): Car[] => allVehicles().map(withMonthlyOffer)
export const getCarBySlug = (slug: string) => getAllCars().find((c) => c.slug === slug)
export const getCarByRoute = (brand: string, model: string) => {
  const cars = getAllCars()
  const match = cars.find((c) => c.brandSlug === brand && c.modelSlug === model)
  if (match) return match
  if (process.env.VERCEL === '1') return undefined
  const alias = db()
    .prepare('SELECT vehicleId FROM vehicle_aliases WHERE route=?')
    .get(brand + '/' + model) as { vehicleId: string } | undefined
  return alias ? cars.find((c) => c.id === alias.vehicleId) : undefined
}
export const getFeaturedCars = (limit = 8) =>
  getAllCars()
    .filter((c) => c.featured)
    .sort((a, b) => (b.pricing.daily || 0) - (a.pricing.daily || 0))
    .slice(0, limit)
export const getBrands = () => facetCounts(getAllCars(), 'brand')
export const getBodyTypes = () => facetCounts(getAllCars(), 'categories')
export const findBrandBySlug = (slug: string) =>
  getBrands().find((b) => categorySlug(b.name) === slug)?.name
export const findBodyTypeBySlug = (slug: string) =>
  getBodyTypes().find((b) => categorySlug(b.name) === slug)?.name
export const getCarsByBrand = (brand: string) => getAllCars().filter((c) => c.brand === brand)
export const getCarsByBodyType = (category: string) =>
  getAllCars()
    .filter((c) => c.categories.includes(category))
    .sort((a, b) => Number(b.bodyType === category) - Number(a.bodyType === category))
export const getRelatedCars = (car: Car, limit = 3) =>
  getAllCars()
    .filter(
      (c) =>
        c.id !== car.id &&
        (c.brand === car.brand || c.categories.some((v) => car.categories.includes(v))),
    )
    .sort((a, b) => Number(b.brand === car.brand) - Number(a.brand === car.brand))
    .slice(0, limit)
