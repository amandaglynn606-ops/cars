import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { moduleURL } from './load-module.mjs'
import { ownerApplication, agencyApplication } from './partnership-fixtures.mjs'
const partnershipURL = await moduleURL('src/lib/partnership.ts')
const { validatePartnership } = await import(partnershipURL)
const deliveryURL = await moduleURL('src/lib/delivery.ts')
const { deliveryLocations } = await import(deliveryURL)

test('owner and agency applications retain the information needed for review', () => {
  const owner = validatePartnership(ownerApplication),
    agency = validatePartnership(agencyApplication)
  assert.deepEqual(owner.application, ownerApplication.application)
  assert.deepEqual(agency.application, agencyApplication.application)
  assert.equal(owner.details, '')
  assert.equal(
    validatePartnership({ ...agencyApplication, name: '  Test Partner  ' }).name,
    'Test Partner',
  )
  assert.equal(agency.consentVersion, 'partnership-2026-09')
  for (const interest of ['Monthly subscription to display cars', 'Receive rental leads from Zavi'])
    assert.equal(
      validatePartnership({
        ...agencyApplication,
        application: { ...agencyApplication.application, interest },
      }).application.interest,
      interest,
    )
})
test('applications require explicit consent and valid bounded contact details', () => {
  for (const change of [
    { consent: false },
    { consent: 'true' },
    { type: 'admin' },
    { email: 'bad@@example.test' },
    { phone: '-------' },
    { phone: '0501234567' },
    { phone: '971501234567' },
    { phone: '+0123456789' },
    { details: 'x'.repeat(1501) },
    { name: 'bad\u0000name' },
    { name: 8 },
    { application: null },
    { application: [] },
    { application: {} },
  ])
    assert.throws(() => validatePartnership({ ...agencyApplication, ...change }))
  for (const value of [null, [], 'test', 2]) assert.throws(() => validatePartnership(value))
})
test('vehicle information rejects missing fields, impossible numbers and forged selections', () => {
  for (const change of [
    { brand: '' },
    { model: 4 },
    { year: '1970' },
    { year: String(new Date().getFullYear() + 2) },
    { mileage: '-1' },
    { mileage: '1.5' },
    { mileage: '1e3' },
    { mileage: '2000001' },
    { ownership: 'Stranger' },
    { emirate: 'Anywhere' },
    { insurance: '' },
    { finance: 'x'.repeat(121) },
  ])
    assert.throws(() =>
      validatePartnership({
        ...ownerApplication,
        application: { ...ownerApplication.application, ...change },
      }),
    )
  assert.equal(
    validatePartnership({
      ...ownerApplication,
      application: { ...ownerApplication.application, mileage: '0' },
    }).application.mileage,
    '0',
  )
  assert.throws(() =>
    validatePartnership({ ...ownerApplication, application: agencyApplication.application }),
  )
})
test('agency information rejects missing licence data, unsafe URLs and invalid fleet sizes', () => {
  for (const change of [
    { licence: '' },
    { licensingAuthority: '' },
    { company: '' },
    { fleetSize: '0' },
    { fleetSize: 'NaN' },
    { fleetSize: '100001' },
    { interest: 'Guaranteed leads' },
    { website: 'javascript:alert(1)' },
    { website: 'https://user:password@example.test' },
    { coverage: 'x'.repeat(301) },
  ])
    assert.throws(() =>
      validatePartnership({
        ...agencyApplication,
        application: { ...agencyApplication.application, ...change },
      }),
    )
  assert.equal(
    validatePartnership({
      ...agencyApplication,
      application: { ...agencyApplication.application, website: '' },
    }).application.website,
    '',
  )
})
test('client-supplied administrative fields are discarded', () => {
  const result = validatePartnership({
    ...agencyApplication,
    id: 'chosen',
    createdAt: 'forged',
    admin: true,
    consentVersion: 'forged',
    application: { ...agencyApplication.application, approved: true },
  })
  assert.equal(result.id, undefined)
  assert.equal(result.createdAt, undefined)
  assert.equal(result.admin, undefined)
  assert.equal(result.application.approved, undefined)
  assert.equal(result.consentVersion, 'partnership-2026-09')
})
const directory = await mkdtemp(path.join(os.tmpdir(), 'zavi-partnership-test-'))
process.env.ZAVI_DATA_DIR = directory
const catalogueURL = await moduleURL('src/lib/catalogue.ts')
const repoURL = await moduleURL('src/lib/db.ts', {
  './catalogue': catalogueURL,
  './validation': await moduleURL('src/lib/validation.ts', { './catalogue': catalogueURL }),
  './partnership': partnershipURL,
  './delivery': deliveryURL,
})
const repo = await import(repoURL)
const configURL = await moduleURL('src/lib/config.ts')
const httpURL = await moduleURL('src/lib/http.ts', { './config': configURL })
const { POST } = await import(
  await moduleURL('src/app/api/partners/route.ts', { '@/lib/db': repoURL, '@/lib/http': httpURL })
)
const base = 'http://127.0.0.1:43117'
const request = (body, origin = base, contentType = 'application/json') =>
  new Request(base + '/api/partners', {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': contentType },
    body: JSON.stringify(body),
  })
