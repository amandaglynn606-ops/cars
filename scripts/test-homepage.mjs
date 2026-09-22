import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import { DatabaseSync } from 'node:sqlite'
import { mkdir, writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'

const base = 'http://127.0.0.1:43117'
const database = new DatabaseSync('.local/zavi.sqlite', { readOnly: true })
const cars = database
  .prepare('SELECT data FROM vehicles')
  .all()
  .map((row) => JSON.parse(row.data))
  .filter((car) => car.publicationStatus === 'published')
database.close()
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
})
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: 'reduce',
})
await context.route('**/*', (route) =>
  new URL(route.request().url()).origin === base ? route.continue() : route.abort(),
)
const page = await context.newPage()
const errors = []
page.on('pageerror', (error) => errors.push(error.message))
await mkdir('test-results', { recursive: true })
try {
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  assert.deepEqual(await page.locator('.z-home h2').allTextContents(), [
    'Browse brands',
    'Hot rentals',
    'Explore the emirates',
    'Earn with us.',
    'Your car, for the month.',
    'Arrive for the occasion.',
    'Rental questions',
  ])
  assert.equal(await page.locator('.z-home h1 br').count(), 1)
  assert.equal(await page.locator('.z-home h2 br').count(), 0)
  assert.equal(
    await page.locator('.z-home-brands > button').count(),
    new Set(cars.map((car) => car.brand)).size,
  )
  assert.equal(await page.locator('.z-hero-shade').count(), 0)
  await page.getByRole('button', { name: 'Scroll to more brands', exact: true }).click()
  assert.ok(await page.locator('.z-home-brands').evaluate((el) => el.scrollLeft > 0))
  await page.getByRole('button', { name: 'Scroll to previous brands', exact: true }).click()
  assert.equal(await page.locator('.z-home-brands').evaluate((el) => el.scrollLeft), 0)
  await page.waitForFunction(() => document.querySelector('video').videoWidth > 0)
  const video = await page.locator('video').evaluate((el) => ({
    width: el.videoWidth,
    height: el.videoHeight,
    opacity: getComputedStyle(el).opacity,
    controls: el.controls,
  }))
  assert.equal(video.opacity, '1')
  assert.equal(video.controls, false)
  assert.equal(await page.locator('#car-types, #suv-rentals, #how-to-book, .z-home-cta').count(), 0)
  assert.equal(
    await page.locator('#monthly-rentals article').count(),
    cars.filter((car) => car.availability === 'available' && car.pricing.daily > 0).length,
  )
  assert.equal(await page.locator('#event-rentals article').count(), 4)
  const hot = await page
    .locator('#hot-rentals article')
    .evaluateAll((nodes) => nodes.map((node) => node.dataset.vehicle))
  assert.equal(
    hot.length,
    Math.min(6, cars.filter((car) => car.featured && car.availability === 'available').length),
  )
  assert.ok(
    hot.every((id) =>
      cars.some(
        (car) =>
          car.id === id &&
          (car.featured || car.id === 'mercedes-benz-g-63-brabus') &&
          car.availability === 'available',
      ),
    ),
  )
  assert.equal(hot[0], 'mercedes-benz-g-63-brabus')
  assert.equal(await page.locator('.z-hot-title h3').textContent(), 'G 63 Brabus')
  const brandTiles = await page.locator('.z-home-brands > button').evaluateAll((nodes) =>
    nodes.map((node) => ({
      name: node.querySelector('.z-home-brand-name').textContent,
    })),
  )
  for (const tile of brandTiles) {
    tile.count = cars.filter((car) => car.brand === tile.name).length
    const button = page.getByRole('button', {
      name: tile.name,
      exact: true,
    })
    await button.click()
    assert.equal(await button.getAttribute('aria-pressed'), 'true')
    assert.equal(await page.locator('.z-home-brands [aria-pressed="true"]').count(), 1)
    await button.locator('img').evaluate((img) => img.decode())
    await page.waitForFunction(
      ({ ids, count }) => {
        const cards = [...document.querySelectorAll('#homepage-brand-cars article')]
        return cards.length === count && cards.every((card) => ids.includes(card.dataset.vehicle))
      },
      {
        ids: cars.filter((car) => car.brand === tile.name).map((car) => car.id),
        count: tile.count,
      },
    )
    const ids = await page
      .locator('#homepage-brand-cars article')
      .evaluateAll((nodes) => nodes.map((node) => node.dataset.vehicle))
    assert.equal(ids.length, tile.count)
    assert.ok(ids.every((id) => cars.some((car) => car.id === id && car.brand === tile.name)))
    assert.equal(page.url(), base + '/')
    assert.equal(
      (
        await context.request.get(
          base + (await page.locator('#homepage-brand-cars a.z-text-link').getAttribute('href')),
        )
      ).status(),
      200,
    )
  }
  await page.locator('.z-home-brands > button').first().click()
  await page.locator('.z-home-brands').evaluate((el) => (el.scrollLeft = 0))
  for (const id of hot) {
    const car = cars.find((car) => car.id === id)
    await page.getByRole('button', { name: 'Preview ' + car.name, exact: true }).click()
    assert.equal(await page.locator('.z-hot-title h3').textContent(), car.model)
    assert.ok(
      (await page.locator('.z-hot-book a').getAttribute('href')).endsWith(
        '/' + car.brandSlug + '/' + car.modelSlug,
      ),
    )
    await page.waitForFunction(
      (name) =>
        document.querySelectorAll('.z-hot-photo img').length === 1 &&
        document.querySelector('.z-hot-photo img').alt === name,
      car.name,
    )
    await page.locator('.z-hot-photo img').evaluate((img) => img.decode())
  }
  await page
    .getByRole('button', {
      name: 'Preview ' + cars.find((car) => car.id === hot[0]).name,
      exact: true,
    })
    .click()
  const links = await page
    .locator('.z-home a')
    .evaluateAll((nodes) => [...new Set(nodes.map((node) => node.getAttribute('href')))])
  for (const href of links) {
    if (href.startsWith('#')) assert.equal(await page.locator(href).count(), 1, href)
    else assert.equal((await context.request.get(base + href)).status(), 200, href)
  }
  for (const detail of await page.locator('.z-home-faq details').all()) {
    await detail.locator('summary').click()
    assert.equal(await detail.locator('p').isVisible(), true)
    await detail.locator('summary').click()
  }
  for (const photo of await page.locator('.z-home img').all()) await photo.scrollIntoViewIfNeeded()
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: 'test-results/homepage-sections-desktop.png', fullPage: true })
  const widths = [320, 390, 540, 768, 1024, 1440, 1920, 2560]
  for (const width of widths) {
    await page.setViewportSize({ width, height: 1000 })
    assert.equal(
      await page.locator('.z-home-brands').evaluate((el) => getComputedStyle(el).scrollbarWidth),
      'none',
    )
    const containers = await page
      .locator('.z-home .container-lux, .z-header-inner, .z-footer .container-lux')
      .evaluateAll((nodes) => nodes.map((el) => el.getBoundingClientRect().width))
    assert.ok(
      containers.every((value) => Math.abs(value - width) < 2),
      'full-width containers at ' + width,
    )
    const tops = await page
      .locator('.z-home-brands > button')
      .evaluateAll((nodes) => nodes.map((node) => Math.round(node.getBoundingClientRect().top)))
    assert.equal(new Set(tops).size, 1, 'single brand row at ' + width)
    const headings = await page.locator('.z-home h1, .z-home h2').evaluateAll((nodes) =>
      nodes.map((node) => {
        const style = getComputedStyle(node)
        const rect = node.getBoundingClientRect()
        return {
          text: node.textContent,
          fits: node.scrollWidth <= node.clientWidth + 1,
          oneLine: rect.height <= parseFloat(style.lineHeight) + 2,
          fullWidth:
            node.tagName !== 'H2' ||
            Math.abs(rect.width - node.parentElement.getBoundingClientRect().width) < 2,
        }
      }),
    )
    for (const heading of headings)
      assert.ok(
        heading.fits && heading.oneLine && heading.fullWidth,
        width + ': ' + JSON.stringify(heading),
      )
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
      'overflow at ' + width,
    )
  }
  for (const photo of await page.locator('.z-home img').all()) {
    await photo.scrollIntoViewIfNeeded()
    await photo.evaluate((img) => img.decode())
  }
  await page.locator('.z-home-brands').evaluate((el) => (el.scrollLeft = 0))
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: 'test-results/homepage-sections-wide.png', fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.locator('.z-home-brands > button').last().click()
  assert.equal(
    await page.locator('.z-home-brands > button').last().getAttribute('aria-pressed'),
    'true',
  )
  await page.locator('.z-home-brands > button').first().focus()
  await page.keyboard.press('Enter')
  assert.equal(
    await page.locator('.z-home-brands > button').first().getAttribute('aria-pressed'),
    'true',
  )
  await page.locator('.z-home-brands').evaluate((el) => (el.scrollLeft = 0))
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: 'test-results/homepage-sections-mobile.png', fullPage: true })
  const accessibility = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  assert.deepEqual(
    accessibility.violations.map((item) => ({
      id: item.id,
      targets: item.nodes.map((node) => node.target),
    })),
    [],
  )
  assert.deepEqual(errors, [])
  const report = {
    sections: 9,
    brands: brandTiles.length,
    video,
    carTypes: 6,
    hotRentals: hot.length,
    linksChecked: links.length,
    widths,
    accessibilityViolations: 0,
    errors,
  }
  await writeFile('test-results/homepage-checks.json', JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
} finally {
  await browser.close()
}
