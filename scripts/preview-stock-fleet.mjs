import { readFile, writeFile, mkdir, stat } from 'node:fs/promises'
import sharp from 'sharp'
import { createHash } from 'node:crypto'
const root = process.argv.includes('--no-credit')
  ? '.local/stock-no-credit'
  : '.local/stock-research'
await mkdir(root + '/thumbs', { recursive: true })
await mkdir(root + '/sheets', { recursive: true })
const inventory = JSON.parse(await readFile(root + '/inventory.json', 'utf8'))
const start = Number(process.argv[2] || 0),
  end = Number(process.argv[3] || inventory.length)
const full = process.argv[4] === 'full'
const selected =
  process.argv[5] && process.argv[5] !== 'all' ? process.argv[5].split(',') : undefined
const fresh = process.argv[6] === 'fresh'
const escape = (s) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c],
  )
let stopped = false
async function download(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await fetch(url, {
        signal: AbortSignal.timeout(30000),
        headers: { 'User-Agent': 'ZaviPhotoResearch/1.0 (local photo review)' },
      })
    } catch (error) {
      if (attempt === 3) throw error
      await new Promise((r) => setTimeout(r, 30000))
    }
  }
}
for (const car of inventory.slice(start, end)) {
  if (selected && !selected.includes(car.slug)) continue
  const sheetPath =
    root + '/sheets/' + car.slug + (full ? '-full' : '') + (fresh ? '-fresh' : '') + '.jpg'
  let data
  try {
    data = JSON.parse(await readFile(root + '/' + car.slug + '.json', 'utf8'))
  } catch {
    continue
  }
  try {
    if ((await stat(sheetPath)).mtimeMs >= (await stat(root + '/' + car.slug + '.json')).mtimeMs)
      continue
  } catch {}
  const eligible = data.photos
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => p.thumb && /\.(jpe?g|png|webp)$/i.test(p.title) && p.width >= p.height)
  const choices = full
    ? eligible
    : [...new Map([...eligible.slice(0, 6), ...eligible.slice(-6)].map((x) => [x.i, x])).values()]
  const tiles = []
  let cursor = 0
  async function worker() {
    while (cursor < choices.length && !stopped) {
      const item = choices[cursor++],
        { p, i } = item
      const path =
        root +
        '/thumbs/' +
        car.slug +
        '-' +
        i +
        (fresh ? '-' + createHash('sha256').update(p.url).digest('hex').slice(0, 12) : '') +
        '.jpg'
      let bytes
      try {
        bytes = await readFile(path)
      } catch {
        try {
          const r = await download(p.thumb)
          if (!r.ok)
            throw Error('HTTP ' + r.status + ' retry-after ' + r.headers.get('retry-after'))
          bytes = Buffer.from(await r.arrayBuffer())
          await sharp(bytes).jpeg().toFile(path)
          await new Promise((r) => setTimeout(r, 1000))
        } catch (e) {
          console.log(car.slug, i, e.message)
          if (/429|fetch failed/.test(e.message)) {
            stopped = true
            process.exitCode = 1
          }
          continue
        }
      }
      tiles.push({ i, p, bytes })
    }
  }
  await Promise.all([worker(), worker(), worker()])
  const layers = []
  tiles.sort((a, b) => a.i - b.i)
  let count = 0
  for (const { i, p, bytes } of tiles) {
    const left = (count % 4) * 300,
      top = 48 + Math.floor(count / 4) * 220
    layers.push({
      input: await sharp(bytes)
        .resize(296, 186, { fit: 'contain', background: '#171717' })
        .toBuffer(),
      left,
      top,
    })
    const label = i + ' ' + p.title.replace('File:', '').slice(0, 41)
    layers.push({
      input: Buffer.from(
        '<svg width="296" height="28"><text x="4" y="18" fill="white" font-family="Arial" font-size="11">' +
          escape(label) +
          '</text></svg>',
      ),
      left,
      top: top + 186,
    })
    count++
  }
  if (layers.length && !stopped) {
    layers.push({
      input: Buffer.from(
        '<svg width="1200" height="48"><text x="8" y="30" fill="white" font-family="Arial" font-size="21">' +
          escape(car.name + ' | ' + car.colours.join(', ')) +
          '</text></svg>',
      ),
      left: 0,
      top: 0,
    })
    await sharp({
      create: {
        width: 1200,
        height: 48 + Math.ceil(count / 4) * 220,
        channels: 3,
        background: '#171717',
      },
    })
      .composite(layers)
      .jpeg({ quality: 90 })
      .toFile(sheetPath)
    console.log('Sheet', car.slug, count)
  }
  if (stopped) break
}
