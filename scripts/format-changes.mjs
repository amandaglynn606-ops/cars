import { execFileSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import prettier from 'prettier'
const files = [
  ...new Set([
    ...execFileSync('git', ['diff', '--name-only'], { encoding: 'utf8' }).trim().split('\n'),
    ...execFileSync('git', ['ls-files', '--others', '--exclude-standard'], { encoding: 'utf8' })
      .trim()
      .split('\n'),
  ]),
]
let count = 0
for (const file of files) {
  if (
    !/\.(tsx?|css|mjs|md|json)$/.test(file) ||
    file === 'package-lock.json' ||
    file.startsWith('data/')
  )
    continue
  const info = await prettier.getFileInfo(file)
  if (!info.inferredParser) continue
  const content = await readFile(file, 'utf8'),
    config = await prettier.resolveConfig(file)
  await writeFile(file, await prettier.format(content, { ...config, filepath: file }))
  count++
}
console.log('Formatted ' + count + ' changed source/documentation files.')
