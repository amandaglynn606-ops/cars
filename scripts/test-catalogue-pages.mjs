import { chromium } from 'playwright'
import { DatabaseSync } from 'node:sqlite'
import { writeFile, mkdir } from 'node:fs/promises'
import assert from 'node:assert/strict'

const base = 'http://127.0.0.1:43117'
const database = new DatabaseSync('.local/zavi.sqlite', { readOnly: true })
const cars = database
  .prepare('SELECT data FROM vehicles')
  .all()
  .map((row) => JSON.parse(row.data))
  .filter((car) => car.publicationStatus === 'published')
database.close()
const slug = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
const scopes = [
  { route: '/fleet', cars },
  ...[...new Set(cars.map((car) => car.brand))].map((brand) => ({
    route: '/brands/' + slug(brand),
    cars: cars.filter((car) => car.brand === brand),
  })),
  ...[...new Set(cars.flatMap((car) => car.categories))].map((category) => ({
    route: '/categories/' + slug(category),
    cars: cars.filter((car) => car.categories.includes(category)),
  })),
]
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
})
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
let checkImages = false
await context.route('**/*', (route) =>
  new URL(route.request().url()).origin !== base ||
  (!checkImages && route.request().resourceType() === 'image')
    ? route.abort()
    : route.continue(),
)
const page = await context.newPage()
const errors = []
page.on('pageerror', (error) => errors.push(error.message))
const seen = new Set()
let checkedOptions = 0
const resultCount = () => page.locator('.z-result-count strong')
const waitCount = (count) =>
  page.waitForFunction(
    (expected) =>
      Number(document.querySelector('.z-result-count strong')?.textContent) === expected,
    count,
  )
