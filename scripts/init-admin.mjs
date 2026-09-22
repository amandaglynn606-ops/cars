import { randomBytes, scryptSync } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
await mkdir('.local', { recursive: true })
if (existsSync('.local/admin-auth.json')) {
  console.log('Administrator access already exists; credentials were not changed.')
  process.exit(0)
}
const password = randomBytes(24).toString('base64url')
const salt = randomBytes(32).toString('hex')
await writeFile(
  '.local/admin-auth.json',
  JSON.stringify({
    salt,
    hash: scryptSync(password, salt, 64).toString('hex'),
    secret: randomBytes(48).toString('hex'),
  }),
  { mode: 0o600, flag: 'wx' },
)
await writeFile('.local/admin-password.txt', password + '\n', { mode: 0o600, flag: 'wx' })
console.log(
  'Administrator initialized. Local password: .local/admin-password.txt (not printed or sent to the browser).',
)
