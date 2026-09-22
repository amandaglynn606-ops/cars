import 'server-only'
import { DatabaseSync } from 'node:sqlite'
import { mkdirSync, readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import type { Car, Reservation, ReservedDates } from './types'
import { validateCar } from './validation'
import { validDate, todayDubai } from './catalogue'
import { validatePartnership, type Partnership } from './partnership'
import type { PreparedDocument } from './reservation-documents'

const globalDB = globalThis as unknown as { zaviDB?: DatabaseSync }
export function db() {
  if (process.env.VERCEL === '1')
    throw new Error(
      'Online submissions are temporarily unavailable. Please contact Zavi on WhatsApp.',
    )
  if (globalDB.zaviDB) return globalDB.zaviDB
  const folder = process.env.ZAVI_DATA_DIR || path.join(process.cwd(), '.local')
  mkdirSync(folder, { recursive: true })
  const database = new DatabaseSync(path.join(folder, 'zavi.sqlite'))
  database.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
 CREATE TABLE IF NOT EXISTS vehicles (id TEXT PRIMARY KEY, route TEXT UNIQUE NOT NULL, data TEXT NOT NULL CHECK(json_valid(data)));
 CREATE TABLE IF NOT EXISTS vehicle_aliases (route TEXT PRIMARY KEY, vehicleId TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE);
 CREATE TABLE IF NOT EXISTS reservations (id TEXT PRIMARY KEY, vehicleId TEXT NOT NULL REFERENCES vehicles(id), start TEXT NOT NULL, end TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('pending','confirmed','cancelled')), data TEXT NOT NULL CHECK(json_valid(data)));
 CREATE TABLE IF NOT EXISTS reservation_documents (id TEXT PRIMARY KEY, reservationId TEXT NOT NULL REFERENCES reservations(id) ON DELETE CASCADE, name TEXT NOT NULL, mime TEXT NOT NULL, size INTEGER NOT NULL, expiresAt TEXT NOT NULL, encrypted BLOB NOT NULL);
 CREATE INDEX IF NOT EXISTS reservation_overlap ON reservations(vehicleId,status,start,end);
 CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS partnerships (id TEXT PRIMARY KEY, createdAt TEXT NOT NULL, data TEXT NOT NULL CHECK(json_valid(data)));
 CREATE TABLE IF NOT EXISTS audit_events (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp TEXT NOT NULL, action TEXT NOT NULL, entityId TEXT NOT NULL, details TEXT NOT NULL);`)
  if (!database.prepare("SELECT value FROM settings WHERE key='seeded'").get()) {
    const cars = JSON.parse(
      readFileSync(path.join(process.cwd(), 'data/fleet.json'), 'utf8'),
    ) as Car[]
    database.exec('BEGIN IMMEDIATE')
    try {
      const insert = database.prepare('INSERT INTO vehicles(id,route,data) VALUES(?,?,?)')
      for (const raw of cars) {
        const c = validateCar(raw)
        insert.run(c.id, c.brandSlug + '/' + c.modelSlug, JSON.stringify(c))
      }
      database
        .prepare('INSERT INTO settings(key,value) VALUES(?,?)')
        .run('seeded', new Date().toISOString())
      database.exec('COMMIT')
    } catch (e) {
      database.exec('ROLLBACK')
      database.close()
      throw e
    }
  }
  removeVehicleDescriptions(database)
  globalDB.zaviDB = database
  return database
}
export function removeVehicleDescriptions(database: DatabaseSync) {
  database.exec('BEGIN IMMEDIATE')
  try {
    const timestamp = new Date().toISOString()
    const result = database
      .prepare(
        `
      UPDATE vehicles
      SET data = json_set(json_remove(data, '$.description'),
        '$.revision', COALESCE(json_extract(data, '$.revision'), 0) + 1,
        '$.updatedAt', ?)
      WHERE json_type(data, '$.description') IS NOT NULL
    `,
      )
      .run(timestamp)
    if (result.changes)
      recordAudit(database, 'content.descriptions_removed', 'fleet', {
        vehicles: Number(result.changes),
      })
    database.exec('COMMIT')
    return Number(result.changes)
  } catch (error) {
    database.exec('ROLLBACK')
    throw error
  }
}
export function allVehicles(includeDrafts = false): Car[] {
  // Vercel functions have no persistent writable disk. The published catalogue
  // is bundled with the deployment; never create a temporary customer database.
  if (process.env.VERCEL === '1') {
    const seed = JSON.parse(readFileSync(path.join(process.cwd(), 'data/fleet.json'), 'utf8'))
    return (seed as Car[])
      .map(validateCar)
      .filter((car) => includeDrafts || car.publicationStatus === 'published')
  }
  return (db().prepare('SELECT data FROM vehicles').all() as { data: string }[])
    .map((r) => JSON.parse(r.data) as Car)
    .filter((c) => includeDrafts || c.publicationStatus === 'published')
}
export const reservedDates = (): ReservedDates[] =>
  db()
    .prepare("SELECT vehicleId,start,end FROM reservations WHERE status='confirmed'")
    .all() as unknown as ReservedDates[]
export function purgeExpiredDocuments() {
  db()
    .prepare('DELETE FROM reservation_documents WHERE expiresAt <= ?')
    .run(new Date().toISOString())
}
export function allReservations(): Reservation[] {
  purgeExpiredDocuments()
  return (
    db().prepare('SELECT data FROM reservations ORDER BY start DESC').all() as { data: string }[]
  ).map((row) => {
    const reservation = JSON.parse(row.data) as Reservation
    reservation.documents = db()
      .prepare(
        'SELECT id,name,mime,size,expiresAt FROM reservation_documents WHERE reservationId=?',
      )
      .all(reservation.id) as NonNullable<Reservation['documents']>
    return reservation
  })
}
export function reservationDocument(reservationId: string, documentId: string) {
  purgeExpiredDocuments()
  return db()
    .prepare(
      'SELECT id,name,mime,size,encrypted FROM reservation_documents WHERE reservationId=? AND id=?',
    )
    .get(reservationId, documentId) as
    { id: string; name: string; mime: string; size: number; encrypted: Uint8Array } | undefined
}
export function deleteReservationDocument(reservationId: string, documentId: string) {
  db()
    .prepare('DELETE FROM reservation_documents WHERE reservationId=? AND id=?')
    .run(reservationId, documentId)
}
export function createPartnership(value: unknown) {
  const enquiry: Partnership = {
    ...validatePartnership(value),
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  }
  db()
    .prepare('INSERT INTO partnerships(id,createdAt,data) VALUES(?,?,?)')
    .run(enquiry.id, enquiry.createdAt, JSON.stringify(enquiry))
  return { id: enquiry.id }
}
export function allPartnerships(): Partnership[] {
  return (
    db().prepare('SELECT data FROM partnerships ORDER BY createdAt DESC LIMIT 500').all() as {
      data: string
    }[]
  ).map((row) => JSON.parse(row.data))
}
const recordAudit = (
  database: DatabaseSync,
  action: string,
  id: string,
  details: Record<string, unknown> = {},
) =>
  database
    .prepare('INSERT INTO audit_events(timestamp,action,entityId,details) VALUES(?,?,?,?)')
    .run(new Date().toISOString(), action, id, JSON.stringify(details))
export const auditEvents = () =>
  db()
    .prepare(
      'SELECT timestamp,action,entityId,details FROM audit_events ORDER BY id DESC LIMIT 1000',
    )
    .all()
export function saveVehicle(value: unknown) {
  const c = validateCar(value)
  for (const image of c.images) {
    const file = image.src.startsWith('/uploads/')
      ? path.join(process.cwd(), '.local', image.src)
      : path.join(process.cwd(), 'public', image.src)
    if (!existsSync(file)) throw new Error('A gallery image does not exist on this server.')
  }
  const database = db()
  database.exec('BEGIN IMMEDIATE')
  try {
    const existing = database.prepare('SELECT data FROM vehicles WHERE id=?').get(c.id) as
      { data: string } | undefined
    const previous = existing ? (JSON.parse(existing.data) as Car) : undefined
    if (previous && previous.revision !== c.revision)
      throw new Error('This vehicle changed. Reload it before saving.')
    if (previous && previous.slug !== c.slug)
      throw new Error('The legacy listing identifier is permanent.')
    const newRoute = c.brandSlug + '/' + c.modelSlug
    const occupied = database
      .prepare('SELECT id FROM vehicles WHERE route=? AND id<>?')
      .get(newRoute, c.id)
    const reserved = database
      .prepare('SELECT vehicleId FROM vehicle_aliases WHERE route=? AND vehicleId<>?')
      .get(newRoute, c.id)
    if (occupied || reserved) throw new Error('This vehicle URL is already in use.')
    if (previous && previous.brandSlug + '/' + previous.modelSlug !== newRoute)
      database
        .prepare('INSERT OR IGNORE INTO vehicle_aliases(route,vehicleId) VALUES(?,?)')
        .run(previous.brandSlug + '/' + previous.modelSlug, c.id)
    c.revision = (previous?.revision || 0) + 1
    c.updatedAt = new Date().toISOString()
    const data = {
      ...c,
      pricePerDay: c.pricing.daily,
      originalPrice: c.pricing.dailyWas,
      currency: 'AED',
      weeklyRate: c.pricing.weekly ?? null,
      monthlyRate: c.pricing.monthly,
    }
    database
      .prepare(
        'INSERT INTO vehicles(id,route,data) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET route=excluded.route,data=excluded.data',
      )
      .run(c.id, newRoute, JSON.stringify(data))
    recordAudit(database, previous ? 'vehicle.updated' : 'vehicle.created', c.id, {
      revision: c.revision,
      fields: Object.keys(c).filter(
        (k) => JSON.stringify(previous?.[k as keyof Car]) !== JSON.stringify(c[k as keyof Car]),
      ),
    })
    database.exec('COMMIT')
    return c
  } catch (e) {
    database.exec('ROLLBACK')
    throw e
  }
}
export function deleteVehicle(id: string) {
  const database = db()
  database.exec('BEGIN IMMEDIATE')
  try {
    if (database.prepare('SELECT id FROM reservations WHERE vehicleId=? LIMIT 1').get(id))
      throw new Error('This vehicle has reservation history. Unpublish it instead.')
    const result = database.prepare('DELETE FROM vehicles WHERE id=?').run(id)
    if (!result.changes) throw new Error('Vehicle not found.')
    recordAudit(database, 'vehicle.deleted', id)
    database.exec('COMMIT')
  } catch (e) {
    database.exec('ROLLBACK')
    throw e
  }
}
export function prepareReservation(value: unknown): Reservation {
  if (!value || typeof value !== 'object') throw new Error('Reservation details are required.')
  const v = value as Record<string, unknown>
  for (const field of ['vehicleId', 'start', 'end', 'location', 'name', 'email', 'phone', 'notes'])
    if (
      typeof v[field] !== 'string' ||
      (v[field] as string).length > (field === 'notes' ? 1000 : 200)
    )
      throw new Error('Invalid reservation details.')
  const r = {
    vehicleId: v.vehicleId,
    start: v.start,
    end: v.end,
    location: (v.location as string).trim(),
    name: (v.name as string).trim(),
    email: (v.email as string).trim(),
    phone: (v.phone as string).trim(),
    notes: v.notes,
    id: randomUUID(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  } as Reservation
  if (
    !validDate(r.start) ||
    !validDate(r.end) ||
    r.start < todayDubai() ||
    r.end <= r.start ||
    Date.parse(r.end) - Date.parse(r.start) > 366 * 86400000
  )
    throw new Error(
      'Choose valid future dates, with return after collection and a duration under one year.',
    )
  if (!/^\+[1-9](?:[ ()-]*[0-9]){7,14}$/.test(r.phone))
    throw new Error(
      'Enter your phone number with + and a country code, for example +971 50 123 4567.',
    )
  if (!r.name.trim() || !/^\S+@\S+\.\S+$/.test(r.email))
    throw new Error('Enter your name and a valid email.')
  if (r.location.length < 5 || /[\x00-\x1f<>]/.test(r.location))
    throw new Error('Enter a delivery address with the emirate, neighbourhood and property.')
  return r
}
export function createReservation(value: unknown, documents: PreparedDocument[] = []) {
  const r = prepareReservation(value)
  const database = db()
  database.exec('BEGIN IMMEDIATE')
  try {
    const row = database.prepare('SELECT data FROM vehicles WHERE id=?').get(r.vehicleId) as
      { data: string } | undefined
    const car = row ? (JSON.parse(row.data) as Car) : undefined
    if (!car || car.publicationStatus !== 'published' || car.availability !== 'available')
      throw new Error('This vehicle is not accepting reservations.')
    if (r.location.length < 5 || /[\x00-\x1f<>]/.test(r.location))
      throw new Error('Enter a delivery address with the emirate, neighbourhood and property.')
    if (
      database
        .prepare(
          "SELECT id FROM reservations WHERE vehicleId=? AND status='confirmed' AND start<? AND end>? LIMIT 1",
        )
        .get(r.vehicleId, r.end, r.start)
    )
      throw new Error(
        'This vehicle is reserved for those dates. Please choose another vehicle or dates.',
      )
    database
      .prepare('INSERT INTO reservations(id,vehicleId,start,end,status,data) VALUES(?,?,?,?,?,?)')
      .run(r.id, r.vehicleId, r.start, r.end, r.status, JSON.stringify(r))
    database
      .prepare('DELETE FROM reservation_documents WHERE expiresAt <= ?')
      .run(new Date().toISOString())
    const stored = database
      .prepare('SELECT COALESCE(SUM(size),0) AS total FROM reservation_documents')
      .get() as { total: number }
    if (
      documents.length > 4 ||
      stored.total + documents.reduce((sum, item) => sum + item.size, 0) > 512 * 1024 * 1024
    )
      throw new Error(
        'Document storage is currently full. Submit without attachments and contact the team.',
      )
    const expiresAt = new Date(Date.now() + 30 * 86400000).toISOString()
    for (const item of documents)
      database
        .prepare(
          'INSERT INTO reservation_documents(id,reservationId,name,mime,size,expiresAt,encrypted) VALUES(?,?,?,?,?,?,?)',
        )
        .run(item.id, r.id, item.name, item.mime, item.size, expiresAt, item.encrypted)
    recordAudit(database, 'reservation.requested', r.id, {
      vehicleId: r.vehicleId,
      documents: documents.length,
    })
    database.exec('COMMIT')
    return { id: r.id, status: r.status }
  } catch (e) {
    database.exec('ROLLBACK')
    throw e
  }
}
export function updateReservation(id: string, status: string) {
  if (!['confirmed', 'cancelled'].includes(status)) throw new Error('Invalid reservation action.')
  const database = db()
  database.exec('BEGIN IMMEDIATE')
  try {
    const row = database.prepare('SELECT data FROM reservations WHERE id=?').get(id) as
      { data: string } | undefined
    if (!row) throw new Error('Reservation not found.')
    const r = JSON.parse(row.data) as Reservation
    if (status === 'confirmed') {
      const vehicle = database.prepare('SELECT data FROM vehicles WHERE id=?').get(r.vehicleId) as
        { data: string } | undefined
      const car = vehicle ? (JSON.parse(vehicle.data) as Car) : undefined
      if (!car || car.availability !== 'available' || car.publicationStatus !== 'published')
        throw new Error('Vehicle must be published and available before confirmation.')
      if (
        database
          .prepare(
            "SELECT id FROM reservations WHERE vehicleId=? AND status='confirmed' AND id<>? AND start<? AND end>? LIMIT 1",
          )
          .get(r.vehicleId, id, r.end, r.start)
      )
        throw new Error('A confirmed reservation already overlaps these dates.')
    }
    r.status = status as Reservation['status']
    database
      .prepare('UPDATE reservations SET status=?,data=? WHERE id=?')
      .run(status, JSON.stringify(r), id)
    recordAudit(database, 'reservation.' + status, r.id, { vehicleId: r.vehicleId })
    database.exec('COMMIT')
  } catch (e) {
    database.exec('ROLLBACK')
    throw e
  }
}
