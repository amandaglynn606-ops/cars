import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm, readFile } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { moduleURL, reservationStoreURL } from './load-module.mjs'
const directory = await mkdtemp(path.join(os.tmpdir(), 'zavi-document-test-'))
process.env.ZAVI_DATA_DIR = directory
const catalogueURL = await moduleURL('src/lib/catalogue.ts')
const repoURL = await moduleURL('src/lib/db.ts', {
  './catalogue': catalogueURL,
  './validation': await moduleURL('src/lib/validation.ts', { './catalogue': catalogueURL }),
  './partnership': await moduleURL('src/lib/partnership.ts'),
})
const repo = await import(repoURL)
const storeURL = await reservationStoreURL(repoURL)
const documentURL = await moduleURL('src/lib/reservation-documents.ts')
const docs = await import(documentURL)
const httpURL = await moduleURL('src/lib/http.ts', {
  './config': await moduleURL('src/lib/config.ts'),
})
const { POST } = await import(
  await moduleURL('src/app/api/reservations/route.ts', {
    '@/lib/db': repoURL,
    '@/lib/reservation-store': storeURL,
    '@/lib/http': httpURL,
    '@/lib/reservation-documents': documentURL,
  })
)
const authURL =
  'data:text/javascript;base64,' +
  Buffer.from(
    "export async function requireAdmin(){if(!globalThis.documentTestAdmin)throw Error('Administrator sign-in required.')}",
  ).toString('base64')
