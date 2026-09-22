import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { readFile, mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { moduleURL } from './load-module.mjs'
const catalogueURL = await moduleURL('src/lib/catalogue.ts')
const validationURL = await moduleURL('src/lib/validation.ts', { './catalogue': catalogueURL })
const {
  filterCars,
  emptyFilters,
  datesOverlap,
  availableFor,
  validDate,
  rateFor,
  todayDubai,
  fleetFacets,
  readFleetFilters,
  fleetFilterParams,
  filterErrors,
  searchDestination,
} = await import(catalogueURL)
const { validateCar, safeImagePath } = await import(validationURL)
const directory = await mkdtemp(path.join(os.tmpdir(), 'zavi-catalogue-test-'))
process.env.ZAVI_DATA_DIR = directory
const repo = await import(
  await moduleURL('src/lib/db.ts', {
    './catalogue': catalogueURL,
    './validation': validationURL,
    './partnership': await moduleURL('src/lib/partnership.ts'),
    './delivery': await moduleURL('src/lib/delivery.ts'),
  })
)
const seed = JSON.parse(await readFile('data/fleet.json', 'utf8'))
const publicCars = seed.filter((c) => c.publicationStatus === 'published')
const car = publicCars.find((c) => c.model === 'Revuelto')
const filters = (values) => ({ ...structuredClone(emptyFilters), ...values })
after(async () => {
  repo.db().close()
  // Remove only the uniquely created test directory, never the application's database.
  if (
    path.dirname(path.resolve(directory)) === path.resolve(os.tmpdir()) &&
    path.basename(directory).startsWith('zavi-catalogue-test-')
  )
    await rm(directory, { recursive: true, force: true })
})
test('the complete import validates and has unique identities and canonical routes', () => {
  for (const c of seed) assert.doesNotThrow(() => validateCar(c), c.name)
  assert.equal(new Set(seed.map((c) => c.id)).size, seed.length)
  assert.equal(new Set(seed.map((c) => c.brandSlug + '/' + c.modelSlug)).size, seed.length)
  assert.ok(publicCars.length > 100)
  assert.ok(publicCars.every((c) => c.images.length && c.pricing.daily > 0))
  assert.ok(seed.some((c) => c.publicationStatus === 'draft' && c.pricing.daily === null))
})
test('search combines keywords, model and year case-insensitively', () => {
  assert.deepEqual(
    filterCars(publicCars, filters({ search: 'LAMBORGHINI revuelto' })).map((c) => c.id),
    [car.id],
  )
  assert.equal(filterCars(publicCars, filters({ search: 'no-such-vehicle' })).length, 0)
  const dated = publicCars.find((c) => c.year)
  assert.ok(filterCars(publicCars, filters({ search: String(dated.year) })).includes(dated))
})

test('legacy descriptions are removed without changing vehicle facts or reservation history', () => {
  const database = repo.db()
  const original = repo.allVehicles(true).find((c) => c.id === car.id)
  const reservations = database.prepare('SELECT * FROM reservations').all()
  database
    .prepare('UPDATE vehicles SET data=? WHERE id=?')
    .run(JSON.stringify({ ...original, description: 'Legacy promotional copy' }), car.id)
  assert.equal(repo.removeVehicleDescriptions(database), 1)
  const updated = repo.allVehicles(true).find((c) => c.id === car.id)
  assert.equal(Object.hasOwn(updated, 'description'), false)
  assert.deepEqual(updated, {
    ...original,
    revision: original.revision + 1,
    updatedAt: updated.updatedAt,
  })
  assert.deepEqual(database.prepare('SELECT * FROM reservations').all(), reservations)
  assert.equal(repo.removeVehicleDescriptions(database), 0)
  assert.equal(
    Object.hasOwn(validateCar({ ...car, description: 'Old imported copy' }), 'description'),
    false,
  )
  assert.ok(seed.every((c) => !Object.hasOwn(c, 'description')))
})
test('filters use OR within a facet and AND across independent facets', () => {
  const result = filterCars(
    publicCars,
    filters({
      brands: ['Ferrari', 'Lamborghini'],
      categories: ['SUV'],
      minPrice: '2000',
      maxPrice: '12000',
    }),
  )
  assert.ok(result.length > 0)
  assert.ok(
    result.every(
      (c) =>
        ['Ferrari', 'Lamborghini'].includes(c.brand) &&
        c.categories.includes('SUV') &&
        c.pricing.daily >= 2000 &&
        c.pricing.daily <= 12000,
    ),
  )
})

test('every listing is reachable through its recorded brand, category, model and specifications', () => {
  for (const vehicle of publicCars) {
    for (const category of vehicle.categories) {
      const selected = filters({
        brands: [vehicle.brand],
        categories: [category],
        models: [vehicle.model],
        seats: vehicle.seats ? [vehicle.seats >= 5 ? '5+' : String(vehicle.seats)] : [],
        minPrice: String(vehicle.pricing.daily),
        maxPrice: String(vehicle.pricing.daily),
      })
      assert.ok(
        filterCars(publicCars, selected).some((c) => c.id === vehicle.id),
        vehicle.id,
      )
    }
  }
})

test('every brand and category has accurate scoped options, counts and prices', () => {
  const scopes = [
    publicCars,
    ...[...new Set(publicCars.map((c) => c.brand))].map((brand) =>
      publicCars.filter((c) => c.brand === brand),
    ),
    ...[...new Set(publicCars.flatMap((c) => c.categories))].map((category) =>
      publicCars.filter((c) => c.categories.includes(category)),
    ),
  ]
  for (const scope of scopes) {
    const options = fleetFacets(scope, filters({}))
    for (const option of options.brands)
      assert.equal(option.count, scope.filter((c) => c.brand === option.value).length)
    for (const option of options.categories)
      assert.equal(option.count, scope.filter((c) => c.categories.includes(option.value)).length)
    for (const option of options.models)
      assert.equal(option.count, scope.filter((c) => c.model === option.value).length)
    assert.ok(
      options.seats.every((option) =>
        scope.some((c) => c.seats && (c.seats >= 5 ? '5+' : String(c.seats)) === option.value),
      ),
    )
  }
  const draft = fleetFacets(publicCars, filters({ brands: ['Lamborghini'] }))
  assert.ok(
    draft.models.every((option) =>
      publicCars.some((c) => c.brand === 'Lamborghini' && c.model === option.value),
    ),
  )
  const allUnknown = fleetFacets([{ ...car, seats: null, year: null, colors: [] }], filters({}))
  assert.deepEqual(allUnknown.seats, [])
})

test('removed controls cannot silently filter bookmarked pages and malformed prices are rejected', () => {
  assert.deepEqual(
    readFleetFilters(
      new URLSearchParams(
        'transmissions=Manual&locations=Mars&availability=reserved&start=2027-02-30&end=2020-01-01&colors=gray&years=2025&saved=true',
      ),
    ),
    emptyFilters,
  )
  for (const invalid of [
    { minPrice: '-1' },
    { maxPrice: 'not-a-price' },
    { minPrice: '10', maxPrice: '0' },
  ]) {
    assert.ok(filterErrors(filters(invalid)).length)
    assert.deepEqual(filterCars([car], filters(invalid)), [])
  }
})

test('URL filters round-trip, preserve route scope and accept repeated searches', () => {
  const original = filters({
    search: 'Ferrari red',
    brands: ['Ferrari'],
    categories: ['Convertible'],
    minPrice: '0',
    sort: 'price-asc',
  })
  assert.deepEqual(readFleetFilters(fleetFilterParams(original)), original)
  const scoped = readFleetFilters(
    new URLSearchParams('brands=Ferrari&categories=Sedan&search=evo'),
    'Lamborghini',
    'SUV',
  )
  assert.deepEqual(scoped.brands, ['Lamborghini'])
  assert.deepEqual(scoped.categories, ['SUV'])
  assert.equal(scoped.search, 'evo')
  assert.equal(readFleetFilters(new URLSearchParams('search=Revuelto')).search, 'Revuelto')
  assert.equal(readFleetFilters(new URLSearchParams('search=Ferrari')).search, 'Ferrari')
})

test('specific vehicle and brand searches open their pages while ambiguous searches keep results', () => {
  const entries = publicCars.map((car) => ({
    ...car,
    href: '/fleet/' + car.brandSlug + '/' + car.modelSlug,
    searchText: [car.name, car.model, ...car.categories, ...car.keywords].join(' ').toLowerCase(),
  }))
  const brands = [...new Set(publicCars.map((car) => car.brand))].map((name) => ({ name }))
  for (const query of ['Revuelto', 'lamborghini revuelto', '  REVUELTO  '])
    assert.equal(searchDestination(query, entries, brands), '/fleet/lamborghini/revuelto')
  assert.equal(searchDestination('Ferrari', entries, brands), '/brands/ferrari')
  assert.equal(searchDestination('Mercedes', entries, brands), '/brands/mercedes-benz')
  assert.equal(searchDestination('Rolls Royce', entries, brands), '/brands/rolls-royce')
  assert.equal(searchDestination('Audi R8', entries, brands), '/fleet/audi/r8')
  assert.equal(searchDestination('F8 Tributo', entries, brands), '/fleet/ferrari/f8-tributo')
  assert.equal(searchDestination('SUV', entries, brands), '/fleet?search=SUV')
  assert.equal(
    searchDestination('no matching car', entries, brands),
    '/fleet?search=no+matching+car',
  )
  assert.equal(searchDestination('', entries, brands), '/fleet')
  assert.ok(
    searchDestination('https://untrusted.invalid', entries, brands).startsWith('/fleet?search='),
  )
})
test('seat filters only match recorded facts', () => {
  const sample = {
    ...car,
    year: 2025,
    seats: 5,
    transmission: 'Automatic',
    locations: ['Dubai Marina'],
  }
  assert.equal(
    filterCars(
      [sample],
      filters({
        seats: ['5+'],
      }),
    ).length,
    1,
  )
  assert.equal(filterCars([{ ...sample, seats: null }], filters({ seats: ['5+'] })).length, 0)
})
test('sorting is stable and preserves the input', () => {
  const original = publicCars.map((c) => c.id)
  const sorted = filterCars(publicCars, filters({ sort: 'price-asc' }))
  assert.ok(sorted.every((c, i) => i === 0 || sorted[i - 1].pricing.daily <= c.pricing.daily))
  assert.deepEqual(
    publicCars.map((c) => c.id),
    original,
  )
})
test('a monthly rate is never presented as a daily rate', () => {
  assert.equal(
    rateFor({ ...car, pricing: { ...car.pricing, daily: null, monthly: 30000 } }, 'daily'),
    null,
  )
})
test('date validation rejects rollover dates and adjacent bookings do not overlap', () => {
  assert.equal(todayDubai(new Date('2026-09-14T21:00:00Z')), '2026-09-15')
  assert.equal(validDate('2026-02-30'), false)
  assert.equal(validDate('not-a-date'), false)
  assert.equal(datesOverlap('2027-01-01', '2027-01-03', '2027-01-03', '2027-01-05'), false)
  assert.equal(datesOverlap('2027-01-01', '2027-01-04', '2027-01-03', '2027-01-05'), true)
  assert.equal(
    availableFor(car, '2027-01-01', '2027-01-04', [
      { vehicleId: car.id, start: '2027-01-03', end: '2027-01-05' },
    ]),
    false,
  )
  assert.equal(availableFor({ ...car, availability: 'maintenance' }, '', '', []), false)
})
test('publication rejects incomplete data, external files and unsafe image paths', () => {
  assert.throws(() => validateCar({ ...car, images: [], featuredImage: '' }), /Publishing/)
  assert.throws(() => validateCar({ ...car, pricing: { ...car.pricing, daily: null } }))
  assert.throws(() => validateCar({ ...car, year: 9000 }))
  assert.throws(() => validateCar({ ...car, pricing: { ...car.pricing, dailyWas: 1 } }))
  for (const path of [
    'https://evil.test/car.jpg',
    '/uploads/../admin-auth.json',
    '/uploads/payload.svg',
    '/uploads/%2e%2e/secret.png',
  ])
    assert.equal(safeImagePath(path), false)
})
test('repository updates are live, preserve aliases, and reject stale writes', () => {
  const original = repo.allVehicles().find((c) => c.id === car.id)
  const updated = repo.saveVehicle({ ...original, pricing: { ...original.pricing, daily: 13999 } })
  assert.equal(repo.allVehicles().find((c) => c.id === car.id).pricing.daily, 13999)
  assert.throws(() => repo.saveVehicle(original), /changed/)
  const moved = repo.saveVehicle({ ...updated, modelSlug: 'revuelto-hybrid' })
  assert.ok(
    repo
      .db()
      .prepare('SELECT vehicleId FROM vehicle_aliases WHERE route=?')
      .get('lamborghini/revuelto'),
  )
  assert.equal(moved.modelSlug, 'revuelto-hybrid')
})
test('confirmed reservations atomically reject overlap and cancellation releases dates', () => {
  const date = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10)
  const payload = {
    vehicleId: car.id,
    start: date(10),
    end: date(13),
    location: car.locations[0],
    name: 'Test Customer',
    email: 'customer@example.invalid',
    phone: '+971500000001',
    notes: '',
  }
  const first = repo.createReservation(payload),
    second = repo.createReservation({ ...payload, name: 'Second Test' })
  assert.equal(first.status, 'pending')
  repo.updateReservation(first.id, 'confirmed')
  assert.throws(() => repo.updateReservation(second.id, 'confirmed'), /overlaps/)
  assert.throws(() => repo.createReservation(payload), /reserved/)
  assert.throws(() => repo.deleteVehicle(car.id), /history/)
  const publicDates = repo.reservedDates()
  assert.ok(publicDates.every((r) => Object.keys(r).sort().join(',') === 'end,start,vehicleId'))
  const adjacent = repo.createReservation({ ...payload, start: date(13), end: date(15) })
  assert.doesNotThrow(() => repo.updateReservation(adjacent.id, 'confirmed'))
  repo.updateReservation(first.id, 'cancelled')
  assert.doesNotThrow(() => repo.updateReservation(second.id, 'confirmed'))
})
test('malformed customer requests and unoffered locations are rejected', () => {
  assert.throws(() => repo.createReservation({}), /Invalid/)
  assert.throws(() =>
    repo.createReservation({
      vehicleId: car.id,
      start: '2026-02-30',
      end: '2026-03-03',
      location: 'Mars',
      name: 'Test',
      email: 'invalid',
      phone: '0',
      notes: '',
    }),
  )
})
test('audit history records operations without customer contact details', () => {
  const events = repo.auditEvents()
  assert.ok(events.some((e) => e.action === 'vehicle.updated'))
  assert.ok(events.some((e) => e.action === 'reservation.confirmed'))
  assert.ok(events.some((e) => e.action === 'reservation.cancelled'))
  assert.equal(JSON.stringify(events).includes('customer@example.invalid'), false)
})
