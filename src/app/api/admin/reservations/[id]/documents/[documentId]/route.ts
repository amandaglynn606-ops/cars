import { requireAdmin } from '@/lib/auth'
import { reservationDocument, deleteReservationDocument } from '@/lib/db'
import { decryptDocument } from '@/lib/reservation-documents'
import { apiError, requireSameOrigin } from '@/lib/http'
type Context = { params: Promise<{ id: string; documentId: string }> }
export async function GET(_request: Request, context: Context) {
  try {
    await requireAdmin()
  } catch (error) {
    return apiError(error, 401)
  }
  const { id, documentId } = await context.params
  const document = reservationDocument(id, documentId)
  if (!document)
    return Response.json(
      { error: 'Document not found or expired.' },
      { status: 404, headers: { 'Cache-Control': 'no-store' } },
    )
  try {
    return new Response(new Uint8Array(decryptDocument(document.id, document.encrypted)), {
      headers: {
        'Content-Type': document.mime,
        'Content-Disposition': `attachment; filename="${document.name}"`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "sandbox; default-src 'none'",
        'Referrer-Policy': 'no-referrer',
      },
    })
  } catch {
    return Response.json(
      { error: 'Document could not be opened.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
export async function DELETE(request: Request, context: Context) {
  try {
    requireSameOrigin(request)
    await requireAdmin()
  } catch (error) {
    return apiError(error, 403)
  }
  const { id, documentId } = await context.params
  deleteReservationDocument(id, documentId)
  return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
}
