import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import assert from 'node:assert/strict'
import { readFile, mkdir, writeFile, unlink } from 'node:fs/promises'
const base = 'http://127.0.0.1:43117'
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
})
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()
const errors = [],
  external = [],
  results = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('request', (r) => {
  if (!r.url().startsWith(base) && !r.url().startsWith('data:') && !r.url().startsWith('blob:'))
    external.push(r.url())
})
await mkdir('test-results', { recursive: true })
async function axe(name) {
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  results.push({
    page: name,
    violations: result.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
    })),
  })
}
try {
  const homepage = await page.goto(base, { waitUntil: 'networkidle' })
  assert.equal(homepage.status(), 200)
  assert.match(homepage.headers()['content-security-policy'], /connect-src 'self'/)
  await page.evaluate(() => document.fonts.ready)
  const fonts = await page
    .locator('.zavi-logo')
    .first()
    .evaluate((el) => {
      const family = getComputedStyle(el).fontFamily.split(',')[0]
      return { family, loaded: document.fonts.check('52px ' + family, 'Zavi') }
    })
  assert.match(fonts.family, /haymila/i)
  assert.equal(fonts.loaded, true)
  for (const element of await page.locator('.z-car-image').all())
    await element.scrollIntoViewIfNeeded()
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: 'test-results/home-desktop.png', fullPage: true })
  await axe('home')
  await page.getByRole('button', { name: 'The fleet', exact: true }).hover()
  const mega = page.getByRole('region', { name: 'The fleet', exact: true })
  await mega.waitFor()
  assert.ok((await mega.locator('.z-nav-car-grid a').count()) > 100)
  assert.equal(await mega.locator('.z-mega-brands').count(), 0)
  await page.screenshot({ path: 'test-results/mega-menu-desktop.png' })
  await axe('desktop mega menu')
  await mega.getByRole('button', { name: 'Close the fleet menu' }).click()
  const nav = page.getByRole('navigation', { name: 'Main navigation', exact: true })
  await nav.locator('summary').filter({ hasText: 'Car brands' }).click()
  const brandMenu = nav.getByRole('region', { name: 'Car brands', exact: true })
  assert.equal(await brandMenu.locator('.z-nav-brand-tile').count(), 22)
  await page.keyboard.press('Escape')
  await nav.locator('summary').filter({ hasText: 'Locations' }).click()
  const locationMenu = nav.getByRole('region', { name: 'Locations', exact: true })
  await locationMenu.getByRole('button', { name: /Sharjah/ }).click()
  assert.equal(
    await locationMenu.getByRole('link', { name: 'Khor Fakkan', exact: true }).getAttribute('href'),
    '/khor-fakkan-luxury-car-rental',
  )
  await axe('location navigation')
  await page.keyboard.press('Escape')
  await nav.locator('summary').filter({ hasText: 'Occasions' }).click()
  assert.equal(
    await nav
      .getByRole('region', { name: 'Occasions', exact: true })
      .locator('.z-nav-occasion-groups a')
      .count(),
    22,
  )
  await page.keyboard.press('Escape')
  await nav.locator('summary').filter({ hasText: 'The fleet' }).click()
  await mega.getByRole('button', { name: 'Close the fleet menu' }).click()
  await page.getByRole('searchbox', { name: 'Search vehicles', exact: true }).fill('Revuelto')
  await page
    .getByRole('region', { name: 'Search suggestions' })
    .getByRole('link', { name: /Lamborghini Revuelto/ })
    .click()
  await page.waitForURL('**/fleet/lamborghini/revuelto')
  await page.getByRole('button', { name: 'View Gray car', exact: true }).click()
  assert.equal(
    await page.locator('[data-gallery-colour]').getAttribute('data-gallery-colour'),
    'gray',
  )
  assert.match(await page.locator('[data-gallery-colour] img').getAttribute('src'), /Gray|gray/)
  assert.equal(await page.locator('.z-gallery img').count(), 1)
  assert.match(await page.locator('[data-gallery-colour] img').getAttribute('src'), /Gray|gray/)
  await page.getByRole('button', { name: 'View Yellow car', exact: true }).click()
  assert.equal(
    await page.locator('[data-gallery-colour]').getAttribute('data-gallery-colour'),
    'yellow',
  )
  await page.screenshot({ path: 'test-results/colour-gallery-desktop.png' })
  await page.goto(base + '/fleet', { waitUntil: 'networkidle' })
  const initialCount = await page.locator('.z-result-count strong').textContent()
  assert.ok(Number(initialCount) > 100)
  await page.goto(base + '/fleet?search=Revuelto', { waitUntil: 'networkidle' })
  await page.waitForFunction(() => document.querySelectorAll('.z-fleet-grid article').length === 1)
  await page.getByRole('button', { name: 'Show Gray Lamborghini Revuelto', exact: true }).click()
  assert.match(await page.locator('.z-fleet-grid .z-car-photo').getAttribute('src'), /Gray|gray/)
  await page.getByRole('button', { name: 'Save Lamborghini Revuelto', exact: true }).click()
  assert.equal(
    await page
      .getByRole('button', { name: 'Unsave Lamborghini Revuelto', exact: true })
      .getAttribute('aria-pressed'),
    'true',
  )
  await page.getByRole('button', { name: 'Clear search', exact: true }).click()
  await page
    .locator('.z-sidebar')
    .getByRole('checkbox', { name: 'Lamborghini', exact: true })
    .check()
  await page
    .locator('.z-sidebar')
    .getByRole('checkbox', { name: /SuperSport/ })
    .check()
  await page.getByRole('combobox', { name: 'Sort by', exact: true }).selectOption('price-asc')
  await page.waitForTimeout(150)
  assert.ok((await page.locator('.z-fleet-grid article').count()) > 1)
  assert.ok(
    (
      await page
        .locator('.z-fleet-grid article')
        .evaluateAll((cards) => cards.map((c) => c.textContent))
    ).every((t) => t.includes('Lamborghini') && t.includes('SuperSport')),
  )
  await page.getByRole('button', { name: 'Remove Lamborghini filter' }).click()
  assert.equal(
    await page
      .locator('.z-sidebar')
      .getByRole('checkbox', { name: 'Lamborghini', exact: true })
      .isChecked(),
    false,
  )
  await page.getByRole('button', { name: 'Clear all filters', exact: true }).click()
  await page.waitForFunction(
    (n) => document.querySelector('.z-result-count strong').textContent === n,
    initialCount,
  )
  await page.getByRole('button', { name: /Explore more vehicles/ }).click()
  assert.equal(await page.locator('.z-fleet-grid article').count(), 24)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: 'test-results/fleet-desktop.png' })
  await axe('fleet desktop')
  await page.goto(base + '/brands/lamborghini', { waitUntil: 'networkidle' })
  assert.equal(await page.locator('h1').textContent(), 'Lamborghini')
  assert.ok(
    (
      await page
        .locator('.z-fleet-grid article')
        .evaluateAll((cards) => cards.map((c) => c.textContent))
    ).every((t) => t.includes('Lamborghini')),
  )
  await page.goto(base + '/categories/suv', { waitUntil: 'networkidle' })
  assert.equal(await page.locator('h1').textContent(), 'SUV')
  await page.goto(
    base + '/fleet/lamborghini/revuelto?start=2026-10-20&end=2026-10-23&location=Dubai+Marina',
    { waitUntil: 'networkidle' },
  )
  assert.equal(await page.locator('.z-gallery img').count(), 1)
  await page.screenshot({ path: 'test-results/detail-desktop.png' })
  await axe('vehicle detail')
  await page.getByRole('link', { name: 'Reserve this vehicle', exact: true }).click()
  await page.waitForURL('**/book?**')
  assert.equal(await page.getByLabel('Collection date', { exact: true }).inputValue(), '2026-10-20')
  assert.equal(await page.getByLabel('Return date', { exact: true }).inputValue(), '2026-10-23')
  assert.equal(
    await page.getByRole('combobox', { name: /^Delivery location/ }).inputValue(),
    'Dubai Marina',
  )
  assert.equal(
    await page.getByRole('combobox', { name: /^Your vehicle/ }).inputValue(),
    'lamborghini-revuelto',
  )
  await axe('booking')
  const anon = await context.request.get(base + '/api/admin/vehicles')
  assert.equal(anon.status(), 401)
  const forged = await context.request.post(base + '/api/reservations', {
    headers: { Origin: 'https://untrusted.invalid', 'Content-Type': 'application/json' },
    data: {},
  })
  assert.equal(forged.status(), 400)
  const malformed = await context.request.post(base + '/api/reservations', {
    headers: { Origin: base, 'Content-Type': 'application/json' },
    data: {},
  })
  assert.equal(malformed.status(), 400)
  await page.goto(base + '/admin', { waitUntil: 'networkidle' })
  await axe('admin login')
  await page
    .getByLabel('Administrator password', { exact: true })
    .fill((await readFile('.local/admin-password.txt', 'utf8')).trim())
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await page.waitForSelector('.z-admin-layout')
  await page.getByRole('button', { name: /^Lamborghini Revuelto/ }).click()
  const originalPrice = await page.getByLabel('Daily rate', { exact: true }).inputValue()
  let changed = false
  try {
    await page.getByLabel('Daily rate', { exact: true }).fill('13999')
    await page.getByRole('button', { name: 'Save vehicle', exact: true }).click()
    await page.getByRole('status').waitFor()
    assert.match(await page.getByRole('status').textContent(), /Vehicle saved/)
    changed = true
    const live = await context.request.get(base + '/fleet/lamborghini/revuelto')
    assert.match(await live.text(), /AED 13,999/)
    console.log('Admin price edit appears in the live catalogue without a rebuild.')
  } finally {
    if (changed) {
      await page.getByLabel('Daily rate', { exact: true }).fill(originalPrice)
      await page.getByRole('button', { name: 'Save vehicle', exact: true }).click()
      await page.getByRole('button', { name: 'Save vehicle', exact: true }).waitFor()
      assert.match(
        await (await context.request.get(base + '/fleet/lamborghini/revuelto')).text(),
        /AED 14,000/,
      )
    }
  }
  await page.screenshot({ path: 'test-results/admin-desktop.png' })
  await axe('admin editor')
  const invalidUpload = await context.request.post(base + '/api/admin/upload', {
    headers: { Origin: base, 'Content-Type': 'image/svg+xml' },
    data: '<svg xmlns="http://www.w3.org/2000/svg"/>',
  })
  assert.equal(invalidUpload.status(), 400)
  const uploaded = await context.request.post(base + '/api/admin/upload', {
    headers: { Origin: base, 'Content-Type': 'image/webp' },
    data: await readFile('public/fleet/lamborghini-revuelto/01-Lamborghini-Revuelto-1.webp'),
  })
  assert.equal(uploaded.status(), 200)
  const { src: uploadedPath } = await uploaded.json()
  assert.match(uploadedPath, /^\/uploads\/[0-9a-f-]{36}\.webp$/)
  try {
    const photo = await context.request.get(base + uploadedPath)
    assert.equal(photo.status(), 200)
    assert.match(photo.headers()['content-type'], /image\/webp/)
    const optimized = await context.request.get(
      base + '/_next/image?url=' + encodeURIComponent(uploadedPath) + '&w=640&q=75',
    )
    assert.equal(optimized.status(), 200)
  } finally {
    await unlink('.local' + uploadedPath)
  }
  const history = await context.request.get(base + '/api/admin/audit')
  assert.equal(history.status(), 200)
  assert.ok((await history.json()).some((event) => event.action === 'vehicle.updated'))
  await page.getByRole('button', { name: 'Sign out', exact: true }).click()
  await page.waitForSelector('.z-admin-login')
  assert.equal((await context.request.get(base + '/.local/admin-password.txt')).status(), 404)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(base + '/fleet', { waitUntil: 'networkidle' })
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    true,
  )
  await page.screenshot({ path: 'test-results/fleet-mobile.png' })
  await page.getByRole('button', { name: /^Filter/ }).click()
  const drawer = page.getByRole('dialog', { name: 'Filter fleet', exact: true })
  await drawer.waitFor()
  await drawer.getByRole('checkbox', { name: 'Lamborghini', exact: true }).check()
  await axe('mobile filter drawer')
  await page.screenshot({ path: 'test-results/filter-mobile.png' })
  await drawer.getByRole('button', { name: /Apply filters/ }).click()
  assert.equal(await drawer.isVisible(), false)
  assert.ok(
    (
      await page
        .locator('.z-fleet-grid article')
        .evaluateAll((cards) => cards.map((c) => c.textContent))
    ).every((t) => t.includes('Lamborghini')),
  )
  await page.reload({ waitUntil: 'networkidle' })
  assert.match(page.url(), /Lamborghini/)
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click()
  await page.getByRole('dialog', { name: 'Navigation', exact: true }).waitFor()
  const mobileNav = page.getByRole('dialog', { name: 'Navigation', exact: true })
  await mobileNav.locator('summary').filter({ hasText: 'Car brands' }).click()
  await axe('mobile navigation')
  assert.ok(await mobileNav.locator('a[href="/brands/land-rover"]').isVisible())
  await page.keyboard.press('Escape')
  assert.equal(await mobileNav.isVisible(), true)
  await page.keyboard.press('Escape')
  assert.equal(
    await page.getByRole('dialog', { name: 'Navigation', exact: true }).isVisible(),
    false,
  )
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.screenshot({ path: 'test-results/home-mobile.png' })
  await axe('home mobile')
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    true,
  )
  await writeFile(
    'test-results/browser-checks.json',
    JSON.stringify({ fonts, errors, external, accessibility: results }, null, 2),
  )
  console.log(JSON.stringify({ fonts, errors, external, accessibility: results }, null, 2))
  assert.equal(errors.length, 0)
  assert.equal(external.length, 0)
  assert.ok(
    results.every((r) => r.violations.length === 0),
    'Accessibility violations require attention.',
  )
} finally {
  await browser.close()
}
