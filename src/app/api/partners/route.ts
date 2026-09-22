import { createPartnership } from '@/lib/db'
import { requireSameOrigin, readJSON, rateLimit, apiError } from '@/lib/http'
export async function POST(request: Request) {
  try {
    requireSameOrigin(request)
    if (process.env.VERCEL === '1')
      return Response.json(
        {
          error:
            'Online applications are temporarily unavailable. Please contact Zavi on WhatsApp.',
        },
        { status: 503, headers: { 'Cache-Control': 'no-store' } },
      )
    rateLimit('public-partnerships', 30, 10 * 60000)
    return Response.json(createPartnership(await readJSON(request, 16000)), {
      status: 201,
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    return apiError(error)
  }
}
