import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import { DatabaseSync } from 'node:sqlite'
import { ownerApplication, agencyApplication } from '../tests/partnership-fixtures.mjs'
const base = 'http://127.0.0.1:43117'
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
})
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: 'reduce',
})
const page = await context.newPage(),
  errors = [],
  created = []
page.on('pageerror', (e) => errors.push(e.message))
const widths = [320, 390, 768, 1024, 1440, 1920, 2560]
const accessibility = []
const testName = 'Zavi automated partnership check'
async function axe(name) {
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  const violations = result.violations.map((v) => ({
    id: v.id,
    nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
  }))
  accessibility.push({ name, violations })
  assert.deepEqual(violations, [], name)
}
try {
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  assert.equal(await page.locator('.z-home-brand-count').count(), 0)
  for (const width of widths) {
    await page.setViewportSize({ width, height: 1000 })
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    )
    await page.locator('.z-home-brands').evaluate((el) => (el.scrollLeft = 0))
    const sizes = await page.evaluate(() => {
      const rect = (s) => document.querySelector(s).getBoundingClientRect().toJSON()
      const row = document.querySelector('.z-home-brands').getBoundingClientRect()
      const visible = [...document.querySelectorAll('.z-home-brands>button')].filter((el) => {
        const r = el.getBoundingClientRect()
        return r.left >= row.left - 1 && r.right <= row.right + 1
      }).length
      return {
        stage: rect('.z-hot-stage'),
        lineup: rect('.z-hot-lineup'),
        banner: rect('.z-emirates'),
        visible,
        overflow: document.documentElement.scrollWidth > innerWidth,
      }
    })
    assert.equal(sizes.overflow, false, 'overflow ' + width)
    assert.equal(Math.round(sizes.banner.width), width)
    if (width >= 1200) assert.equal(sizes.visible, 10, 'ten brands ' + width)
    if (width > 900) {
      assert.ok(Math.abs(sizes.stage.y - sizes.lineup.y) < 2)
      assert.ok(Math.abs(sizes.stage.height - sizes.lineup.height) < 2)
      assert.ok(sizes.stage.height < 800)
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.locator('#hot-rentals').screenshot({ path: 'test-results/hot-rentals-aligned.png' })
  const buttons = page.locator('.z-emirates-options button')
  assert.equal(await buttons.count(), 7)
  for (let i = 0; i < 7; i++) {
    await buttons.nth(i).hover()
    assert.equal(await buttons.nth(i).getAttribute('aria-pressed'), 'true')
    const current = page.locator('.z-emirates-images img.is-active')
    await current.evaluate((img) => img.decode())
    const name = await page.locator('#emirate-preview h3').textContent()
    assert.equal(
      new URL(
        await page.locator('.z-emirates-destination a.z-button').getAttribute('href'),
        base,
      ).searchParams.get('location'),
      name,
    )
  }
  await buttons.first().focus()
  assert.equal(await buttons.first().getAttribute('aria-pressed'), 'true')
  await page.locator('#emirates').screenshot({ path: 'test-results/emirates-desktop.png' })
  await page.locator('#earn-with-us').screenshot({ path: 'test-results/earn-desktop.png' })
  await axe('new homepage sections')
  await page.goto(base + '/book?location=Fujairah', { waitUntil: 'networkidle' })
  assert.equal(await page.getByLabel(/^Delivery location/).inputValue(), 'Fujairah')
  // Existing booking tests exercise submission; this checks the new location hand-off.
  for (const type of ['consignment', 'business']) {
    await page.goto(base + '/partners?type=' + type, { waitUntil: 'networkidle' })
    assert.equal(
      new URL(page.url()).pathname,
      type === 'consignment' ? '/partners/consign-your-car' : '/partners/rental-agencies',
    )
    const application = (type === 'consignment' ? ownerApplication : agencyApplication).application
    for (const [name, value] of Object.entries(application)) {
      const field = page.locator('[name="' + name + '"]')
      if ((await field.evaluate((el) => el.tagName)) === 'SELECT') await field.selectOption(value)
      else await field.fill(value)
    }
    await page.locator('input[name=name]').fill(testName)
    await page.locator('input[name=email]').fill('partnership-test@example.test')
    await page.locator('input[name=phone]').fill('+971 50 123 4567')
    await page
      .locator('textarea')
      .fill('Automated ' + type + ' check: <img src=x onerror=alert(1)>')
    await page.locator('input[name=consent]').check()
    if (type === 'consignment') {
      await page.screenshot({ path: 'test-results/partner-form-desktop.png', fullPage: true })
      await axe('partnership form')
    }
    const responsePromise = page.waitForResponse(
      (r) => r.url() === base + '/api/partners' && r.request().method() === 'POST',
    )
    await page
      .getByRole('button', {
        name: type === 'consignment' ? 'Submit my car for review' : 'Apply as a rental agency',
        exact: true,
      })
      .click()
    const response = await responsePromise
    assert.equal(response.status(), 201)
    const result = await response.json()
    created.push(result.id)
    await page.getByRole('heading', { name: 'Application received.' }).waitFor()
  }
  const valid = { ...agencyApplication, name: testName }
  for (const [origin, body] of [
    ['https://untrusted.invalid', valid],
    [base, { ...valid, type: 'admin' }],
    [base, { ...valid, consent: false }],
    [base, { ...valid, details: 'x'.repeat(9000) }],
  ]) {
    const r = await context.request.post(base + '/api/partners', {
      headers: { Origin: origin },
      data: body,
    })
    assert.equal(r.status(), 400)
  }
  assert.equal((await context.request.get(base + '/api/partners')).status(), 405)
  await page.goto(base + '/admin/partners', { waitUntil: 'networkidle' })
  assert.equal(await page.getByText(testName, { exact: true }).count(), 0)
  await page
    .getByLabel('Administrator password', { exact: true })
    .fill((await readFile('.local/admin-password.txt', 'utf8')).trim())
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await page.getByRole('heading', { name: 'Partnership enquiries', exact: true }).waitFor()
  for (const id of created) {
    const article = page.locator('article').filter({ hasText: id })
    assert.equal(await article.count(), 1)
    assert.equal(await article.locator('img').count(), 0)
    assert.ok((await article.textContent()).includes('<img src=x onerror=alert(1)>'))
  }
  await context.request.delete(base + '/api/admin/session', { headers: { Origin: base } })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(base + '/partners?type=business', { waitUntil: 'networkidle' })
  await axe('mobile partnership form')
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
  await page.screenshot({ path: 'test-results/partner-form-mobile.png', fullPage: true })
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.locator('.z-emirates-options button').nth(4).click()
  assert.equal(await page.locator('#emirate-preview h3').textContent(), 'Umm Al Quwain')
  await page.locator('#emirates').screenshot({ path: 'test-results/emirates-mobile.png' })
  await page.locator('#earn-with-us').screenshot({ path: 'test-results/earn-mobile.png' })
  assert.deepEqual(errors, [])
  const report = {
    widths,
    desktopBrandsVisible: 10,
    emirates: 7,
    partnershipSubmissions: created.length,
    privateAdminVerified: true,
    inputAndOriginChecks: true,
    accessibility,
    errors,
  }
  await writeFile('test-results/home-additions.json', JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
} finally {
  await browser.close()
  const db = new DatabaseSync('.local/zavi.sqlite')
  for (const id of created)
    db.prepare("DELETE FROM partnerships WHERE id=? AND json_extract(data,'$.name')=?").run(
      id,
      testName,
    )
  db.close()
}
