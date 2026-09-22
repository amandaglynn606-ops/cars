import { createReservation, reservationStorageReady } from '@/lib/reservation-store'
import { requireSameOrigin, readJSON, readBody, rateLimit, apiError } from '@/lib/http'
import { prepareDocuments } from '@/lib/reservation-documents'
export async function POST(request: Request) {
  try {
    requireSameOrigin(request)
    if (!reservationStorageReady())
      return Response.json(
        { error: 'Online reservations are temporarily unavailable. Please enquire on WhatsApp.' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } },
      )
    rateLimit('public-reservations', 30, 10 * 60000)
    let value: unknown
    let documents: Awaited<ReturnType<typeof prepareDocuments>> = []
    if (request.headers.get('content-type')?.startsWith('multipart/form-data')) {
      const bytes = await readBody(request, (process.env.VERCEL === '1' ? 4 : 33) * 1024 * 1024)
      const form = await new Response(bytes as BodyInit, {
        headers: { 'Content-Type': request.headers.get('content-type')! },
      }).formData()
      if (form.get('consent') !== 'true')
        throw new Error('Please agree to the use of your reservation details and documents.')
      value = Object.fromEntries(
        ['vehicleId', 'start', 'end', 'location', 'name', 'email', 'phone', 'notes'].map((key) => [
          key,
          form.get(key) || '',
        ]),
      )
      const files = form.getAll('documents')
      if (files.some((file) => !(file instanceof File))) throw new Error('Invalid document upload.')
      if (
        process.env.VERCEL === '1' &&
        (files as File[]).reduce((size, file) => size + file.size, 0) > 3 * 1024 * 1024
      )
        throw new Error('Attach up to 4 documents with a combined size of no more than 3 MB.')
      documents = await prepareDocuments(files as File[])
    } else value = await readJSON(request, 5000)
    return Response.json(await createReservation(value, documents), {
      status: 201,
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (e) {
    return apiError(e)
  }
}
