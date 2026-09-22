import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { DatabaseSync } from 'node:sqlite'
import { applyReviewedColours } from '../src/lib/reviewed-colours.ts'
const review = JSON.parse(await readFile('data/vehicle-colour-review.json', 'utf8'))
const seed = JSON.parse(await readFile('data/fleet.json', 'utf8'))
const database = new DatabaseSync('.local/zavi.sqlite')
database.exec('PRAGMA busy_timeout=5000; BEGIN IMMEDIATE')
let changed = 0
try {
  const live = database
    .prepare('SELECT data FROM vehicles')
    .all()
    .map((row) => JSON.parse(row.data))
  const apply = (car) => {
    if (!review.vehicles[car.id]) throw new Error('Unreviewed vehicle: ' + car.id)
    return applyReviewedColours(car, review.vehicles[car.id])
  }
  const nextSeed = seed.map(apply),
    nextLive = live.map(apply)
  const stamp = new Date().toISOString().replaceAll(':', '-')
  await mkdir('.local/colour-review/backups', { recursive: true })
  await writeFile('.local/colour-review/backups/seed-' + stamp + '.json', JSON.stringify(seed))
  await writeFile('.local/colour-review/backups/vehicles-' + stamp + '.json', JSON.stringify(live))
  for (const [index, car] of nextLive.entries()) {
    if (JSON.stringify(car) === JSON.stringify(live[index])) continue
    car.revision = (live[index].revision || 1) + 1
    car.updatedAt = new Date().toISOString()
    database.prepare('UPDATE vehicles SET data=? WHERE id=?').run(JSON.stringify(car), car.id)
    database
      .prepare('INSERT INTO audit_events(timestamp,action,entityId,details) VALUES(?,?,?,?)')
      .run(
        car.updatedAt,
        'vehicle.colours_visually_reviewed',
        car.id,
        JSON.stringify({ colours: car.colors.map((c) => c.name), review: review.reviewedAt }),
      )
    changed++
  }
  await writeFile('data/fleet.json', JSON.stringify(nextSeed, null, 2) + '\n')
  database.exec('COMMIT')
  console.log(
    JSON.stringify({
      reviewedVehicles: seed.length,
      updatedLiveVehicles: changed,
      colourOptions: nextSeed.reduce((n, c) => n + c.colors.length, 0),
    }),
  )
} catch (error) {
  database.exec('ROLLBACK')
  throw error
} finally {
  database.close()
}
