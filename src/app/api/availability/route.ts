import { reservedDates } from '@/lib/db'
export async function GET() {
  if (process.env.VERCEL === '1')
    return Response.json(
      { error: 'Please confirm availability with Zavi on WhatsApp.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  return Response.json(reservedDates(), { headers: { 'Cache-Control': 'no-store' } })
}
