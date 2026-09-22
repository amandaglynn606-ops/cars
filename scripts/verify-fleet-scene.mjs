import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
import { DatabaseSync } from 'node:sqlite'
import { chromium } from 'playwright'
import sharp from 'sharp'
import { moduleURL } from '../tests/load-module.mjs'

const manifest = JSON.parse(await readFile('data/car-scene.json', 'utf8'))
const { colourPreview, photographedColours } = await import(await moduleURL('src/lib/image-variants.ts'))
const database = new DatabaseSync('.local/zavi.sqlite', { readOnly: true })
const cars = database.prepare('SELECT data FROM vehicles').all().map(row => JSON.parse(row.data))
database.close()
let previews = 0
for (const car of cars) {
  for (const requested of ['', ...photographedColours(car).map(colour => colour.slug)]) {
    const original = colourPreview(car, requested)
    assert.ok(manifest[original.image.src], `${car.slug}: ${requested} needs a scene`)
    const mapped = { ...car, featuredImage: manifest[car.featuredImage] || car.featuredImage, images: car.images.map(image => ({ ...image, src: manifest[image.src] || image.src })) }
    assert.equal(colourPreview(mapped, requested).image.src, manifest[original.image.src], 'same vehicle and colour must remain selected')
    previews++
  }
}
for (const src of new Set(Object.values(manifest))) {
  assert.ok((await stat('public' + src)).size > 1000)
  if (src.startsWith('/fleet-scene/')) {
    const metadata = await sharp('public' + src).metadata()
    assert.equal(metadata.width, 1600)
    assert.equal(metadata.height, 900)
  }
}
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
  for (const route of ['/fleet', '/monthly-luxury-car-rental', '/fleet/rolls-royce/cullinan?colour=green', '/monthly-luxury-car-rental/rolls-royce/cullinan?colour=black']) {
    await page.goto('http://127.0.0.1:43117' + route, { waitUntil: 'networkidle' })
    const photo = page.locator(route.includes('/cullinan') ? '.z-gallery img' : '.z-car-card img').first()
    assert.ok(decodeURIComponent(await photo.getAttribute('src')).includes('/fleet-scene/'), route)
    assert.equal(await photo.evaluate(image => image.complete && image.naturalWidth > 0), true)
  }
  await page.goto('http://127.0.0.1:43117/fleet/rolls-royce/cullinan', { waitUntil: 'networkidle' })
  const colours = page.locator('.z-colour-options button')
  const sources = new Set()
  for (let i = 0; i < await colours.count(); i++) {
    await colours.nth(i).click()
    const photo = page.locator('.z-gallery img')
    await photo.evaluate(image => image.decode())
    sources.add(await photo.getAttribute('src'))
  }
  assert.equal(sources.size, await colours.count(), 'each colour must change the displayed photo')
  await page.screenshot({ path: 'test-results/brabus-scene-vehicle.png', fullPage: true })
  await page.goto('http://127.0.0.1:43117/events/dubai-world-cup-luxury-car-rental', { waitUntil: 'networkidle' })
  assert.ok(decodeURIComponent(await page.locator('.z-event-feature img').getAttribute('src')).includes('/verified-places/dubai-world-cup.webp'))
  assert.equal(await page.locator('.z-event-programme-card').count(), 4)
  await page.screenshot({ path: 'test-results/world-cup-event-details.png', fullPage: true })
} finally { await browser.close() }
console.log(`Verified ${cars.length} cars, ${previews} default/colour selections, ${Object.keys(manifest).length} scene mappings; daily/monthly rendering, colour switching and World Cup imagery passed.`)
