/**
 * Imports the fleet catalogue from the legacy WooCommerce site into a clean,
 * framework-agnostic JSON file at data/fleet.json.
 *
 * The legacy site lists every car twice - once with a monthly price and once
 * with a per-day price - so listings are grouped by normalised name and merged
 * into a single car with a `pricing` block.
 *
 * Usage: node scripts/import-fleet.mjs
 */
import { writeFile, mkdir } from 'node:fs/promises'

const SOURCE = 'https://luxmotorsdxb.com/wp-json/wc/store/v1/products'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'

// Category names ending in "p" are the per-day duplicates of a real category.
const BRANDS = [
  'Mercedes-Benz', 'Rolls Royce', 'Range Rover', 'Aston Martin', 'Lamborghini',
  'McLaren', 'Maserati', 'Chevrolet', 'Cadillac', 'Bentley', 'Ferrari',
  'Porsche', 'Nissan', 'Lotus', 'Honda', 'Dodge', 'Audi', 'Ford', 'BMW', 'GMC', 'MINI',
]
const BODY_TYPES = [
  'Super Sport', 'American Muscle', 'Convertible', 'Sedan', 'Coupe', 'Sports', 'Luxury', 'SUV', 'VAN',
]

const stripTags = (html = '') =>
  html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
      .replace(/&#8217;/g, "'").replace(/\s+/g, ' ').trim()

const rentalPeriod = (p) => {
  const m = /rental-label[^>]*>\s*\/?\s*(day|month)/i.exec(p.price_html || '')
  return m ? m[1].toLowerCase() : null
}

const canonicalName = (name) =>
  name.toLowerCase()
      .replace(/\b(monthly|daily|per day|per month|rental|dubai|rent)\b/g, '')
      .replace(/[^a-z0-9]+/g, ' ').trim()

const titleCase = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase())
const slugify = (s) => s.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/**
 * Pulls spec values out of the legacy description prose.
 * Note: the source descriptions quote acceleration as 0-100 km/h and never
 * state a seat count, so there is no `seats` field to extract.
 */
const extractSpecs = (html) => {
  const text = stripTags(html)
  const specs = {}
  const grab = (re, key, fn = (v) => v.trim()) => {
    const m = re.exec(text)
    if (m) specs[key] = fn(m[1])
  }
  const num = (v) => Number(v.replace(/,/g, ''))

  grab(/(\d+(?:\.\d+)?\s*L\s+[A-Za-z0-9\- ]{0,30}?(?:V\d{1,2}|engine|turbo|hybrid))/i, 'engine')
  grab(/([\d,]+)\s*(?:horsepower|hp)/i, 'horsepower', num)
  grab(/0\s*(?:to|-|–)\s*100\s*km\/h\s*(?:in\s*)?(?:just\s*|approximately\s*|around\s*)?([\d.]+)\s*second/i, 'zeroToHundredKph', num)
  grab(/top speed[^.\d]{0,40}?([\d,]+)\s*km\/h/i, 'topSpeedKph', num)
  grab(/([\d,]+)\s*(?:lb-ft|lb\.-ft\.?)\s*of\s*torque/i, 'torqueLbFt', num)
  return specs
}

const pickBrand = (categories, name) => {
  const names = categories.map((c) => c.name)
  for (const b of BRANDS) {
    if (names.some((n) => n.replace(/p$/, '').toLowerCase() === b.toLowerCase())) return b
    if (new RegExp(`\b${b.split(/[- ]/)[0]}\b`, 'i').test(name)) return b
  }
  return null
}

const pickBodyType = (categories) => {
  const names = categories.map((c) => c.name.replace(/p$/, '').replace(/_D$/, ''))
  for (const t of BODY_TYPES) if (names.some((n) => n.toLowerCase() === t.toLowerCase())) return t
  return null
}

async function fetchAll() {
  const out = []
  for (let page = 1; page <= 20; page++) {
    const res = await fetch(`${SOURCE}?per_page=100&page=${page}`, { headers: { 'User-Agent': UA } })
    if (!res.ok) throw new Error(`Source returned ${res.status} on page ${page}`)
    const batch = await res.json()
    if (!Array.isArray(batch) || batch.length === 0) break
    out.push(...batch)
    console.log(`  fetched page ${page} (${batch.length} listings, ${out.length} total)`)
    if (batch.length < 100) break
  }
  return out
}

function buildFleet(listings) {
  const groups = new Map()
  for (const l of listings) {
    const key = canonicalName(l.name)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(l)
  }

  const fleet = []
  for (const [key, items] of groups) {
    // Prefer the richest listing as the canonical record.
    const primary = items.reduce((a, b) =>
      (b.description || '').length > (a.description || '').length ? b : a)

    const pricing = { currency: 'AED', daily: null, monthly: null, dailyWas: null, monthlyWas: null }
    for (const item of items) {
      const period = rentalPeriod(item)
      const price = Number(item.prices?.price)
      const regular = Number(item.prices?.regular_price)
      if (!period || !Number.isFinite(price) || price <= 0) continue
      const field = period === 'day' ? 'daily' : 'monthly'
      // Keep the lowest advertised price when the legacy site has duplicates.
      if (pricing[field] === null || price < pricing[field]) {
        pricing[field] = price
        pricing[field === 'daily' ? 'dailyWas' : 'monthlyWas'] =
          Number.isFinite(regular) && regular > price ? regular : null
      }
    }

    const colorAttr = items.flatMap((i) => i.attributes || []).find((a) => a.name === 'Color')
    const colors = colorAttr
      ? colorAttr.terms.map((t) => ({ name: t.name, slug: t.slug, default: !!t.default }))
      : []

    const images = []
    const seen = new Set()
    for (const item of items) {
      for (const img of item.images || []) {
        const src = img.src
        if (!src || seen.has(src)) continue
        seen.add(src)
        images.push({ src, thumbnail: img.thumbnail || src, alt: img.alt || primary.name })
      }
    }

    const categories = items.flatMap((i) => i.categories || [])
    const name = titleCase(key)

    fleet.push({
      id: slugify(key),
      name,
      slug: slugify(key),
      brand: pickBrand(categories, primary.name),
      bodyType: pickBodyType(categories),
      pricing,
      colors,
      specs: extractSpecs(primary.description),
      description: stripTags(primary.description),
      images,
      featured: false,
    })
  }

  // Most expensive first so the hero/featured picks are the halo cars.
  fleet.sort((a, b) => (b.pricing.daily || 0) - (a.pricing.daily || 0) || a.name.localeCompare(b.name))
  fleet.slice(0, 8).forEach((c) => { c.featured = true })
  return fleet
}

console.log('Fetching legacy catalogue...')
const listings = await fetchAll()
console.log(`Merging ${listings.length} listings...`)
const fleet = buildFleet(listings)

await mkdir('data', { recursive: true })
await writeFile('data/fleet.json', JSON.stringify(fleet, null, 2) + '\n')

const withDaily = fleet.filter((c) => c.pricing.daily).length
const withMonthly = fleet.filter((c) => c.pricing.monthly).length
const withColors = fleet.filter((c) => c.colors.length).length
const noImage = fleet.filter((c) => !c.images.length)

console.log(`\nWrote data/fleet.json`)
console.log(`  cars:            ${fleet.length}`)
console.log(`  with daily rate: ${withDaily}`)
console.log(`  with monthly:    ${withMonthly}`)
console.log(`  with colors:     ${withColors}`)
console.log(`  missing images:  ${noImage.length}${noImage.length ? ' -> ' + noImage.map((c) => c.name).join(', ') : ''}`)
