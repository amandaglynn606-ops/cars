import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { moduleURL } from './load-module.mjs'
const { monthlyRentalCars, rentalEvents, rentalRequestContext } = await import(
  await moduleURL('src/lib/home-rentals.ts')
)
const cars = JSON.parse(await readFile('data/fleet.json', 'utf8'))
test('monthly carousel includes every available published daily-rental car, without a brand or count cap', () => {
  const selected = monthlyRentalCars(cars)
  const expected = cars.filter(
    (car) =>
      car.publicationStatus === 'published' &&
      car.availability === 'available' &&
      car.pricing.daily > 0,
  )
  assert.deepEqual(
    selected.map((car) => car.id),
    expected.map((car) => car.id),
  )
  assert.ok(selected.length > 3)
  assert.equal(
    monthlyRentalCars(cars.map((car) => ({ ...car, pricing: { ...car.pricing, monthly: null } })))
      .length,
    expected.length,
  )
  assert.deepEqual(
    monthlyRentalCars(cars.map((car) => ({ ...car, pricing: { ...car.pricing, daily: null } }))),
    [],
  )
  assert.deepEqual(
    monthlyRentalCars(cars.map((car) => ({ ...car, availability: 'unavailable' }))),
    [],
  )
})
test('event and monthly enquiry links preserve approved booking context without accepting arbitrary notes', () => {
  assert.equal(new Set(rentalEvents.map((event) => event.slug)).size, rentalEvents.length)
  for (const event of rentalEvents) {
    const context = rentalRequestContext(event.slug, undefined)
    assert.equal(context.location, event.location)
    assert.ok(context.notes.includes(event.name))
    assert.ok(context.notes.length < 1500)
  }
  assert.match(rentalRequestContext(undefined, 'monthly').notes, /Monthly rental request/)
  assert.match(
    rentalRequestContext('abu-dhabi-grand-prix', 'monthly').notes,
    /Monthly rental request/,
  )
  assert.deepEqual(rentalRequestContext('<script>alert(1)</script>', 'arbitrary'), {
    location: undefined,
    notes: '',
  })
  assert.deepEqual(rentalRequestContext(['dubai-concerts'], ['monthly']), {
    location: undefined,
    notes: '',
  })
})
