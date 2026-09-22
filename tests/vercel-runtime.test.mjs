import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { moduleURL } from './load-module.mjs'

process.env.VERCEL = '1'
process.env.ZAVI_DATA_DIR = path.join(tmpdir(), 'zavi-no-write-' + randomUUID())
const catalogueURL = await moduleURL('src/lib/catalogue.ts')
const repoURL = await moduleURL('src/lib/db.ts', {
  './catalogue': catalogueURL,
  './validation': await moduleURL('src/lib/validation.ts', { './catalogue': catalogueURL }),
  './partnership': await moduleURL('src/lib/partnership.ts'),
})
const repo = await import(repoURL)
const fleet = await import(
  await moduleURL('src/lib/fleet.ts', {
    './db': repoURL,
    './catalogue': catalogueURL,
    './monthly-pricing': await moduleURL('src/lib/monthly-pricing.ts'),
  })
)
const httpURL = await moduleURL('src/lib/http.ts', {
  './config': await moduleURL('src/lib/config.ts'),
})

test('Vercel serves the published fleet and monthly prices without creating a database', () => {
  const cars = fleet.getAllCars()
  assert.equal(cars.length, 106)
  assert.ok(cars.every((car) => car.publicationStatus === 'published'))
  const car = cars.find((car) => car.model === 'Cullinan')
  assert.equal(fleet.getCarByRoute(car.brandSlug, car.modelSlug).id, car.id)
  assert.equal(car.pricing.monthly, car.pricing.daily * 30 * 0.8)
  assert.equal(fleet.getCarByRoute('missing-brand', 'missing-car'), undefined)
  assert.throws(() => repo.db(), /temporarily unavailable/)
  assert.equal(existsSync(process.env.ZAVI_DATA_DIR), false)
})

test('Vercel rejects submissions before reading documents or claiming they were stored', async () => {
  const routes = [
    [
      'reservations',
      { '@/lib/reservation-documents': await moduleURL('src/lib/reservation-documents.ts') },
    ],
    ['partners', {}],
  ]
  for (const [name, extra] of routes) {
    const { POST } = await import(
      await moduleURL('src/app/api/' + name + '/route.ts', {
        '@/lib/db': repoURL,
        '@/lib/http': httpURL,
        ...extra,
      })
    )
    const response = await POST(
      new Request('http://127.0.0.1:43117/api/' + name, {
        method: 'POST',
        headers: {
          origin: 'http://127.0.0.1:43117',
          'content-type': 'multipart/form-data; boundary=invalid',
        },
        body: 'invalid upload',
      }),
    )
    assert.equal(response.status, 503)
    assert.equal(response.headers.get('cache-control'), 'no-store')
    const body = await response.json()
    assert.match(body.error, /WhatsApp/)
    assert.equal(body.id, undefined)
  }
  assert.equal(existsSync(process.env.ZAVI_DATA_DIR), false)
})

test('Vercel availability fails explicitly instead of reporting an empty booking calendar', async () => {
  const { GET } = await import(
    await moduleURL('src/app/api/availability/route.ts', { '@/lib/db': repoURL })
  )
  const response = await GET()
  assert.equal(response.status, 503)
  assert.match((await response.json()).error, /confirm availability/)
})
