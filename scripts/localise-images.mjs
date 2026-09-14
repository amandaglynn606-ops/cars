/**
 * Downloads every fleet photograph to public/fleet/<slug>/ and rewrites
 * data/fleet.json to point at the local copies, so the site serves no assets
 * from the legacy domain.
 *
 * Safe to re-run: files already on disk with a non-zero size are skipped, so an
 * interrupted run resumes where it stopped. Pass --force to re-download all.
 *
 * Thumbnails are deliberately not downloaded separately - next/image derives
 * them from the full-size file via the `sizes` prop.
 *
 * Usage: node scripts/localise-images.mjs [--force]
 */
import { writeFile, readFile, mkdir, stat, rename, unlink } from 'node:fs/promises'
import path from 'node:path'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
const OUT_ROOT = path.join('public', 'fleet')
const CONCURRENCY = 6
const RETRIES = 3
const force = process.argv.includes('--force')

const EXT_BY_TYPE = {
  'image/webp': '.webp',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/avif': '.avif',
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const exists = async (file) => {
  try {
    const s = await stat(file)
    return s.size > 0
  } catch {
    return false
  }
}

/** Keeps the source filename but namespaces it under the car's slug. */
function localNameFor(url, index) {
  const base = decodeURIComponent(url.split('/').pop() || `${index}`)
  const cleaned = base
    .replace(/\?.*$/, '')
    .replace(/[^A-Za-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
  const ext = path.extname(cleaned).toLowerCase()
  const stem = cleaned.slice(0, cleaned.length - ext.length).slice(0, 80)
  return `${String(index + 1).padStart(2, '0')}-${stem}${ext || '.webp'}`
}

async function download(url, dest) {
  let lastError
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const buffer = Buffer.from(await res.arrayBuffer())
      if (buffer.length === 0) throw new Error('empty body')

      // Trust the served content type over the URL extension.
      const type = (res.headers.get('content-type') || '').split(';')[0].trim()
      const wantExt = EXT_BY_TYPE[type]
      let finalDest = dest
      if (wantExt && path.extname(dest).toLowerCase() !== wantExt) {
        finalDest = dest.slice(0, dest.length - path.extname(dest).length) + wantExt
      }

      // Write to a temp file first so an interrupted run never leaves a
      // truncated file that the resume check would treat as complete.
      const tmp = `${finalDest}.part`
      await writeFile(tmp, buffer)
      await rename(tmp, finalDest)
      return { dest: finalDest, bytes: buffer.length }
    } catch (error) {
      lastError = error
      if (attempt < RETRIES) await sleep(400 * attempt)
    }
  }
  throw lastError
}

/** Runs tasks with a fixed worker pool. */
async function pool(items, worker, limit) {
  let cursor = 0
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++
      await worker(items[index], index)
    }
  })
  await Promise.all(runners)
}

const fleet = JSON.parse(await readFile('data/fleet.json', 'utf8'))

// Build the full job list up front so progress reporting is accurate.
const jobs = []
for (const car of fleet) {
  car.images.forEach((image, i) => {
    if (!image.src.startsWith('http')) return // already local
    jobs.push({ car, image, dest: path.join(OUT_ROOT, car.slug, localNameFor(image.src, i)) })
  })
}

console.log(`${jobs.length} images across ${fleet.length} cars`)
if (jobs.length === 0) {
  console.log('Nothing to do - fleet.json already points at local files.')
  process.exit(0)
}

for (const car of fleet) {
  await mkdir(path.join(OUT_ROOT, car.slug), { recursive: true })
}

let done = 0
let skipped = 0
let bytes = 0
const failures = []

await pool(
  jobs,
  async (job) => {
    try {
      if (!force && (await exists(job.dest))) {
        skipped++
        job.finalDest = job.dest
      } else {
        const result = await download(job.image.src, job.dest)
        job.finalDest = result.dest
        bytes += result.bytes
      }
    } catch (error) {
      failures.push({ url: job.image.src, reason: error.message })
    } finally {
      done++
      if (done % 50 === 0 || done === jobs.length) {
        process.stdout.write(`  ${done}/${jobs.length} (${skipped} cached, ${failures.length} failed)\n`)
      }
    }
  },
  CONCURRENCY,
)

// Rewrite only the images that actually landed on disk; a failed download keeps
// its remote URL so the page still renders rather than 404ing.
const failedUrls = new Set(failures.map((f) => f.url))
for (const job of jobs) {
  if (failedUrls.has(job.image.src) || !job.finalDest) continue
  const publicPath = '/' + path.relative('public', job.finalDest).split(path.sep).join('/')
  job.image.src = publicPath
  job.image.thumbnail = publicPath
}

await writeFile('data/fleet.json', JSON.stringify(fleet, null, 2) + '\n')

const remoteLeft = fleet.flatMap((c) => c.images).filter((i) => i.src.startsWith('http')).length

console.log(`\nDownloaded ${(bytes / 1048576).toFixed(1)} MB (${skipped} already cached)`)
console.log(`Rewrote data/fleet.json -> ${jobs.length - failures.length} local paths`)
console.log(`Remote URLs still referenced: ${remoteLeft}`)

if (failures.length > 0) {
  console.log(`\n${failures.length} failed:`)
  for (const f of failures.slice(0, 20)) console.log(`  ${f.reason}  ${f.url}`)
  if (failures.length > 20) console.log(`  ...and ${failures.length - 20} more`)
  console.log('\nRe-run this script to retry the failures.')
  process.exitCode = 1
}
