import { reservedDates } from '@/lib/db'
export async function GET() {
  return Response.json(reservedDates(), { headers: { 'Cache-Control': 'no-store' } })
}
