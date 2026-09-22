import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises'
import sharp from 'sharp'
const root = process.argv.includes('--no-credit')
  ? '.local/stock-no-credit'
  : '.local/stock-research'
const destination = 'public/fleet-stock'
await mkdir(destination, { recursive: true })
let manifest = []
try {
  manifest = JSON.parse(await readFile('data/fleet-stock.json', 'utf8'))
} catch {}
async function download(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await fetch(url, {
        headers: {
          'User-Agent': 'ZaviPhotoResearch/1.0 (attributed commercial-use photo selection)',
        },
        signal: AbortSignal.timeout(60000),
      })
    } catch (error) {
      if (attempt === 3) throw error
      console.log('Temporary network failure; retrying in 30 seconds')
      await new Promise((r) => setTimeout(r, 30000))
    }
  }
}
while (true) {
  const approved = JSON.parse(await readFile(root + '/approved.json', 'utf8'))
  const choice = approved.find(
    (item) => !manifest.some((photo) => photo.slug === item.slug && photo.colour === item.colour),
  )
  if (!choice) break
  const data = JSON.parse(
    await readFile(root + '/' + (choice.searchSlug || choice.slug) + '.json', 'utf8'),
  )
  const p = data.photos[choice.index]
  if (!p || !/^(CC0|Public domain)$/.test(p.license)) throw Error('Unsupported photo licence')
  const url = new URL(p.url)
  if (url.hostname !== 'upload.wikimedia.org') throw Error('Unexpected image host')
  const id = choice.slug + '-' + choice.colour
  const cached = manifest.find((photo) => photo.original === p.url)
  if (cached) {
    await copyFile('public' + cached.src, destination + '/' + id + '.webp')
    manifest.push({
      ...cached,
      slug: choice.slug,
      colour: choice.colour,
      id,
      src: '/fleet-stock/' + id + '.webp',
    })
    await writeFile('data/fleet-stock.json', JSON.stringify(manifest, null, 2) + '\n')
    console.log('Reused', id)
    continue
  }
  let cooldown
  try {
    cooldown = JSON.parse(await readFile(root + '/full-download-cooldown.json', 'utf8'))
  } catch {}
  if (cooldown?.resumeAfter > Date.now()) {
    console.log(
      'Respecting source cooldown',
      Math.ceil((cooldown.resumeAfter - Date.now()) / 1000),
      'seconds',
    )
    await new Promise((r) => setTimeout(r, cooldown.resumeAfter - Date.now()))
  }
  // The source cooldown applies before any request, including its supported resize service.
  // Request web-sized high-resolution copies instead of very large camera originals.
  const deliveryUrl =
    p.width > 1920 && p.thumb ? new URL(p.thumb.replace(/\/500px-/, '/1920px-')) : url
  if (!['upload.wikimedia.org', 'thumb.wikimedia.org'].includes(deliveryUrl.hostname))
    throw Error('Unexpected delivery host')
  const response = await download(deliveryUrl)
  if (response.status === 429) {
    const delay = Number(response.headers.get('retry-after')) || 600
    await writeFile(
      root + '/full-download-cooldown.json',
      JSON.stringify({ resumeAfter: Date.now() + delay * 1000, reason: 'Source rate limit' }),
    )
    throw Error('Source rate limit; retry after ' + delay + ' seconds')
  }
  if (!response.ok) throw Error('HTTP ' + response.status)
  const bytes = Buffer.from(await response.arrayBuffer())
  if (bytes.length > 50000000) throw Error('File too large')
  const pipeline = sharp(bytes, { limitInputPixels: 250000000 }).rotate()
  const meta = await pipeline.metadata()
  if (meta.width < 1600) throw Error('Downloaded image is too small')
  await pipeline
    .resize({ width: 2400, withoutEnlargement: true })
    .webp({ quality: 92 })
    .toFile(destination + '/' + id + '.webp')
  manifest.push({
    slug: choice.slug,
    colour: choice.colour,
    id,
    src: '/fleet-stock/' + id + '.webp',
    original: p.url,
    source: p.source,
    title: p.title.replace(/^File:/, ''),
    author: p.author,
    license: p.license,
    licenseUrl: p.licenseUrl?.replace(/^http:/, 'https:'),
    width: meta.width,
    height: meta.height,
    changes:
      'Resized and converted to WebP. Reference photograph of the stated model and visible colour; the exact rental vehicle and equipment may differ. Adapted image remains available under its source licence.',
  })
  await writeFile('data/fleet-stock.json', JSON.stringify(manifest, null, 2) + '\n')
  console.log('Saved', id, meta.width, meta.height)
  await new Promise((r) => setTimeout(r, 15000))
}
