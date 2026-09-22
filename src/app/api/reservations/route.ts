import { createReservation } from '@/lib/db'
import { requireSameOrigin, readJSON, readBody, rateLimit, apiError } from '@/lib/http'
import { prepareDocuments } from '@/lib/reservation-documents'
export async function POST(request: Request) {
  try {
    requireSameOrigin(request)
    rateLimit('public-reservations', 30, 10 * 60000)
    let value: unknown
    let documents: Awaited<ReturnType<typeof prepareDocuments>> = []
    if (request.headers.get('content-type')?.startsWith('multipart/form-data')) {
      const bytes = await readBody(request, 33 * 1024 * 1024)
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
      documents = await prepareDocuments(files as File[])
    } else value = await readJSON(request, 5000)
    return Response.json(createReservation(value, documents), {
      status: 201,
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (e) {
    return apiError(e)
  }
}
