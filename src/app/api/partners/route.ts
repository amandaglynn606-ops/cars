import { createPartnership } from '@/lib/db'
import { requireSameOrigin, readJSON, rateLimit, apiError } from '@/lib/http'
export async function POST(request: Request) {
  try {
    requireSameOrigin(request)
    rateLimit('public-partnerships', 30, 10 * 60000)
    return Response.json(createPartnership(await readJSON(request, 16000)), {
      status: 201,
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    return apiError(error)
  }
}
