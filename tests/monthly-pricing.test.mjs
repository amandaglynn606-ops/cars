import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { moduleURL } from './load-module.mjs'
const pricingURL = await moduleURL('src/lib/monthly-pricing.ts')
const { withMonthlyOffer, rentalPeriodRates } = await import(pricingURL)
const [car] = JSON.parse(await readFile('data/fleet.json', 'utf8'))
const { filterCars, fleetFacets, emptyFilters, monthlyCarHref } = await import(
  await moduleURL('src/lib/catalogue.ts')
)

test('period totals fill missing rates, keep quoted overrides and round currency to cents', () => {
  const pricing = { daily: 349, monthly: null, threeDays: null, weekly: null, fortnightly: null }
  assert.deepEqual(
    rentalPeriodRates(pricing).map((row) => row.amount),
    [349, 1047, 2443, 4886, 7329, 8376],
  )
  const quoted = rentalPeriodRates({ ...pricing, threeDays: 999, weekly: 2200, fortnightly: 4500 })
  assert.deepEqual(
    quoted.map((row) => row.amount),
    [349, 999, 2200, 4500, 7329, 8376],
  )
  assert.equal(rentalPeriodRates({ ...pricing, daily: 349.99 })[3].amount, 4899.86)
  for (const daily of [null, 0, -1, NaN, Infinity])
    assert.ok(rentalPeriodRates({ ...pricing, daily }).every((row) => row.amount === null))
})

test('every published priced vehicle has six valid period totals and the same 30-day offer', async () => {
  const fleet = JSON.parse(await readFile('data/fleet.json', 'utf8'))
  for (const car of fleet.filter((car) => car.publicationStatus === 'published')) {
    const offer = withMonthlyOffer(car)
    const rates = rentalPeriodRates(offer.pricing)
    assert.deepEqual(
      rates.map((row) => row.days),
      [1, 3, 7, 14, 21, 30],
    )
    assert.ok(
      rates.every((row) => Number.isFinite(row.amount) && row.amount > 0),
      car.name,
    )
    assert.equal(rates[5].amount, offer.pricing.monthly)
  }
})

test('monthly filters and facet counts use 30-day prices while daily filters keep daily prices', () => {
  const vehicles = [
    withMonthlyOffer({
      ...car,
      id: 'first',
      brand: 'First',
      pricing: { ...car.pricing, daily: 500 },
    }),
    withMonthlyOffer({
      ...car,
      id: 'second',
      brand: 'Second',
      pricing: { ...car.pricing, daily: 1000 },
    }),
  ]
  const filters = { ...emptyFilters, minPrice: '10000', maxPrice: '13000' }
  assert.deepEqual(
    filterCars(vehicles, filters, 'monthly').map((car) => car.id),
    ['first'],
  )
  assert.deepEqual(
    filterCars(vehicles, filters).map((car) => car.id),
    [],
  )
  assert.deepEqual(fleetFacets(vehicles, filters, 'monthly').brands, [
    { value: 'First', count: 1 },
    { value: 'Second', count: 0 },
  ])
  assert.deepEqual(
    filterCars(vehicles, { ...emptyFilters, sort: 'price-desc' }, 'monthly').map((car) => car.id),
    ['second', 'first'],
  )
  assert.equal(
    monthlyCarHref(vehicles[0]),
    `/monthly-luxury-car-rental/${car.brandSlug}/${car.modelSlug}`,
  )
})

test('30-day offer saves exactly 20% of daily rentals and never compounds discounts', () => {
  const original = {
    ...car,
    pricing: { ...car.pricing, daily: 1000, dailyWas: 1200, monthly: 17000 },
  }
  const offer = withMonthlyOffer(original)
  assert.equal(offer.pricing.monthly, 24000)
  assert.equal(offer.pricing.monthlyWas, 30000)
  assert.equal(offer.pricing.daily, 1000)
  assert.equal(offer.pricing.dailyWas, 1200)
  assert.deepEqual(withMonthlyOffer(offer), offer)
  assert.equal(original.pricing.monthly, 17000)
  assert.equal(
    withMonthlyOffer({ ...car, pricing: { ...car.pricing, daily: 349.99 } }).pricing.monthly,
    8399.76,
  )
})

test('unpriced or invalid daily rates never produce a fabricated monthly discount', () => {
  for (const daily of [null, 0, -1, Infinity, NaN]) {
    const original = { ...car, pricing: { ...car.pricing, daily, monthly: null } }
    assert.equal(withMonthlyOffer(original), original)
  }
})

test('public catalogue and vehicle lookup return the same monthly offer used by booking', async () => {
  const vehicle = { ...car, pricing: { ...car.pricing, daily: 500 } }
  const dbURL =
    'data:text/javascript;base64,' +
    Buffer.from(
      'export const allVehicles = () => [' +
        JSON.stringify(vehicle) +
        ']; export const db = () => { throw Error("Unexpected database lookup") }',
    ).toString('base64')
  const fleet = await import(
    await moduleURL('src/lib/fleet.ts', {
      './db': dbURL,
      './catalogue': await moduleURL('src/lib/catalogue.ts'),
      './monthly-pricing': pricingURL,
    })
  )
  const catalogue = fleet.getAllCars()[0]
  const detail = fleet.getCarByRoute(vehicle.brandSlug, vehicle.modelSlug)
  const booking = fleet.getCarBySlug(vehicle.slug)
  assert.equal(catalogue.pricing.monthly, 12000)
  assert.deepEqual(detail.pricing, catalogue.pricing)
  assert.deepEqual(booking.pricing, catalogue.pricing)
})
