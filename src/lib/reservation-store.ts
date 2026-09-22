import 'server-only'
import { neon } from '@neondatabase/serverless'
import * as local from './db'
import type { Reservation, ReservedDates } from './types'
import type { PreparedDocument } from './reservation-documents'

const hosted = () => process.env.VERCEL === '1'
export const reservationStorageReady = () =>
  !hosted() || Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL)
const storageError = () =>
  new Error('Your reservation could not be saved. Please try again later or contact Zavi.')
let schema: Promise<unknown> | undefined
async function database() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!url) throw storageError()
  const sql = neon(url, { fetchOptions: { signal: AbortSignal.timeout(15000) } })
  if (!schema) {
    schema = sql
      .transaction([
        sql.query(`CREATE TABLE IF NOT EXISTS zavi_reservations (
        id uuid PRIMARY KEY, vehicle_id text NOT NULL, starts date NOT NULL,
        ends date NOT NULL CHECK(ends > starts),
        status text NOT NULL CHECK(status IN ('pending','confirmed','cancelled')),
        data jsonb NOT NULL)`),
        sql.query(
          `CREATE INDEX IF NOT EXISTS zavi_reservation_dates ON zavi_reservations(vehicle_id,status,starts,ends)`,
        ),
        sql.query(`CREATE TABLE IF NOT EXISTS zavi_reservation_documents (
        id uuid PRIMARY KEY, reservation_id uuid NOT NULL REFERENCES zavi_reservations(id) ON DELETE CASCADE,
        name text NOT NULL, mime text NOT NULL, size integer NOT NULL CHECK(size > 0),
        expires_at timestamptz NOT NULL, encrypted text NOT NULL)`),
      ])
      .catch(() => {
        schema = undefined
        throw storageError()
      })
  }
  await schema
  return sql
}

export async function createReservation(value: unknown, documents: PreparedDocument[] = []) {
  if (!hosted()) return local.createReservation(value, documents)
  const r = local.prepareReservation(value)
  const car = local.allVehicles().find((car) => car.id === r.vehicleId)
  if (!car || car.availability !== 'available')
    throw new Error('This vehicle is not accepting reservations.')
  const bytes = documents.reduce((sum, doc) => sum + doc.size, 0)
  if (documents.length > 4 || bytes > 3 * 1024 * 1024)
    throw new Error('Attach up to 4 documents with a combined size of no more than 3 MB.')
  const sql = await database()
  const expiry = new Date(Date.now() + 30 * 86400000).toISOString()
  let rows
  try {
    rows = await sql.transaction([
      sql.query('SELECT pg_advisory_xact_lock(971545974005)'),
      sql.query('DELETE FROM zavi_reservation_documents WHERE expires_at <= now()'),
      sql.query(
        `WITH saved AS (
        INSERT INTO zavi_reservations(id,vehicle_id,starts,ends,status,data)
        SELECT $1::uuid,$2,$3::date,$4::date,'pending',$5::jsonb
        WHERE NOT EXISTS (SELECT 1 FROM zavi_reservations WHERE vehicle_id=$2 AND status='confirmed' AND starts<$4::date AND ends>$3::date)
          AND (SELECT COALESCE(SUM(size),0) FROM zavi_reservation_documents)+$6::bigint <= 536870912
        RETURNING id
      ), attachments AS (
        INSERT INTO zavi_reservation_documents(id,reservation_id,name,mime,size,expires_at,encrypted)
        SELECT d.id::uuid,saved.id,d.name,d.mime,d.size,$7::timestamptz,d.encrypted
        FROM saved CROSS JOIN jsonb_to_recordset($8::jsonb) AS d(id text,name text,mime text,size integer,encrypted text)
      ) SELECT id FROM saved`,
        [
          r.id,
          r.vehicleId,
          r.start,
          r.end,
          JSON.stringify(r),
          bytes,
          expiry,
          JSON.stringify(
            documents.map((doc) => ({ ...doc, encrypted: doc.encrypted.toString('base64') })),
          ),
        ],
      ),
    ])
  } catch {
    throw storageError()
  }
  if (!rows[2].length)
    throw new Error(
      'This request could not be saved. Check availability with Zavi or try without attachments.',
    )
  return { id: r.id, status: r.status }
}

