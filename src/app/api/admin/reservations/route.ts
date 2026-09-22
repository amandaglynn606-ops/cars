import { requireAdmin } from '@/lib/auth'
import { allReservations, updateReservation } from '@/lib/reservation-store'
import { requireSameOrigin, readJSON, apiError } from '@/lib/http'
export async function GET() {
  try {
    await requireAdmin()
    return Response.json(await allReservations(), { headers: { 'Cache-Control': 'no-store' } })
  } catch (e) {
    return apiError(e, 401)
  }
}
export async function PATCH(request: Request) {
  try {
    requireSameOrigin(request)
    await requireAdmin()
  } catch (e) {
    return apiError(e, 403)
  }
  try {
    const v = (await readJSON(request, 2000)) as { id?: unknown; status?: unknown }
    if (typeof v.id !== 'string' || typeof v.status !== 'string')
      throw new Error('Invalid reservation action.')
    await updateReservation(v.id, v.status)
    return Response.json({ ok: true })
  } catch (e) {
    return apiError(e)
  }
}
