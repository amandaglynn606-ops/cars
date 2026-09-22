import { DatabaseSync } from 'node:sqlite'
import { writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { moduleURL } from '../tests/load-module.mjs'
const { colourPreview, photographedColours } = await import(await moduleURL('src/lib/image-variants.ts'))
const db = new DatabaseSync('.local/zavi.sqlite', { readOnly: true })
const cars = db.prepare('SELECT data FROM vehicles').all().map(row=>JSON.parse(row.data))
db.close()
const sources = new Set()
for (const car of cars) {
  if (car.featuredImage) sources.add(car.featuredImage)
  const defaultImage = colourPreview(car).image?.src
  if (defaultImage) sources.add(defaultImage)
  for (const colour of photographedColours(car)) {
    const image = colourPreview(car, colour.slug).image?.src
    if (image) sources.add(image)
  }
}
const items = [...sources].map(src=>({src, filename:createHash('sha256').update(src).digest('hex').slice(0,20)+'.webp'}))
await writeFile('.local/cutout-inventory.json', JSON.stringify(items,null,2))
console.log(cars.length+' cars, '+items.length+' displayed default/colour photos')
