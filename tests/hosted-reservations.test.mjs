import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { PGlite } from '@electric-sql/pglite'
import { moduleURL, reservationStoreURL } from './load-module.mjs'

process.env.VERCEL = '1'
process.env.DATABASE_URL = 'postgresql://test:test@localhost/test'
process.env.ZAVI_DOCUMENT_KEY = randomBytes(32).toString('hex')
const pg = new PGlite()
after(async () => {
  await pg.close()
})
let failWrite = false
const query = (text, params = []) => ({
  text,
  params,
  then(resolve, reject) {
    return pg
      .query(text, params)
      .then((r) => r.rows)
      .then(resolve, reject)
  },
})
globalThis.hostedTestSql = {
  query,
  transaction: (queries) =>
    pg.transaction(async (tx) => {
      const result = []
      for (const q of queries) {
        if (failWrite && q.text.includes('WITH saved'))
          throw new Error('Private database error must never reach the client')
        result.push((await tx.query(q.text, q.params)).rows)
      }
      return result
    }),
}
const catalogueURL = await moduleURL('src/lib/catalogue.ts')
const repoURL = await moduleURL('src/lib/db.ts', {
  './catalogue': catalogueURL,
  './validation': await moduleURL('src/lib/validation.ts', { './catalogue': catalogueURL }),
  './partnership': await moduleURL('src/lib/partnership.ts'),
})
const repo = await import(repoURL)
const driver = 'data:text/javascript,export const neon=()=>globalThis.hostedTestSql'
const store = await import(await reservationStoreURL(repoURL, driver))
const documents = await import(await moduleURL('src/lib/reservation-documents.ts'))
const car = repo.allVehicles().find((car) => car.availability === 'available')
const date = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10)
const request = {
  vehicleId: car.id,
  start: date(20),
  end: date(23),
  location: 'Dubai Marina, Test Hotel entrance',
  name: 'Reservation Test',
  email: 'test@example.invalid',
  phone: '+971501234567',
  notes: 'Test reservation',
}
const pdf = Buffer.from('%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF')

test('hosted reservations persist with encrypted documents and can be reviewed without email', async () => {
  const prepared = await documents.prepareDocuments([
    new File([pdf], 'licence.pdf', { type: 'application/pdf' }),
  ])
  const result = await store.createReservation(request, prepared)
  assert.equal(result.status, 'pending')
  const rows = await store.allReservations()
  assert.equal(rows[0].id, result.id)
  assert.equal(rows[0].email, request.email)
  assert.equal(rows[0].documents.length, 1)
  assert.equal(rows[0].documents[0].encrypted, undefined)
  const doc = await store.reservationDocument(result.id, prepared[0].id)
  assert.notDeepEqual(Buffer.from(doc.encrypted), pdf)
  assert.deepEqual(documents.decryptDocument(doc.id, doc.encrypted), pdf)
  assert.equal(
    await store.reservationDocument('00000000-0000-0000-0000-000000000000', doc.id),
    undefined,
  )
  await store.updateReservation(result.id, 'confirmed')
  assert.ok(
    (await store.reservedDates()).some(
      (row) => row.vehicleId === car.id && row.start === request.start,
    ),
  )
  await assert.rejects(store.createReservation(request), /could not be saved/)
  await store.updateReservation(result.id, 'cancelled')
  const second = await store.createReservation(request)
  const third = await store.createReservation(request)
  await store.updateReservation(second.id, 'confirmed')
  await assert.rejects(store.updateReservation(third.id, 'confirmed'), /overlap/)
  await pg.query(
    "UPDATE zavi_reservation_documents SET expires_at=now()-interval '1 day' WHERE id=$1",
    [doc.id],
  )
  assert.equal(await store.reservationDocument(result.id, doc.id), undefined)
  await store.allReservations()
  assert.equal(
    (await pg.query('SELECT count(*)::int AS count FROM zavi_reservation_documents')).rows[0].count,
    0,
  )
})

test('hosted storage failures never return a successful reference or leak database errors', async () => {
  const before = (await pg.query('SELECT count(*)::int AS count FROM zavi_reservations')).rows[0]
    .count
  failWrite = true
  try {
    await assert.rejects(
      store.createReservation({ ...request, start: date(40), end: date(43) }),
      (error) =>
        error.message ===
        'Your reservation could not be saved. Please try again later or contact Zavi.',
    )
  } finally {
    failWrite = false
  }
  assert.equal(
    (await pg.query('SELECT count(*)::int AS count FROM zavi_reservations')).rows[0].count,
    before,
  )
})

test('hosted reservation validation rejects forged values before saving', async () => {
  await assert.rejects(store.createReservation({ ...request, phone: '0501234567' }), /country code/)
  await assert.rejects(
    store.createReservation({ ...request, vehicleId: 'missing' }),
    /not accepting/,
  )
  await assert.rejects(
    store.createReservation({ ...request, start: '2027-02-30' }),
    /valid future dates/,
  )
  await assert.rejects(store.createReservation(request, [{ size: 4 * 1024 * 1024 }]), /3 MB/)
})
