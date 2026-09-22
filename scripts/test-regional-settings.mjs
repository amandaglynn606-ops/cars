import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'

const base = 'http://127.0.0.1:43117'
const codes = ['en', 'ar', 'ru', 'tr', 'de', 'nl', 'az', 'ka', 'it', 'fr', 'uk']
const exchange = JSON.parse(await readFile('data/exchange-rates.json', 'utf8'))
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
try {
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  const language = page.locator('.z-regional-controls select').first()
  const currency = page.locator('.z-regional-controls select').last()
  assert.equal(await language.locator('option').count(), 11)
  assert.deepEqual(await currency.locator('option').allTextContents(), [
    'Dirham د.إ',
    'U.S. Dollar $',
    'GBP £',
    'Euro €',
    'Canadian dollar C$',
    'Russian ruble ₽',
    'Turkish lira ₺',
    'Azerbaijani manat ₼',
    'Georgian lari ₾',
    'Ukrainian hryvnia ₴',
  ])
  assert.equal(await page.locator('.z-regional-controls label > span:not(.sr-only)').count(), 0)
  for (const code of codes) {
    await language.selectOption(code)
    await page.waitForFunction((code) => document.documentElement.lang === code, code)
    assert.equal(await page.locator('html').getAttribute('dir'), code === 'ar' ? 'rtl' : 'ltr')
    const dictionary =
      code === 'en' ? {} : JSON.parse(await readFile(`public/locales/${code}.json`, 'utf8'))
    assert.equal(
      await page.locator('#brands-heading').textContent(),
      dictionary['Browse brands'] || 'Browse brands',
    )
    assert.equal(
      await page.locator('#hot-heading').textContent(),
      dictionary['Hot rentals'] || 'Hot rentals',
    )
    for (const width of [320, 390, 1024, 1440, 2560]) {
      await page.setViewportSize({ width, height: 1000 })
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      )
      const logoCenter = await page.locator('.z-nav-logo').evaluate((el) => {
        const rect = el.getBoundingClientRect()
        return rect.left + rect.width / 2
      })
      assert.ok(Math.abs(logoCenter - width / 2) < 2, `${code}: centered logo at ${width}`)
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
        `${code}: overflow at ${width}`,
      )
      const bad = await page
        .locator('.z-home h1,.z-home h2')
        .evaluateAll((nodes) =>
          nodes.filter((el) => el.scrollWidth > el.clientWidth + 1).map((el) => el.textContent),
        )
      assert.deepEqual(bad, [], `${code}: headings at ${width}`)
    }
  }
  await language.selectOption('ar')
  await page.waitForFunction(() => document.documentElement.lang === 'ar')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: 'test-results/regions-arabic-mobile.png' })
  await page.reload({ waitUntil: 'networkidle' })
  assert.equal(await language.inputValue(), 'ar')
  const fleet = await page.goto(base + '/fleet', { waitUntil: 'networkidle' })
  assert.equal(fleet.status(), 200)
  assert.equal(await page.locator('html').getAttribute('lang'), 'ar')
  const accessibility = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  assert.deepEqual(
    accessibility.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
    [],
  )
  await language.selectOption('en')
  await page.waitForFunction(() => document.documentElement.lang === 'en')
  await page.goto(base, { waitUntil: 'networkidle' })
  const enabled = []
  for (const code of ['AED', 'USD', 'GBP', 'EUR', 'CAD', 'RUB', 'TRY', 'AZN', 'GEL', 'UAH']) {
    const option = currency.locator(`option[value="${code}"]`)
    if (!exchange.rates[code]) {
      assert.equal(await option.evaluate((element) => element.disabled), true)
      continue
    }
    enabled.push(code)
    await currency.selectOption(code)
    const amount = await page.locator('.z-hot-book [data-price-aed]').evaluate((el) => ({
      aed: Number(el.dataset.priceAed),
      code: el.dataset.currency,
      text: el.textContent,
    }))
    assert.equal(amount.code, code)
    assert.equal(
      amount.text,
      code +
        ' ' +
        new Intl.NumberFormat('en-AE', { maximumFractionDigits: 2 }).format(
          amount.aed * exchange.rates[code],
        ),
    )
    await page.reload({ waitUntil: 'networkidle' })
    assert.equal(await currency.inputValue(), code)
  }
  await currency.selectOption('AED')
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.screenshot({ path: 'test-results/regions-topbar-desktop.png' })
  await context.addCookies([
    { name: 'zavi-language', value: '../../.env.local', url: base },
    { name: 'zavi-currency', value: 'INVALID', url: base },
  ])
  await page.reload({ waitUntil: 'networkidle' })
  assert.equal(await language.inputValue(), 'en')
  assert.equal(await currency.inputValue(), 'AED')
  assert.deepEqual(errors, [])
  const report = {
    languages: codes,
    currencyNames: 10,
    enabledCurrencies: enabled,
    exchangeDate: exchange.date,
    widths: [320, 390, 1024, 1440, 2560],
    persistence: true,
    invalidCookiesRejected: true,
    accessibilityViolations: 0,
    errors,
  }
  await writeFile('test-results/regional-settings.json', JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
} finally {
  await browser.close()
}