export async function allReservations(): Promise<Reservation[]> {
  if (!hosted()) return local.allReservations()
  const sql = await database()
  try {
    const rows = await sql.transaction([
      sql.query('DELETE FROM zavi_reservation_documents WHERE expires_at <= now()'),
      sql.query(
        `SELECT r.data, COALESCE((SELECT jsonb_agg(jsonb_build_object('id',d.id,'name',d.name,'mime',d.mime,'size',d.size,'expiresAt',d.expires_at)) FROM zavi_reservation_documents d WHERE d.reservation_id=r.id),'[]'::jsonb) AS documents FROM zavi_reservations r ORDER BY r.starts DESC LIMIT 1000`,
      ),
    ])
    return rows[1].map((row) => ({ ...row.data, documents: row.documents }) as Reservation)
  } catch {
    throw storageError()
  }
}

export async function reservedDates(): Promise<ReservedDates[]> {
  if (!hosted()) return local.reservedDates()
  const sql = await database()
  try {
    return (await sql.query(
      `SELECT vehicle_id AS "vehicleId", starts::text AS start, ends::text AS end FROM zavi_reservations WHERE status='confirmed'`,
    )) as ReservedDates[]
  } catch {
    throw storageError()
  }
}

export async function updateReservation(id: string, status: string) {
  if (!hosted()) return local.updateReservation(id, status)
  if (!/^[0-9a-f-]{36}$/i.test(id) || !['confirmed', 'cancelled'].includes(status))
    throw new Error('Invalid reservation action.')
  const sql = await database()
  const available = local
    .allVehicles()
    .filter((car) => car.availability === 'available')
    .map((car) => car.id)
  let rows
  try {
    rows = await sql.transaction([
      sql.query('SELECT pg_advisory_xact_lock(971545974005)'),
      sql.query(
        `UPDATE zavi_reservations r SET status=$2,data=jsonb_set(data,'{status}',to_jsonb($2::text))
        WHERE id=$1::uuid AND ($2='cancelled' OR (vehicle_id=ANY($3::text[]) AND NOT EXISTS (
          SELECT 1 FROM zavi_reservations other WHERE other.id<>r.id AND other.vehicle_id=r.vehicle_id AND other.status='confirmed' AND other.starts<r.ends AND other.ends>r.starts
        ))) RETURNING id`,
        [id, status, available],
      ),
    ])
  } catch {
    throw storageError()
  }
  if (!rows[1].length)
    throw new Error('Reservation not found, vehicle unavailable, or confirmed dates overlap.')
}

export async function reservationDocument(reservationId: string, documentId: string) {
  if (!hosted()) return local.reservationDocument(reservationId, documentId)
  if (![reservationId, documentId].every((id) => /^[0-9a-f-]{36}$/i.test(id))) return undefined
  const sql = await database()
  try {
    const rows = await sql.query(
      'SELECT id,name,mime,size,encrypted FROM zavi_reservation_documents WHERE reservation_id=$1::uuid AND id=$2::uuid AND expires_at>now()',
      [reservationId, documentId],
    )
    const row = rows[0]
    return row
      ? {
          id: String(row.id),
          name: String(row.name),
          mime: String(row.mime),
          size: Number(row.size),
          encrypted: Buffer.from(row.encrypted, 'base64'),
        }
      : undefined
  } catch {
    throw storageError()
  }
}

export async function deleteReservationDocument(reservationId: string, documentId: string) {
  if (!hosted()) return local.deleteReservationDocument(reservationId, documentId)
  if (![reservationId, documentId].every((id) => /^[0-9a-f-]{36}$/i.test(id)))
    throw new Error('Invalid document reference.')
  const sql = await database()
  try {
    await sql.query(
      'DELETE FROM zavi_reservation_documents WHERE reservation_id=$1::uuid AND id=$2::uuid',
      [reservationId, documentId],
    )
  } catch {
    throw storageError()
  }
}
