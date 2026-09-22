import 'server-only'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { scryptSync, timingSafeEqual, createHmac, randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
type AuthConfig = { salt: string; hash: string; secret: string }
const config = (): AuthConfig | null => {
  if (process.env.ZAVI_ADMIN_AUTH) {
    try {
      const value = JSON.parse(process.env.ZAVI_ADMIN_AUTH) as AuthConfig
      return /^[a-f0-9]{64}$/i.test(value.salt) &&
        /^[a-f0-9]{128}$/i.test(value.hash) &&
        /^[a-f0-9]{96}$/i.test(value.secret)
        ? value
        : null
    } catch {
      return null
    }
  }
  if (process.env.VERCEL === '1') return null
  const file = path.join(process.cwd(), '.local', 'admin-auth.json')
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null
}
export function verifyPassword(password: string) {
  const auth = config()
  if (!auth) return false
  const digest = scryptSync(password, auth.salt, 64)
  return timingSafeEqual(digest, Buffer.from(auth.hash, 'hex'))
}
export function signSession() {
  const auth = config()
  if (!auth) throw new Error('Administrator access has not been initialized.')
  const payload = Buffer.from(
    JSON.stringify({ expires: Date.now() + 8 * 3600000, nonce: randomBytes(16).toString('hex') }),
  ).toString('base64url')
  return payload + '.' + createHmac('sha256', auth.secret).update(payload).digest('base64url')
}
export async function isAdmin() {
  const token = (await cookies()).get('zavi-admin')?.value
  const auth = config()
  if (!token || !auth) return false
  const [payload, signature, ...extra] = token.split('.')
  if (!payload || !signature || extra.length) return false
  const expected = createHmac('sha256', auth.secret).update(payload).digest()
  const actual = Buffer.from(signature, 'base64url')
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    return typeof data.expires === 'number' && data.expires > Date.now()
  } catch {
    return false
  }
}
export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error('Administrator sign-in required.')
}
