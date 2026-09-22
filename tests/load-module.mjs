import { readFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
export async function moduleURL(file, replacements = {}) {
  let code = stripTypeScriptTypes(await readFile(file, 'utf8'), { mode: 'strip' }).replace(
    /import ['"]server-only['"];?/g,
    '',
  )
  for (const [from, to] of Object.entries(replacements))
    code = code.replaceAll("'" + from + "'", "'" + to + "'")
  return 'data:text/javascript;base64,' + Buffer.from(code).toString('base64')
}
export const reservationStoreURL = (
  repoURL,
  driverURL = pathToFileURL(
    createRequire(import.meta.url)
      .resolve('@neondatabase/serverless')
      .replace(/index\.js$/, 'index.mjs'),
  ).href,
) =>
  moduleURL('src/lib/reservation-store.ts', {
    './db': repoURL,
    '@neondatabase/serverless': driverURL,
  })
