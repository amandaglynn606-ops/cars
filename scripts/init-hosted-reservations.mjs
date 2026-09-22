import { randomBytes, scryptSync } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const configPath = '.local/hosted-reservations.env'
const passwordPath = '.local/hosted-admin-password.txt'
await mkdir('.local', { recursive: true })
if (existsSync(configPath) || existsSync(passwordPath)) {
  console.log('Hosted credentials already exist; no keys or passwords were changed.')
  process.exit(0)
}
const password = randomBytes(24).toString('base64url')
const salt = randomBytes(32).toString('hex')
const auth = {
  salt,
  hash: scryptSync(password, salt, 64).toString('hex'),
  secret: randomBytes(48).toString('hex'),
}
await writeFile(
  configPath,
  'ZAVI_DOCUMENT_KEY=' +
    randomBytes(32).toString('hex') +
    '\nZAVI_ADMIN_AUTH=' +
    JSON.stringify(auth) +
    '\n',
  { mode: 0o600, flag: 'wx' },
)
await writeFile(passwordPath, password + '\n', { mode: 0o600, flag: 'wx' })
console.log(
  'Private deployment settings saved to .local/hosted-reservations.env; administrator password saved to .local/hosted-admin-password.txt. Values were not printed. Keep both files private.',
)
