import { readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { inferImageColours } from '../src/lib/image-variants.ts'
import { applyReviewedColours } from '../src/lib/reviewed-colours.ts'
const colourReview = JSON.parse(await readFile('data/vehicle-colour-review.json', 'utf8'))
const seed = JSON.parse(await readFile('data/fleet.json', 'utf8'))
const originalColours = process.argv.includes('--original-colours')
  ? JSON.parse(await readFile('.local/fleet-before-zavi.json', 'utf8'))
  : []
const corrections = {
  'bmw-m4': { remove: ['Sedan'], add: ['Sports', 'Coupe'], primary: 'Sports' },
  'bmw-m4-convertible': { remove: ['Coupe'], add: ['Sports'], primary: 'Convertible' },
  'bmw-840': { remove: ['Coupe'], add: ['Luxury'], primary: 'Convertible' },
  'bmw-430i': { remove: ['Coupe'], add: [], primary: 'Convertible' },
  'mini-cooper-s': { remove: ['Coupe'], add: [], primary: 'Convertible' },
  'mercedes-benz-e450': { remove: ['Sedan', 'Coupe'], add: ['Luxury'], primary: 'Convertible' },
  'mercedes-gtc-r': {
    remove: ['Convertible', 'SuperSport'],
    add: ['Sports', 'Coupe'],
    primary: 'Sports',
  },
  'audi-rs6': { remove: ['Sedan'], add: ['Wagon', 'Sports'], primary: 'Sports' },
  'chevrolet-tahoe': { remove: ['American Muscle'], add: ['SUV'], primary: 'SUV' },
  'chevrolet-corvette-c8': { remove: ['American Muscle'], add: ['Sports'], primary: 'Sports' },
  'dodge-ram-trx': { remove: ['American Muscle'], add: ['Pickup'], primary: 'Pickup' },
  'bentley-flying-spur': { remove: [], add: ['Sedan'], primary: 'Luxury' },
  'rolls-royce-spectre': { remove: [], add: ['Coupe'], primary: 'Luxury' },
}
function audit(input) {
  const prepared = structuredClone(input)
  const original = originalColours.find((c) => c.id === input.id)
  if (original) {
    prepared.colors = original.colors
    prepared.images = prepared.images.map(({ colorSlug, ...image }) => image)
  }
  let c = inferImageColours(prepared)
  const correction = corrections[c.id]
  if (correction) {
    c.categories = [
      ...new Set([
        ...c.categories.filter((v) => !correction.remove.includes(v)),
        ...correction.add,
      ]),
    ]
    c.bodyType = correction.primary
  }
  if (
    c.brand === 'Mercedes-Benz' &&
    /^(Maybach|S ?[5-6])/i.test(c.model) &&
    !c.categories.includes('Luxury')
  )
    c.categories.push('Luxury')
  if (c.brand === 'BMW' && /^7/.test(c.model) && !c.categories.includes('Luxury'))
    c.categories.push('Luxury')
  if (c.brand === 'BMW' && /^(M\d|X[56]M|XM)/.test(c.model) && !c.categories.includes('Sports'))
    c.categories.push('Sports')
  if (c.id === 'land-rover-defender') {
    c.brand = 'Land Rover'
    c.brandSlug = 'land-rover'
    c.model = 'Defender'
    c.modelSlug = 'defender'
    c.name = 'Land Rover Defender'
    c.description =
      'Explore the Land Rover Defender with Zavi. Select your dates and preferred delivery location to request a tailored rental arrangement.'
  }
  return colourReview.vehicles[c.id] ? applyReviewedColours(c, colourReview.vehicles[c.id]) : c
}
const output = seed.map(audit)
await writeFile('data/fleet.json', JSON.stringify(output, null, 2) + '\n')
const report = seed.map((before, i) => ({
  id: before.id,
  name: output[i].name,
  images: output[i].images.length,
  retainedColours: output[i].colors.map((c) => c.name),
  removedColours: before.colors
    .filter((c) => !output[i].colors.some((v) => v.slug === c.slug))
    .map((c) => c.name),
  categoryChanges:
    before.categories.join('|') !== output[i].categories.join('|')
      ? { before: before.categories, after: output[i].categories }
      : undefined,
}))
const previousReport = existsSync('.local/media-audit.json')
  ? JSON.parse(await readFile('.local/media-audit.json', 'utf8'))
  : []
for (const item of report) {
  const previous = previousReport.find((p) => p.id === item.id)
  if (previous) {
    item.removedColours = [...new Set([...previous.removedColours, ...item.removedColours])].filter(
      (name) => !item.retainedColours.includes(name),
    )
    if (!item.categoryChanges && previous.categoryChanges)
      item.categoryChanges = previous.categoryChanges
  }
}
await writeFile('.local/media-audit.json', JSON.stringify(report, null, 2))
if (existsSync('.local/zavi.sqlite')) {
  const database = new DatabaseSync('.local/zavi.sqlite')
  database.exec(
    'PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS vehicle_aliases (route TEXT PRIMARY KEY, vehicleId TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE); CREATE TABLE IF NOT EXISTS audit_events (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp TEXT NOT NULL, action TEXT NOT NULL, entityId TEXT NOT NULL, details TEXT NOT NULL); BEGIN IMMEDIATE',
  )
  try {
    for (const row of database.prepare('SELECT data FROM vehicles').all()) {
      const before = JSON.parse(row.data),
        after = audit(before)
      if (JSON.stringify(before) === JSON.stringify(after)) continue
      if (before.brandSlug + '/' + before.modelSlug !== after.brandSlug + '/' + after.modelSlug)
        database
          .prepare('INSERT OR IGNORE INTO vehicle_aliases(route,vehicleId) VALUES(?,?)')
          .run(before.brandSlug + '/' + before.modelSlug, before.id)
      after.revision = (before.revision || 1) + 1
      after.updatedAt = new Date().toISOString()
      database
        .prepare('UPDATE vehicles SET data=?,route=? WHERE id=?')
        .run(JSON.stringify(after), after.brandSlug + '/' + after.modelSlug, after.id)
      database
        .prepare('INSERT INTO audit_events(timestamp,action,entityId,details) VALUES(?,?,?,?)')
        .run(
          after.updatedAt,
          'vehicle.media-and-taxonomy-reviewed',
          after.id,
          JSON.stringify({
            colours: after.colors.map((c) => c.name),
            categories: after.categories,
          }),
        )
    }
    database.exec('COMMIT')
  } catch (e) {
    database.exec('ROLLBACK')
    throw e
  } finally {
    database.close()
  }
}
console.log(
  JSON.stringify(
    {
      listings: output.length,
      photos: output.reduce((n, c) => n + c.images.length, 0),
      coloursRemoved: report.reduce((n, c) => n + c.removedColours.length, 0),
      coloursRetained: output.reduce((n, c) => n + c.colors.length, 0),
      categoryCorrections: report.filter((c) => c.categoryChanges).length,
      brands: new Set(output.filter((c) => c.publicationStatus === 'published').map((c) => c.brand))
        .size,
    },
    null,
    2,
  ),
)
let css = await readFile('src/app/globals.css', 'utf8')
const imports = css.split('\n').filter((l) => l.startsWith('@import '))
css =
  imports.join('\n') +
  '\n' +
  css
    .split('\n')
    .filter((l) => !l.startsWith('@import '))
    .join('\n')
await writeFile('src/app/globals.css', css)
