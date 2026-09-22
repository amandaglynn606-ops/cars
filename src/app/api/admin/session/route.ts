import { cookies } from 'next/headers'
import { verifyPassword, signSession } from '@/lib/auth'
import { requireSameOrigin, readJSON, rateLimit, apiError } from '@/lib/http'
export async function POST(request: Request) {
  try {
    requireSameOrigin(request)
    rateLimit('admin-login', 8, 15 * 60000)
    const value = (await readJSON(request, 2000)) as { password?: unknown }
    if (
      typeof value.password !== 'string' ||
      value.password.length > 256 ||
      !verifyPassword(value.password)
    )
      return Response.json({ error: 'Invalid administrator password.' }, { status: 401 })
    ;(await cookies()).set('zavi-admin', signSession(), {
      httpOnly: true,
      sameSite: 'strict',
      secure: new URL(request.url).protocol === 'https:',
      path: '/',
      maxAge: 8 * 3600,
    })
    return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e) {
    return apiError(e, 403)
  }
}
export async function DELETE(request: Request) {
  try {
    requireSameOrigin(request)
    ;(await cookies()).delete('zavi-admin')
    return Response.json({ ok: true })
  } catch (e) {
    return apiError(e, 403)
  }
}
