import 'server-only'
import { randomBytes, randomUUID, createCipheriv, createDecipheriv } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

export type PreparedDocument = {
  id: string
  name: string
  mime: string
  size: number
  encrypted: Buffer
}
export const MAX_DOCUMENT_SIZE = 8 * 1024 * 1024
export const MAX_DOCUMENTS = 4
export const DOCUMENT_RETENTION_MS = 30 * 86400000
function key() {
  const folder = process.env.ZAVI_DATA_DIR || path.join(process.cwd(), '.local')
  mkdirSync(folder, { recursive: true })
  const file = path.join(folder, 'reservation-documents.key')
  try {
    writeFileSync(file, randomBytes(32), { flag: 'wx', mode: 0o600 })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST')
      throw new Error('Document storage is unavailable.')
  }
  const value = readFileSync(file)
  if (value.length !== 32) throw new Error('Document storage is unavailable.')
  return value
}
export function documentType(bytes: Buffer): { mime: string; extension: string } | null {
  if (bytes.length < 16) return null
  if (
    bytes
      .subarray(0, 8)
      .toString('ascii')
      .match(/^%PDF-\d\.\d/) &&
    bytes.subarray(-2048).includes(Buffer.from('%%EOF'))
  )
    return { mime: 'application/pdf', extension: 'pdf' }
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    return { mime: 'image/jpeg', extension: 'jpg' }
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])))
    return { mime: 'image/png', extension: 'png' }
  if (bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP')
    return { mime: 'image/webp', extension: 'webp' }
  if (
    bytes.subarray(0, 4).equals(Buffer.from([73, 73, 42, 0])) ||
    bytes.subarray(0, 4).equals(Buffer.from([77, 77, 0, 42]))
  )
    return { mime: 'image/tiff', extension: 'tiff' }
  if (bytes.toString('ascii', 4, 8) === 'ftyp') {
    const brands = bytes.toString('ascii', 8, Math.min(bytes.length, 40))
    if (/avif|avis/.test(brands)) return { mime: 'image/avif', extension: 'avif' }
    if (/heic|heix|hevc|hevx/.test(brands)) return { mime: 'image/heic', extension: 'heic' }
    if (/mif1|msf1/.test(brands)) return { mime: 'image/heif', extension: 'heif' }
  }
  return null
}
export async function prepareDocuments(files: File[]): Promise<PreparedDocument[]> {
  if (files.length > MAX_DOCUMENTS) throw new Error('Attach no more than 4 documents.')
  const result: PreparedDocument[] = []
  for (const file of files) {
    if (!file.size || file.size > MAX_DOCUMENT_SIZE)
      throw new Error('Each document must be between 1 byte and 8 MB.')
    const bytes = Buffer.from(await file.arrayBuffer())
    const type = documentType(bytes)
    if (!type) throw new Error('Use PDF, JPEG, PNG, WebP, HEIC, HEIF, AVIF or TIFF documents.')
    const id = randomUUID()
    const base =
      file.name
        .split(/[\\/]/)
        .pop()!
        .replace(/\.[^.]+$/, '')
        .replace(/[^a-zA-Z0-9 _-]/g, '')
        .trim()
        .slice(0, 80) || 'document'
    const nonce = randomBytes(12)
    const cipher = createCipheriv('aes-256-gcm', key(), nonce)
    cipher.setAAD(Buffer.from(id))
    const encrypted = Buffer.concat([
      nonce,
      cipher.update(bytes),
      cipher.final(),
      cipher.getAuthTag(),
    ])
    result.push({
      id,
      name: base + '.' + type.extension,
      mime: type.mime,
      size: bytes.length,
      encrypted,
    })
  }
  return result
}
export function decryptDocument(id: string, value: Uint8Array) {
  const bytes = Buffer.from(value)
  const decipher = createDecipheriv('aes-256-gcm', key(), bytes.subarray(0, 12))
  decipher.setAAD(Buffer.from(id))
  decipher.setAuthTag(bytes.subarray(-16))
  return Buffer.concat([decipher.update(bytes.subarray(12, -16)), decipher.final()])
}