const admin = await import(
  await moduleURL('src/app/api/admin/reservations/[id]/documents/[documentId]/route.ts', {
    '@/lib/auth': authURL,
    '@/lib/db': repoURL,
    '@/lib/reservation-store': storeURL,
    '@/lib/http': httpURL,
    '@/lib/reservation-documents': documentURL,
  })
)
const car = repo.allVehicles().find((car) => car.availability === 'available')
const base = 'http://127.0.0.1:43117'
const date = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10)
const payload = {
  vehicleId: car.id,
  start: date(10),
  end: date(13),
  location: 'Villa 45, Al Jazzat, Sharjah',
  name: 'Upload Test',
  email: 'upload@example.invalid',
  phone: '+971545974005',
  notes: '',
}
const pdf = Buffer.from('%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF')
test('reservation API requires international phone numbers even when browser checks are bypassed', async () => {
  for (const phone of ['0501234567', '971501234567', '+0501234567', '+1', '+1234567890123456']) {
    const response = await POST(request([], { phone }))
    assert.equal(response.status, 400)
    assert.match((await response.json()).error, /country code/)
  }
  const response = await POST(request([], { phone: '+44 7700 900123' }))
  assert.equal(response.status, 201)
})
function request(files = [], overrides = {}, origin = base) {
  const form = new FormData()
  for (const [key, value] of Object.entries({ ...payload, consent: 'true', ...overrides }))
    form.set(key, value)
  files.forEach((file) => form.append('documents', file))
  return new Request(base + '/api/reservations', {
    method: 'POST',
    headers: { Origin: origin },
    body: form,
  })
}
after(async () => {
  repo.db().close()
  if (
    path.dirname(path.resolve(directory)) === path.resolve(os.tmpdir()) &&
    path.basename(directory).startsWith('zavi-document-test-')
  )
    await rm(directory, { recursive: true, force: true })
})
test('custom delivery addresses and private encrypted uploads persist atomically with the reservation', async () => {
  const response = await POST(
    request([new File([pdf], '../../passport.pdf', { type: 'application/pdf' })], {
      status: 'confirmed',
      admin: 'forged',
    }),
  )
  assert.equal(response.status, 201)
  const { id, status } = await response.json()
  assert.equal(status, 'pending')
  const saved = repo.allReservations().find((item) => item.id === id)
  assert.equal(saved.location, payload.location)
  assert.equal(saved.documents.length, 1)
  assert.equal(saved.documents[0].name, 'passport.pdf')
  const document = repo.reservationDocument(id, saved.documents[0].id)
  assert.ok(!Buffer.from(document.encrypted).includes(pdf))
  assert.deepEqual(docs.decryptDocument(document.id, document.encrypted), pdf)
  assert.equal((await readFile(path.join(directory, 'reservation-documents.key'))).length, 32)
  const count = repo.allReservations().length
  assert.equal((await POST(request([new File([pdf], 'valid.pdf')], { end: date(5) }))).status, 400)
  assert.equal(repo.allReservations().length, count)
  assert.equal(repo.db().prepare('SELECT count(*) as n FROM reservation_documents').get().n, 1)
})
test('uploads reject unrecognized content, spoofed types, oversize files, excess files and missing consent', async () => {
  const before = repo.allReservations().length
  const valid = new File([pdf], 'licence.pdf')
  const cases = [
    request([new File(['<script>alert(1)</script>'], 'photo.jpg', { type: 'image/jpeg' })]),
    request([new File([Buffer.alloc(8 * 1024 * 1024 + 1)], 'large.pdf')]),
    request([valid, valid, valid, valid, valid]),
    request([valid], { consent: 'false' }),
    request([valid], {}, 'https://untrusted.invalid'),
    request([], { location: '<script>bad</script>' }),
  ]
  for (const req of cases) assert.equal((await POST(req)).status, 400)
  assert.equal(repo.allReservations().length, before)
})
test('document download requires authentication, correct reservation ownership and attachment-only delivery', async () => {
  const reservation = repo.allReservations().find((item) => item.documents.length)
  const document = reservation.documents[0]
  const context = { params: Promise.resolve({ id: reservation.id, documentId: document.id }) }
  const req = new Request(
    base + '/api/admin/reservations/' + reservation.id + '/documents/' + document.id,
  )
  globalThis.documentTestAdmin = false
  assert.equal((await admin.GET(req, context)).status, 401)
  globalThis.documentTestAdmin = true
  assert.equal(
    (
      await admin.GET(req, {
        params: Promise.resolve({ id: 'another-reservation', documentId: document.id }),
      })
    ).status,
    404,
  )
  const download = await admin.GET(req, context)
  assert.equal(download.status, 200)
  assert.match(download.headers.get('Content-Disposition'), /^attachment;/)
  assert.equal(download.headers.get('Cache-Control'), 'private, no-store')
  assert.equal(download.headers.get('X-Content-Type-Options'), 'nosniff')
  assert.deepEqual(Buffer.from(await download.arrayBuffer()), pdf)
  assert.equal(
    (
      await admin.DELETE(
        new Request(req.url, {
          method: 'DELETE',
          headers: { Origin: 'https://untrusted.invalid' },
        }),
        context,
      )
    ).status,
    403,
  )
  assert.equal(
    (
      await admin.DELETE(
        new Request(req.url, { method: 'DELETE', headers: { Origin: base } }),
        context,
      )
    ).status,
    200,
  )
  assert.equal((await admin.GET(req, context)).status, 404)
})
test('expired attachments are inaccessible and encrypted content is authenticated', async () => {
  const [prepared] = await docs.prepareDocuments([new File([pdf], 'document.pdf')])
  const tampered = Buffer.from(prepared.encrypted)
  tampered[15] ^= 1
  assert.throws(() => docs.decryptDocument(prepared.id, tampered))
  assert.throws(() => docs.decryptDocument('another-id', prepared.encrypted))
  const reservation = repo.createReservation(payload, [prepared])
  repo
    .db()
    .prepare('UPDATE reservation_documents SET expiresAt=? WHERE id=?')
    .run('2000-01-01T00:00:00.000Z', prepared.id)
  assert.equal(repo.reservationDocument(reservation.id, prepared.id), undefined)
  assert.equal(
    repo.db().prepare('SELECT count(*) as n FROM reservation_documents WHERE id=?').get(prepared.id)
      .n,
    0,
  )
})
