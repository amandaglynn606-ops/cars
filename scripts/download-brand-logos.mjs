import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const simpleIcons = {
  lamborghini: 'lamborghini',
  ferrari: 'ferrari',
  'rolls-royce': 'rollsroyce',
  bentley: 'bentley',
  porsche: 'porsche',
  mclaren: 'mclaren',
  'mercedes-benz': 'mercedes',
  bmw: 'bmw',
  audi: 'audi',
  'aston-martin': 'astonmartin',
  maserati: 'maserati',
  cadillac: 'cadillac',
  ford: 'ford',
  'land-rover': 'landrover',
  chevrolet: 'chevrolet',
  nissan: 'nissan',
  mini: 'mini',
  honda: 'honda',
}
await mkdir('.local/brand-logo-sources', { recursive: true })
await mkdir('public/brands', { recursive: true })
const sources = []
for (const [slug, icon] of Object.entries(simpleIcons)) {
  const url = `https://raw.githubusercontent.com/simple-icons/simple-icons/11.15.0/icons/${icon}.svg`
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) })
  if (!response.ok) throw new Error(`${slug}: HTTP ${response.status}`)
  const svg = await response.text()
  // Retain only numeric path geometry from the downloaded vector, never executable SVG markup.
  const paths = [...svg.matchAll(/<path\b[^>]*\bd="([^"]+)"/g)].map((match) => match[1])
  if (!paths.length || paths.some((d) => !/^[MmZzLlHhVvCcSsQqTtAaEe\d\s.,+\-]+$/.test(d)))
    throw new Error('Invalid geometry: ' + slug)
  await writeFile(`.local/brand-logo-sources/${slug}.svg`, svg)
  const outline = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.5 -0.5 25 25"><defs><linearGradient id="bronze" x2="1" y2="1"><stop stop-color="#ebcfa3"/><stop offset=".5" stop-color="#c6a077"/><stop offset="1" stop-color="#936c45"/></linearGradient></defs><g fill="none" stroke="url(#bronze)" stroke-width=".26" stroke-linejoin="round" stroke-linecap="round">${paths.map((d) => `<path d="${d}"/>`).join('')}</g></svg>`
  await writeFile(`public/brands/${slug}.svg`, outline)
  sources.push({
    slug,
    url,
    treatment: 'Original vector geometry with gold-bronze outline strokes',
  })
  console.log('Saved ' + slug)
}
const extraIcons = {
  gmc: 'gmc-1',
  dodge: 'dodge-1',
  lotus: 'lotus-1',
  'range-rover': 'range-rover',
}
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
})
try {
  const page = await browser.newPage()
  await page.route('**/*', (route) => route.abort())
  for (const [slug, icon] of Object.entries(extraIcons)) {
    const url = `https://cdn.worldvectorlogo.com/logos/${icon}.svg`
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) })
    if (!response.ok) throw new Error(`${slug}: HTTP ${response.status}`)
    const svg = await response.text()
    const paths = [...svg.matchAll(/<path\b[^>]*\bd="([^"]+)"/g)]
      .map((match) => match[1])
      .filter((d) => d !== 'M0 0h192.756v192.756H0V0z')
    if (!paths.length || paths.some((d) => !/^[MmZzLlHhVvCcSsQqTtAaEe\d\s.,+\-]+$/.test(d)))
      throw new Error('Invalid geometry: ' + slug)
    await writeFile(`.local/brand-logo-sources/${slug}.svg`, svg)
    const geometry = paths.map((d) => `<path d="${d}"/>`).join('')
    await page.setContent(`<svg xmlns="http://www.w3.org/2000/svg"><g>${geometry}</g></svg>`)
    const box = await page.locator('g').evaluate((el) => {
      const b = el.getBBox()
      return { x: b.x, y: b.y, width: b.width, height: b.height }
    })
    const unit = Math.max(box.width, box.height)
    const padding = unit * 0.025
    const viewBox = [
      box.x - padding,
      box.y - padding,
      box.width + padding * 2,
      box.height + padding * 2,
    ].join(' ')
    const outline = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"><defs><linearGradient id="bronze" x2="1" y2="1"><stop stop-color="#ebcfa3"/><stop offset=".5" stop-color="#c6a077"/><stop offset="1" stop-color="#936c45"/></linearGradient></defs><g fill="none" stroke="url(#bronze)" stroke-width="${unit / 120}" stroke-linejoin="round" stroke-linecap="round">${geometry}</g></svg>`
    await writeFile(`public/brands/${slug}.svg`, outline)
    sources.push({
      slug,
      url,
      treatment:
        'Original vector geometry with gold-bronze outline strokes; canvas background removed',
    })
    console.log('Saved ' + slug)
  }
} finally {
  await browser.close()
}
await writeFile('public/brands/sources.json', JSON.stringify(sources, null, 2))
