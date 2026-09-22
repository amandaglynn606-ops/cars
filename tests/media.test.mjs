import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import sharp from 'sharp'
import { moduleURL } from './load-module.mjs'
const { inferImageColours, photographedColours, imagesForColour, colourPreview } = await import(
  await moduleURL('src/lib/image-variants.ts')
)
const cars = JSON.parse(await readFile('data/fleet.json', 'utf8'))
const review = JSON.parse(await readFile('data/vehicle-colour-review.json', 'utf8'))
const { applyReviewedColours } = await import(await moduleURL('src/lib/reviewed-colours.ts'))
test('every colour preview uses a visually reviewed exterior image and changes with the colour', () => {
  for (const car of cars) {
    assert.ok(car.colors.length, car.id)
    assert.equal(car.colors.filter((c) => c.default).length, 1)
    const previews = new Set()
    for (const colour of car.colors) {
      const selected = colourPreview(car, colour.slug)
      assert.equal(selected.colour, colour.slug)
      assert.equal(review.vehicles[car.id].photos[selected.image.src], colour.slug)
      assert.equal(selected.image.colorSlug, colour.slug)
      previews.add(selected.image.src)
    }
    assert.equal(previews.size, car.colors.length, car.id)
    assert.equal(colourPreview(car, 'invalid-colour').image.src, car.featuredImage)
    assert.deepEqual(applyReviewedColours(car, review.vehicles[car.id]), car)
  }
})
test('Cullinan blue and black are separate reviewed photographs; misleading green is removed', () => {
  const car = cars.find((c) => c.id === 'rolls-royce-cullinan')
  assert.deepEqual(car.colors.map((c) => c.slug).sort(), ['black', 'blue', 'brown', 'white'])
  assert.match(colourPreview(car, 'black').image.src, /\/21-Rolls-Royce-Cullinan.webp$/)
  assert.match(
    colourPreview(car, 'blue').image.src,
    /\/16-Rolls-Royce-Cullinan-Black-Badge-1.webp$/,
  )
  assert.equal(colourPreview(car, 'green').colour, 'black')
})
test('colour review preserves vehicle facts and refuses newly added unreviewed photos', () => {
  const car = cars[0]
  const changed = { ...car, pricing: { ...car.pricing, daily: 9999 }, revision: 45 }
  const result = applyReviewedColours(changed, review.vehicles[car.id])
  assert.equal(result.pricing.daily, 9999)
  assert.equal(result.revision, 45)
  assert.equal(result.images.length, car.images.length)
  assert.throws(
    () =>
      applyReviewedColours(
        {
          ...car,
          images: [
            ...car.images,
            { src: '/fleet/new.jpg', thumbnail: '/fleet/new.jpg', alt: 'New photo' },
          ],
        },
        review.vehicles[car.id],
      ),
    /require colour review/,
  )
})
test('Black Badge edition text never assigns blue bodywork to black', () => {
  const base = cars.find((car) => car.id === 'rolls-royce-cullinan')
  const inferred = inferImageColours({
    ...base,
    images: [
      {
        src: '/fleet/cullinan/Black-Badghe-Blue-2.webp',
        thumbnail: '/fleet/cullinan/Black-Badghe-Blue-2.webp',
        alt: 'Cullinan',
      },
    ],
  })
  assert.equal(inferred.images[0].colorSlug, 'blue')
})
test('every retained colour has matching photographs and galleries cannot cross colour groups', () => {
  for (const car of cars) {
    for (const colour of car.colors) {
      const images = imagesForColour(car, colour.slug)
      assert.ok(images.length > 0, car.name + ' ' + colour.name)
      assert.ok(images.every((image) => image.colorSlug === colour.slug))
    }
    assert.equal(photographedColours(car).length, car.colors.length)
  }
  const revuelto = cars.find((c) => c.id === 'lamborghini-revuelto')
  for (const colour of ['gray', 'yellow'])
    assert.ok(
      imagesForColour(revuelto, colour).every(
        (image) => review.vehicles[revuelto.id].photos[image.src] === colour,
      ),
    )
})
test('model words do not become photo colours and compound shades match both word orders', () => {
  const base = cars[0]
  const black = { name: 'Black', slug: 'black', default: false },
    matte = { name: 'Matte black', slug: 'matte-black', default: false }
  const car = {
    ...base,
    name: 'Mercedes-Benz GT63 Black Series',
    model: 'GT63 Black Series',
    slug: 'mercedes-gt63-black-series',
    keywords: [],
    colors: [black],
    images: [
      {
        src: '/fleet/car/GT63-Black-Series-Orange-1.webp',
        thumbnail: '/fleet/car/GT63-Black-Series-Orange-1.webp',
        alt: 'Car',
      },
    ],
  }
  assert.equal(inferImageColours(car).colors.length, 0)
  const shaded = {
    ...base,
    colors: [black, matte],
    images: [
      {
        src: '/fleet/car/BMW-M5-Black-Matte-1.webp',
        thumbnail: '/fleet/car/BMW-M5-Black-Matte-1.webp',
        alt: 'Car',
      },
    ],
  }
  assert.deepEqual(
    inferImageColours(shaded).colors.map((c) => c.slug),
    ['matte-black'],
  )
})
test('every catalogue photograph is a decodable local raster image', async () => {
  const paths = [...new Set(cars.flatMap((c) => c.images.flatMap((i) => [i.src, i.thumbnail])))]
  for (let start = 0; start < paths.length; start += 8)
    await Promise.all(
      paths.slice(start, start + 8).map(async (file) => {
        const metadata = await sharp('public' + file).metadata()
        assert.ok(metadata.width > 0 && metadata.height > 0, file)
      }),
    )
})
test('corrected body classifications are reflected in central data', () => {
  const m4 = cars.find((c) => c.id === 'bmw-m4'),
    tahoe = cars.find((c) => c.id === 'chevrolet-tahoe')
  assert.ok(m4.categories.includes('Sports'))
  assert.ok(!m4.categories.includes('Sedan'))
  assert.ok(tahoe.categories.includes('SUV'))
  assert.ok(!tahoe.categories.includes('American Muscle'))
  const defender = cars.find((c) => c.id === 'land-rover-defender')
  assert.equal(defender.brandSlug, 'land-rover')
})