test('API persists both applications privately and returns only a reference', async () => {
  for (const data of [ownerApplication, agencyApplication]) {
    const response = await POST(request(data))
    assert.equal(response.status, 201)
    assert.equal(response.headers.get('Cache-Control'), 'no-store')
    const body = await response.json()
    assert.deepEqual(Object.keys(body), ['id'])
    const saved = repo.allPartnerships().find((item) => item.id === body.id)
    assert.deepEqual(saved.application, data.application)
    assert.equal(saved.email, data.email)
    assert.equal(saved.consentVersion, 'partnership-2026-09')
  }
})
test('API rejects foreign and previous-port origins, oversized requests and invalid submissions without storing them', async () => {
  const before = repo.allPartnerships().length
  for (const req of [
    request(agencyApplication, 'https://untrusted.invalid'),
    request(agencyApplication, 'http://127.0.0.1:3100'),
    request(agencyApplication, ''),
    request(agencyApplication, base, 'text/plain'),
    request({ ...agencyApplication, consent: false }),
    request({ ...agencyApplication, application: {} }),
    request({ ...agencyApplication, details: 'x'.repeat(17000) }),
  ])
    assert.equal((await POST(req)).status, 400)
  assert.equal(repo.allPartnerships().length, before)
})
test('existing free-text enquiries remain readable', () => {
  const legacy = {
    id: 'legacy-test',
    type: 'business',
    name: 'Legacy contact',
    email: 'legacy@example.test',
    phone: '+971501234567',
    details: 'Existing enquiry',
    createdAt: '2026-01-01T00:00:00Z',
  }
  repo
    .db()
    .prepare('INSERT INTO partnerships(id,createdAt,data) VALUES(?,?,?)')
    .run(legacy.id, legacy.createdAt, JSON.stringify(legacy))
  assert.deepEqual(
    repo.allPartnerships().find((item) => item.id === legacy.id),
    legacy,
  )
})
after(async () => {
  repo.db().close()
  if (
    path.dirname(path.resolve(directory)) === path.resolve(os.tmpdir()) &&
    path.basename(directory).startsWith('zavi-partnership-test-')
  )
    await rm(directory, { recursive: true, force: true })
})
test('delivery options cover seven emirates without losing vehicle-specific locations', () => {
  const locations = deliveryLocations({ locations: ['Dubai Marina', 'Dubai', 'Dubai Marina'] })
  assert.equal(new Set(locations).size, 8)
  for (const name of [
    'Dubai',
    'Abu Dhabi',
    'Sharjah',
    'Ajman',
    'Umm Al Quwain',
    'Ras Al Khaimah',
    'Fujairah',
    'Dubai Marina',
  ])
    assert.ok(locations.includes(name))
})
