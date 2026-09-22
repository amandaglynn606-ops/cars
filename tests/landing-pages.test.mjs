import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, access } from 'node:fs/promises'
import { moduleURL } from './load-module.mjs'
import sharp from 'sharp'
const { locationPages } = await import(
  await moduleURL('src/lib/location-pages.ts', {
    './regional-locations': await moduleURL('src/lib/regional-locations.ts'),
  })
)
const { occasionPages } = await import(
  await moduleURL('src/lib/occasion-pages.ts', {
    './occasion-guides': await moduleURL('src/lib/occasion-guides.ts'),
  })
)
const { destinationMedia } = await import(await moduleURL('src/lib/destination-media.ts'))
const { landingCars } = await import(await moduleURL('src/lib/landing-fleet.ts'))
const { locationGroups, locationHref, findLocationRoute } = await import(
  await moduleURL('src/lib/location-routing.ts')
)
test('all listed locations belong to one emirate and use exact canonical routes', () => {
  const groups = locationGroups(locationPages)
  assert.equal(groups.length, 7)
  const links = groups.flatMap((group) => [group.href, ...group.links.map((link) => link.href)])
  assert.equal(links.length, locationPages.length)
  assert.equal(new Set(links).size, locationPages.length)
  for (const page of locationPages) {
    assert.ok(links.includes(locationHref(page)), page.slug)
    assert.equal(findLocationRoute(locationHref(page).slice(1), locationPages), page)
    assert.equal(findLocationRoute(page.slug, locationPages), undefined)
  }
  assert.equal(findLocationRoute('unknown-luxury-car-rental', locationPages), undefined)
  assert.equal(locationPages.find((page) => page.slug === 'khor-fakkan').region, 'Sharjah')
  assert.equal(locationPages.find((page) => page.slug === 'kalba').region, 'Sharjah')
})
test('Destination and occasion content has unique routes and working local images', async () => {
  assert.equal(locationPages.length, 107)
  assert.equal(occasionPages.length, 22)
  for (const entries of [locationPages, occasionPages]) {
    assert.equal(new Set(entries.map((p) => p.slug)).size, entries.length)
    assert.equal(new Set(entries.map((p) => p.intro)).size, entries.length)
    assert.equal(new Set(entries.map((p) => p.question)).size, entries.length)
    for (const entry of entries) assert.match(entry.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  }
  for (const location of locationPages)
    await access('public' + destinationMedia[location.photo].src)
})
test('Landing selections exclude unavailable vehicles and keep actual category matches', async () => {
  const seed = JSON.parse(await readFile('data/fleet.json', 'utf8')).filter(
    (c) => c.publicationStatus === 'published',
  )
  for (const entry of occasionPages) {
    assert.ok(
      seed.some((car) => car.id === entry.photoCar),
      'Existing hero car for ' + entry.slug,
    )
    const selected = landingCars(seed, undefined, entry)
    assert.ok(selected.length > 0 && selected.length <= 9)
    assert.equal(new Set(selected.map((c) => c.id)).size, selected.length)
    for (const car of selected) {
      assert.equal(car.availability, 'available')
      assert.notEqual(car.pricing.daily, null)
      assert.ok(car.categories.some((c) => entry.categories.includes(c)))
    }
  }
  assert.deepEqual(
    landingCars(
      seed.map((c) => ({ ...c, availability: 'unavailable' })),
      locationPages[0],
    ),
    [],
  )
})

test('expanded occasions link to real Dubai location pages and distinct planning guidance', () => {
  for (const slug of [
    'date-night',
    'romantic-getaways',
    'surprise-gifts',
    'marriage-proposals',
    'honeymoons',
    'engagement-celebrations',
    'family-days-out',
    'graduations',
  ]) {
    assert.equal(occasionPages.filter((page) => page.slug === slug).length, 1, slug)
  }
  assert.equal(new Set(occasionPages.map((page) => page.description)).size, occasionPages.length)
  assert.equal(new Set(occasionPages.map((page) => page.dubaiGuide)).size, occasionPages.length)
  const groups = new Set()
  for (const page of occasionPages) {
    assert.ok(
      locationPages.some((location) => location.slug === page.locationSlug),
      'Live location link for ' + page.slug,
    )
    assert.ok(
      page.description.length >= 80 && page.description.length <= 200,
      'Concise unique search summary for ' + page.slug,
    )
    assert.ok(
      page.dubaiGuide.length > 150 && page.carAdvice.length > 70,
      'Useful local guidance for ' + page.slug,
    )
    assert.ok(page.group)
    groups.add(page.group)
  }
  assert.equal(groups.size, 4)
})

test('every occasion image is a local decodable asset with truthful generated-image labels', async () => {
  const checked = new Set()
  for (const page of occasionPages) {
    const image = page.image
    assert.match(image.src, /^\/(occasions|destinations|emirates)\/[a-z0-9-]+\.webp$/)
    assert.ok(image.alt.length > 10 && image.caption.length > 10)
    if (image.generated) {
      assert.match(image.alt, /^AI illustration/)
      assert.match(image.caption, /Dubai/)
    }
    if (!checked.has(image.src)) {
      const buffer = await readFile('public' + image.src)
      const result = await sharp(buffer).metadata()
      assert.equal(result.format, 'webp')
      assert.ok(result.width >= 900 && result.height >= 400, image.src)
      assert.ok(buffer.length < 1500000, 'Optimised image ' + image.src)
      await sharp(buffer).stats()
      checked.add(image.src)
    }
  }
})

test('the sitemap includes every occasion canonical URL exactly once', async () => {
  const stub =
    'data:text/javascript;base64,' +
    Buffer.from(
      "export const getAllCars=()=>[]; export const getBrands=()=>[]; export const getBodyTypes=()=>[]; export const categorySlug=x=>x; export const carHref=()=>''; export const monthlyCarHref=()=>'';",
    ).toString('base64')
  const configURL = await moduleURL('src/lib/config.ts')
  const { siteConfig } = await import(configURL)
  const { default: sitemap } = await import(
    await moduleURL('src/app/sitemap.ts', {
      '@/lib/fleet': stub,
      '@/lib/catalogue': stub,
      '@/lib/config': configURL,
      '@/lib/home-rentals': await moduleURL('src/lib/home-rentals.ts'),
      '@/lib/event-guides': await moduleURL('src/lib/event-guides.ts'),
      '@/lib/location-routing': await moduleURL('src/lib/location-routing.ts'),
      '@/lib/location-pages': await moduleURL('src/lib/location-pages.ts', {
        './regional-locations': await moduleURL('src/lib/regional-locations.ts'),
      }),
      '@/lib/occasion-pages': await moduleURL('src/lib/occasion-pages.ts', {
        './occasion-guides': await moduleURL('src/lib/occasion-guides.ts'),
      }),
    })
  )
  const urls = sitemap().map((item) => item.url)
  for (const page of locationPages)
    assert.equal(urls.filter((url) => url === siteConfig.url + locationHref(page)).length, 1)
  assert.ok(urls.every((url) => !new URL(url).pathname.startsWith('/locations/')))
  for (const page of occasionPages)
    assert.equal(
      urls.filter((url) => url === siteConfig.url + '/occasions/' + page.slug).length,
      1,
      page.slug,
    )
  assert.ok(urls.includes(siteConfig.url + '/occasions'))
  assert.ok(urls.every((url) => !new URL(url).pathname.startsWith('/admin')))
})
