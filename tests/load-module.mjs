import { readFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
export async function moduleURL(file, replacements = {}) {
  let code = stripTypeScriptTypes(await readFile(file, 'utf8'), { mode: 'strip' }).replace(
    /import ['"]server-only['"];?/g,
    '',
  )
  for (const [from, to] of Object.entries(replacements))
    code = code.replaceAll("'" + from + "'", "'" + to + "'")
  return 'data:text/javascript;base64,' + Buffer.from(code).toString('base64')
}
