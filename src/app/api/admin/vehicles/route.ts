import { requireAdmin } from '@/lib/auth'
import { allVehicles, saveVehicle, deleteVehicle } from '@/lib/db'
import { requireSameOrigin, readJSON, apiError } from '@/lib/http'
export async function GET() {
  try {
    await requireAdmin()
    return Response.json(allVehicles(true), { headers: { 'Cache-Control': 'no-store' } })
  } catch (e) {
    return apiError(e, 401)
  }
}
export async function PUT(request: Request) {
  try {
    requireSameOrigin(request)
    await requireAdmin()
  } catch (e) {
    return apiError(e, 403)
  }
  try {
    return Response.json(saveVehicle(await readJSON(request)))
  } catch (e) {
    return apiError(e)
  }
}
export async function DELETE(request: Request) {
  try {
    requireSameOrigin(request)
    await requireAdmin()
  } catch (e) {
    return apiError(e, 403)
  }
  try {
    const body = (await readJSON(request, 1000)) as { id?: unknown }
    if (typeof body.id !== 'string') throw new Error('Vehicle ID required.')
    deleteVehicle(body.id)
    return Response.json({ ok: true })
  } catch (e) {
    return apiError(e)
  }
}
