import { requireAdmin } from '@/lib/auth'
import { auditEvents } from '@/lib/db'
import { apiError } from '@/lib/http'
export async function GET() {
  try {
    await requireAdmin()
    return Response.json(auditEvents(), {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Disposition': 'attachment; filename="zavi-activity.json"',
      },
    })
  } catch (e) {
    return apiError(e, 401)
  }
}
