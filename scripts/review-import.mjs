// Refresh creates a candidate for review. It never overwrites live admin changes.
import './fetch-source.mjs'
import { readFile, writeFile } from 'node:fs/promises'
import { DatabaseSync } from 'node:sqlite'
import { existsSync } from 'node:fs'
const source = JSON.parse(await readFile('.local/lux-source.json', 'utf8'))
let vehicles = JSON.parse(await readFile('data/fleet.json', 'utf8'))
if (existsSync('.local/zavi.sqlite')) {
  const db = new DatabaseSync('.local/zavi.sqlite', { readOnly: true })
  vehicles = db
    .prepare('SELECT data FROM vehicles')
    .all()
    .map((r) => JSON.parse(r.data))
  db.close()
}
const changes = []
for (const vehicle of vehicles)
  for (const period of ['day', 'month']) {
    const product = source.products.find(
      (p) =>
        vehicle.source?.ids.includes(p.id) &&
        new RegExp('rental-label[^>]*>\\s*\\/?\\s*' + period, 'i').test(p.price_html || ''),
    )
    if (!product) continue
    const value = Number(product.prices.price) / 10 ** product.prices.currency_minor_unit
    const key = period === 'day' ? 'daily' : 'monthly'
    if (value > 0 && value !== vehicle.pricing[key])
      changes.push({
        id: vehicle.id,
        name: vehicle.name,
        field: key,
        current: vehicle.pricing[key],
        proposed: value,
        sourceId: product.id,
      })
  }
const known = new Set(vehicles.flatMap((v) => v.source?.ids || []))
const unmatched = source.products
  .filter((p) => !known.has(p.id))
  .map((p) => ({ sourceId: p.id, name: p.name, url: p.permalink }))
await writeFile(
  '.local/import-review.json',
  JSON.stringify({ retrievedAt: source.retrievedAt, changes, unmatched }, null, 2),
)
console.log(
  `${changes.length} price changes and ${unmatched.length} unmatched source listings written to .local/import-review.json. Review and apply through Fleet Management. Live records were not changed.`,
)
