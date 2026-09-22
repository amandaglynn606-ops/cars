import { requireAdmin } from '@/lib/auth'
import { requireSameOrigin, readBody, apiError } from '@/lib/http'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import sharp from 'sharp'
export async function POST(request: Request) {
  try {
    requireSameOrigin(request)
    await requireAdmin()
  } catch (e) {
    return apiError(e, 403)
  }
  try {
    if (
      !['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(
        request.headers.get('content-type') || '',
      )
    )
      throw new Error('Upload a JPEG, PNG, WebP or AVIF photograph.')
    const bytes = await readBody(request, 8 * 1024 * 1024)
    const image = sharp(bytes, { limitInputPixels: 25000000 })
    const meta = await image.metadata()
    if (
      !['jpeg', 'png', 'webp', 'avif', 'heif'].includes(meta.format || '') ||
      (meta.pages || 1) > 1
    )
      throw new Error('Upload a single raster photograph.')
    const output = await image
      .rotate()
      .resize({ width: 2000, height: 1500, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer()
    const dir = path.join(process.cwd(), '.local', 'uploads')
    await mkdir(dir, { recursive: true })
    const file = randomUUID() + '.webp'
    await writeFile(path.join(dir, file), output, { flag: 'wx' })
    return Response.json({ src: '/uploads/' + file })
  } catch (e) {
    return apiError(e)
  }
}
