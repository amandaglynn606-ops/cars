import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'
import { DatabaseSync } from 'node:sqlite'
import { moduleURL } from '../tests/load-module.mjs'
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
const { landingCars } = await import(await moduleURL('src/lib/landing-fleet.ts'))
const database = new DatabaseSync('.local/zavi.sqlite')
const cars = database
  .prepare('SELECT data FROM vehicles')
  .all()
  .map((r) => JSON.parse(r.data))
  .filter((c) => c.publicationStatus === 'published')
const routes = [
  ...locationPages.map((entry) => ({ entry, kind: 'locations' })),
  ...occasionPages.map((entry) => ({ entry, kind: 'occasions' })),
]
const base = 'http://127.0.0.1:43117',
  created = [],
  errors = [],
  external = [],
  results = []
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
})
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: 'reduce',
})
const page = await context.newPage()
page.on('pageerror', (e) => errors.push(e.message))
page.on('request', (r) => {
  if (!r.url().startsWith(base) && !r.url().startsWith('data:') && !r.url().startsWith('blob:'))
    external.push(r.url())
})
async function axe(name) {
  const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  const issues = scan.violations.map((v) => ({
    id: v.id,
    nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
  }))
  results.push({ name, issues })
  assert.deepEqual(issues, [], name)
}
try {
  const sitemap = await (await context.request.get(base + '/sitemap.xml')).text()
  for (const [index, { entry, kind }] of routes.entries()) {
    const path =
      kind === 'locations' ? '/' + entry.slug + '-luxury-car-rental' : '/occasions/' + entry.slug
    const response = await page.goto(base + path, { waitUntil: 'networkidle' })
    assert.equal(response.status(), 200, path)
    assert.equal(await page.locator('h1').count(), 1)
    assert.ok((await page.title()).includes(entry.name))
    assert.equal(
      new URL(await page.locator('link[rel=canonical]').getAttribute('href')).pathname,
      path,
    )
    assert.ok(sitemap.includes(path + '</loc>'), path + ' sitemap')
    const expected = landingCars(
      cars,
      kind === 'locations' ? entry : undefined,
      kind === 'occasions' ? entry : undefined,
    )
    assert.deepEqual(
      (
        await page
          .locator('.z-fleet-grid article')
          .evaluateAll((els) => els.map((el) => el.dataset.vehicle))
      ).sort(),
      expected.map((c) => c.id).sort(),
    )
    assert.equal(
      await page.locator('textarea[name=notes]').inputValue(),
      kind === 'locations'
        ? `Delivery request: ${entry.name}. Please confirm the property entrance and delivery arrangements.`
        : `Occasion: ${entry.name}. Please confirm suitability and any permissions for the intended use.`,
    )
    assert.equal(await page.getByLabel(/^Delivery location/).inputValue(), entry.region || 'Dubai')
    await page.locator('.z-destination-visual img').evaluate((img) => img.decode())
    for (const facet of ['Brand', 'Model']) {
      const group = page
        .locator('.z-sidebar .z-filter-group')
        .filter({ has: page.locator('summary', { hasText: facet }) })
      const label = group.locator('label').first()
      const count = Number(await label.locator('small').textContent())
      await label.locator('input').check()
      await page.waitForFunction(
        (n) => document.querySelectorAll('.z-fleet-grid article').length === n,
        count,
      )
      await label.locator('input').uncheck()
      await page.waitForFunction(
        (n) => document.querySelectorAll('.z-fleet-grid article').length === n,
        expected.length,
      )
    }
    if (index % 10 === 0) console.log('Checked ' + (index + 1) + ' / ' + routes.length)
  }
  for (const path of [
    '/locations',
    '/occasions',
    '/palm-jumeirah-luxury-car-rental',
    '/abu-dhabi-luxury-car-rental',
    '/occasions/weddings',
  ]) {
    await page.goto(base + path, { waitUntil: 'networkidle' })
    await axe(path)
    for (const width of [320, 390, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 })
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
        path + ' overflow ' + width,
      )
      if ([390, 1440].includes(width)) {
        for (const img of await page.locator('main img').all()) {
          await img.scrollIntoViewIfNeeded()
          await img.evaluate((i) => i.decode())
        }
        await page.evaluate(() => scrollTo(0, 0))
        await page.screenshot({
          path: 'test-results/landing-' + path.replaceAll('/', '-') + '-' + width + '.png',
          fullPage: true,
        })
      }
    }
    await page.setViewportSize({ width: 1440, height: 1000 })
  }
  for (const path of ['/fujairah-luxury-car-rental', '/occasions/weddings']) {
    await page.goto(base + path, { waitUntil: 'networkidle' })
    const notes = await page.locator('[name=notes]').inputValue()
    await page
      .getByLabel(/^Your vehicle/)
      .selectOption(cars.find((c) => c.availability === 'available').id)
    await page.getByLabel('Collection date', { exact: true }).fill('2027-01-15')
    await page.getByLabel('Return date', { exact: true }).fill('2027-01-16')
    await page.locator('[name=name]').fill('Zavi landing automated check')
    await page.locator('[name=email]').fill('landing-test@example.test')
    await page.locator('[name=phone]').fill('+971501234567')
    await page.locator('.z-admin-check input').check()
    const pending = page.waitForResponse(
      (r) => r.url() === base + '/api/reservations' && r.request().method() === 'POST',
    )
    await page.getByRole('button', { name: 'Send reservation request', exact: true }).click()
    const response = await pending,
      result = await response.json()
    assert.equal(response.status(), 201, JSON.stringify(result))
    created.push(result.id)
    const stored = JSON.parse(
      database.prepare('SELECT data FROM reservations WHERE id=?').get(result.id).data,
    )
    assert.equal(stored.notes, notes)
    assert.equal(stored.status, 'pending')
    assert.equal(stored.location, path.includes('fujairah') ? 'Fujairah' : 'Dubai')
  }
  assert.equal((await context.request.get(base + '/locations/not-a-real-location')).status(), 404)
  assert.equal((await context.request.get(base + '/occasions/not-a-real-occasion')).status(), 404)
  assert.deepEqual(errors, [])
  assert.deepEqual(external, [])
  console.log(
    JSON.stringify(
      {
        pages: routes.length,
        filters: routes.length * 2,
        reservations: created.length,
        accessibility: results,
        errors,
        external,
      },
      null,
      2,
    ),
  )
  await writeFile(
    'test-results/landing-pages.json',
    JSON.stringify({ pages: routes.length, results, errors, external }, null, 2),
  )
} finally {
  for (const id of created)
    database
      .prepare("DELETE FROM reservations WHERE id=? AND json_extract(data,'$.name')=?")
      .run(id, 'Zavi landing automated check')
  database.close()
  await browser.close()
}
