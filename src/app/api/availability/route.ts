import { reservedDates, reservationStorageReady } from '@/lib/reservation-store'
export async function GET() {
  if (!reservationStorageReady())
    return Response.json(
      { error: 'Please confirm availability with Zavi on WhatsApp.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  try {
    return Response.json(await reservedDates(), { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json(
      { error: 'Availability could not be checked. Please contact Zavi.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
