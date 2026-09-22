import type { Car } from './types'
import { categorySlug } from './catalogue'
export const safeImagePath = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^\/(fleet|uploads)\/[a-zA-Z0-9_./ -]+\.(webp|png|jpe?g|avif)$/i.test(value) &&
  !value.includes('..')
export function validateCar(value: unknown): Car {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('A vehicle record is required.')
  const c = structuredClone(value) as Car
  // Discard descriptions from older exports and clients when saving a vehicle.
  delete (c as Car & { description?: unknown }).description
  const text = (v: unknown, max = 200): v is string => typeof v === 'string' && v.length <= max
  for (const field of ['id', 'slug', 'brandSlug', 'modelSlug'] as const)
    if (!text(c[field]) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(c[field]))
      throw new Error(`Invalid ${field}.`)
  if (!text(c.brand) || !c.brand.trim() || !text(c.model) || !c.model.trim())
    throw new Error('Brand and model are required.')
  if (categorySlug(c.brand) !== c.brandSlug) throw new Error('Brand URL must match the brand.')
  for (const field of ['categories', 'features', 'keywords', 'locations'] as const)
    if (
      !Array.isArray(c[field]) ||
      c[field].length > 100 ||
      !c[field].every((v) => text(v) && v.trim())
    )
      throw new Error(`Invalid ${field}.`)
  if (!c.categories.length || !c.bodyType || !c.categories.includes(c.bodyType))
    throw new Error('Choose a primary category included in the categories.')
  if (
    c.year !== null &&
    (!Number.isInteger(c.year) || c.year < 1900 || c.year > new Date().getFullYear() + 2)
  )
    throw new Error('Invalid model year.')
  if (c.seats !== null && (!Number.isInteger(c.seats) || c.seats < 1 || c.seats > 50))
    throw new Error('Invalid seat count.')
  for (const field of [
    'transmission',
    'drivetrain',
    'exteriorColour',
    'interiorColour',
    'mileage',
    'deposit',
  ] as const)
    if (c[field] !== null && !text(c[field])) throw new Error(`Invalid ${field}.`)
  if (!['available', 'reserved', 'unavailable', 'maintenance'].includes(c.availability))
    throw new Error('Invalid availability.')
  if (!['published', 'draft'].includes(c.publicationStatus))
    throw new Error('Invalid publication status.')
  if (typeof c.featured !== 'boolean' || !text(c.imagePermission, 1000))
    throw new Error('Invalid vehicle content.')
  if (!c.pricing || c.pricing.currency !== 'AED') throw new Error('Prices must use AED.')
  for (const field of [
    'daily',
    'dailyWas',
    'monthly',
    'monthlyWas',
    'threeDays',
    'weekly',
    'fortnightly',
  ] as const) {
    const n = c.pricing[field]
    if (n != null && (typeof n !== 'number' || !Number.isFinite(n) || n <= 0 || n > 10000000))
      throw new Error(`Invalid ${field} price.`)
  }
  for (const [base, was] of [
    ['daily', 'dailyWas'],
    ['monthly', 'monthlyWas'],
  ] as const)
    if (c.pricing[was] != null && (c.pricing[base] == null || c.pricing[was]! <= c.pricing[base]!))
      throw new Error('Original price must exceed the sale price.')
  if (
    !Array.isArray(c.images) ||
    c.images.length > 60 ||
    !c.images.every((i) => i && safeImagePath(i.src) && safeImagePath(i.thumbnail) && text(i.alt))
  )
    throw new Error('Images must be local raster photographs.')
  if (c.featuredImage && !c.images.some((i) => i.src === c.featuredImage))
    throw new Error('Featured image must belong to the gallery.')
  if (
    !Array.isArray(c.colors) ||
    !c.colors.every((i) => text(i.name) && text(i.slug) && typeof i.default === 'boolean')
  )
    throw new Error('Invalid colours.')
  if (
    c.images.some(
      (i) =>
        i.colorSlug !== undefined &&
        (!text(i.colorSlug) || !c.colors.some((v) => v.slug === i.colorSlug)),
    )
  )
    throw new Error('Photo colours must match a configured vehicle colour.')
  c.colors = c.colors.filter((colour) => c.images.some((i) => i.colorSlug === colour.slug))
  if (!c.specs || typeof c.specs !== 'object' || Array.isArray(c.specs))
    throw new Error('Invalid specifications.')
  for (const [k, v] of Object.entries(c.specs))
    if (k === 'engine' ? !text(v) : typeof v !== 'number' || !Number.isFinite(v) || v <= 0)
      throw new Error('Invalid specification value.')
  if (
    c.publicationStatus === 'published' &&
    (!c.pricing.daily || !c.images.length || !c.imagePermission.trim())
  )
    throw new Error('Publishing requires a daily price, an image and image permission.')
  c.name = c.brand + ' ' + c.model
  c.featuredImage = c.featuredImage || c.images[0]?.src || ''
  return c
}
