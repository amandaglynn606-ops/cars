import { readFile } from 'node:fs/promises'
import path from 'node:path'
export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params
  if (!/^[0-9a-f-]{36}\.webp$/.test(file)) return new Response('Not found', { status: 404 })
  try {
    const data = await readFile(path.join(process.cwd(), '.local', 'uploads', file))
    return new Response(data, {
      headers: {
        'Content-Type': 'image/webp',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new Response('Not found', { status: 404 })
  }
}
