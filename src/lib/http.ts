import 'server-only'
import { siteConfig } from './config'
export function requireSameOrigin(request: Request) {
  const origin = request.headers.get('origin')
  const allowed = new Set([
    new URL(siteConfig.url).origin,
    'http://127.0.0.1:43117',
    'http://localhost:43117',
  ])
  if (!origin || !allowed.has(origin)) throw new Error('Request origin is not allowed.')
}
export async function readBody(request: Request, limit = 100000): Promise<Uint8Array> {
  if (Number(request.headers.get('content-length') || 0) > limit)
    throw new Error('Request is too large.')
  const reader = request.body?.getReader()
  if (!reader) throw new Error('Request body is required.')
  let total = 0
  const chunks: Uint8Array[] = []
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > limit) {
      await reader.cancel()
      throw new Error('Request is too large.')
    }
    chunks.push(value)
  }
  const output = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    output.set(chunk, offset)
    offset += chunk.byteLength
  }
  return output
}
export async function readJSON(request: Request, limit = 100000): Promise<unknown> {
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    throw new Error('Expected JSON.')
  return JSON.parse(new TextDecoder().decode(await readBody(request, limit)))
}
const buckets = new Map<string, { count: number; until: number }>()
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  if (buckets.size > 1000) for (const [k, b] of buckets) if (b.until < now) buckets.delete(k)
  const old = buckets.get(key),
    bucket = old && old.until > now ? old : { count: 0, until: now + windowMs }
  bucket.count++
  buckets.set(key, bucket)
  if (bucket.count > limit) throw new Error('Too many attempts. Please try again later.')
}
export const apiError = (error: unknown, status = 400) =>
  Response.json(
    {
      error:
        error instanceof Error && !/SQLITE|UNIQUE constraint|FOREIGN KEY/i.test(error.message)
          ? error.message
          : 'The record could not be saved. Check for duplicate vehicle URLs.',
    },
    { status, headers: { 'Cache-Control': 'no-store' } },
  )