await mkdir('test-results', { recursive: true })
try {
  for (const scope of scopes) {
    await page.goto(base + scope.route, { waitUntil: 'domcontentloaded' })
    assert.equal(
      await page.locator('main input[type="search"], main .z-search').count(),
      0,
      scope.route,
    )
    assert.equal(await page.getByRole('searchbox', { name: 'Search vehicles' }).count(), 1)
    assert.equal(Number(await resultCount().textContent()), scope.cars.length, scope.route)
    // Every option's displayed count is checked against the actual records in this route.
    const groups = await page.locator('.z-sidebar .z-filter-group').evaluateAll((groups) =>
      groups
        .filter((group) => group.tagName === 'DETAILS')
        .map((group) => ({
          field: group.querySelector('summary').childNodes[0].textContent.trim(),
          options: [...group.querySelectorAll('label')].map((label) => ({
            value: label.querySelector('span').textContent,
            count: Number(label.querySelector('small').textContent),
          })),
        })),
    )
    assert.ok(
      groups.some((group) => group.field === 'Model'),
      scope.route,
    )
    assert.ok(
      groups.every(
        (group) =>
          !['Transmission', 'Location', 'Availability', 'Color', 'Year'].includes(group.field),
      ),
      scope.route,
    )
    assert.equal(await page.locator('.z-fleet-browser input[type="date"]').count(), 0, scope.route)
    for (const group of groups)
      for (const option of group.options) {
        const matches = scope.cars.filter((car) => {
          switch (group.field) {
            case 'Category':
              return car.categories.includes(option.value)
            case 'Brand':
              return car.brand === option.value
            case 'Model':
              return car.model === option.value
            case 'Seats':
              return car.seats && (car.seats >= 5 ? '5+' : String(car.seats)) === option.value
            default:
              throw new Error('Unknown facet: ' + group.field)
          }
        })
        assert.equal(
          option.count,
          matches.length,
          scope.route + ' ' + group.field + ' ' + option.value,
        )
        checkedOptions++
      }
    while (await page.getByRole('button', { name: 'Explore more vehicles' }).count())
      await page.getByRole('button', { name: 'Explore more vehicles' }).click()
    const rendered = await page.locator('.z-fleet-grid article').evaluateAll((nodes) =>
      nodes.map((node) => {
        const title = node.querySelector('.z-car-title').getBoundingClientRect()
        const meta = node.querySelector('.z-car-meta').getBoundingClientRect()
        return {
          id: node.dataset.vehicle,
          title: node.querySelector('h3').textContent,
          category: node.querySelector('.z-car-meta > span').textContent,
          rightAligned: meta.left >= title.right && Math.abs(meta.top - title.top) < 2,
        }
      }),
    )
    assert.deepEqual(
      rendered.map((car) => car.id).sort(),
      scope.cars.map((car) => car.id).sort(),
      scope.route,
    )
    for (const card of rendered) {
      const record = scope.cars.find((car) => car.id === card.id)
      assert.equal(card.title, record.model)
      assert.equal(card.category, record.bodyType)
      assert.equal(card.rightAligned, true, card.id)
      seen.add(card.id)
    }
    // Exercise an actual filter on each listing route, then clear it without leaving its scope.
    const group = groups.find(
      (group) => ['Category', 'Brand'].includes(group.field) && group.options.length > 1,
    )
    if (group) {
      const option = group.options.find(
        (option) => option.count > 0 && option.count < scope.cars.length,
      )
      if (option) {
        await page
          .locator('.z-sidebar')
          .getByRole('checkbox', { name: option.value, exact: true })
          .check()
        await waitCount(option.count)
        await page.locator('.z-sidebar').getByRole('button', { name: 'Clear all filters' }).click()
        await waitCount(scope.cars.length)
      }
    }
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
      scope.route,
    )
    console.log('Checked ' + scope.route)
  }
  assert.equal(seen.size, cars.length)
  checkImages = true

  // Search must work repeatedly on the same route and across browser history.
  await page.goto(base + '/brands/lamborghini', { waitUntil: 'networkidle' })
  const search = page.getByRole('searchbox', { name: 'Search vehicles' })
  await search.fill('Ferrari')
  await search.press('Enter')
  await page.waitForURL('**/brands/ferrari')
  await waitCount(cars.filter((car) => car.brand === 'Ferrari').length)
  await search.fill('Revuelto')
  await search.press('Enter')
  await page.waitForURL('**/fleet/lamborghini/revuelto')
  assert.equal(await page.locator('h1').textContent(), 'Revuelto')
  await page.goBack({ waitUntil: 'networkidle' })
  await waitCount(cars.filter((car) => car.brand === 'Ferrari').length)
  await page.goForward({ waitUntil: 'networkidle' })
  assert.equal(await page.locator('h1').textContent(), 'Revuelto')
  await search.fill('SUV')
  await search.press('Enter')
  await page.waitForURL('**/fleet?search=SUV')
  await waitCount(cars.filter((car) => car.categories.includes('SUV')).length)
  await search.fill('Luxury')
  await search.press('Enter')
  await waitCount(cars.filter((car) => car.categories.includes('Luxury')).length)
  await page.screenshot({ path: 'test-results/navigation-search-desktop.png' })

  // Mobile options follow the draft brand before Apply, and cancellation preserves the results.
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(base + '/fleet', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /^Filter/ }).click()
  const drawer = page.getByRole('dialog', { name: 'Filter fleet' })
  await drawer.getByRole('checkbox', { name: 'Ferrari', exact: true }).check()
  const models = await drawer
    .locator('details')
    .filter({ has: page.locator('summary', { hasText: /^Model/ }) })
    .locator('label > span')
    .allTextContents()
  assert.deepEqual(
    models.sort(),
    [...new Set(cars.filter((car) => car.brand === 'Ferrari').map((car) => car.model))].sort(),
  )
  await drawer.getByRole('button', { name: 'Close filters' }).click()
  assert.equal(Number(await resultCount().textContent()), cars.length)
  await page.getByRole('button', { name: /^Filter/ }).click()
  await drawer.getByRole('checkbox', { name: 'Ferrari', exact: true }).check()
  await drawer.getByRole('button', { name: /Apply filters/ }).click()
  await waitCount(cars.filter((car) => car.brand === 'Ferrari').length)
  await page.screenshot({ path: 'test-results/cards-mobile-updated.png', fullPage: true })

  for (const width of [320, 390, 540, 800, 900, 1100, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
      'viewport ' + width,
    )
    const boxes = await page.locator('.z-header-actions').evaluate((element) => {
      const search = element.querySelector('form').getBoundingClientRect()
      const reserve = element.querySelector('.z-header-cta').getBoundingClientRect()
      return {
        adjacent: reserve.left >= search.right,
        aligned: Math.abs(search.top - reserve.top) < 3,
      }
    })
    assert.ok(boxes.adjacent && boxes.aligned, 'header at ' + width)
  }
  await page.goto(base, { waitUntil: 'networkidle' })
  assert.equal(await page.getByRole('button', { name: /Pause.*video|Play.*video/i }).count(), 0)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.waitForFunction(() => document.querySelector('video').paused)
  assert.deepEqual(errors, [])
  await writeFile(
    'test-results/catalogue-pages.json',
    JSON.stringify(
      { listingPages: scopes.length, checkedOptions, uniqueVehicles: seen.size, errors },
      null,
      2,
    ),
  )
  console.log(
    JSON.stringify({
      listingPages: scopes.length,
      checkedOptions,
      uniqueVehicles: seen.size,
      errors,
    }),
  )
} finally {
  await browser.close()
}
