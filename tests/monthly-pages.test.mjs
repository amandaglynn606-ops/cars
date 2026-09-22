import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { moduleURL } from './load-module.mjs'
const require = createRequire(import.meta.url)
const dataURL = (source) => 'data:text/javascript;base64,' + Buffer.from(source).toString('base64')
const reactURL = pathToFileURL(require.resolve('react')).href
const { withMonthlyOffer } = await import(await moduleURL('src/lib/monthly-pricing.ts'))
const [raw] = JSON.parse(await readFile('data/fleet.json', 'utf8'))
const car = withMonthlyOffer({ ...raw, pricing: { ...raw.pricing, daily: 1000 } })
const catalogueURL = await moduleURL('src/lib/catalogue.ts')
const configURL = await moduleURL('src/lib/config.ts')
const { monthlyCarHref, carHref } = await import(catalogueURL)
const stubComponent = dataURL('export default function Component() { return null }')
const fleetURL = dataURL(
  `const car=${JSON.stringify(car)}; export const getCarByRoute=(brand)=>brand==='unknown'?undefined:car; export const getRelatedCars=()=>[]; export const getAllCars=()=>[car]; export const getBrands=()=>[]; export const getBodyTypes=()=>[]; export const categorySlug=x=>x;`,
)
const replacements = {
  'react/jsx-runtime': pathToFileURL(require.resolve('react/jsx-runtime')).href,
  'next/navigation': dataURL(
    `export function notFound(){throw new Error('NOT_FOUND')} export function permanentRedirect(url){throw new Error('REDIRECT:'+url)}`,
  ),
  'next/headers': dataURL('export const headers=async()=>new Map()'),
  'next/link': dataURL(
    `import React from ${JSON.stringify(reactURL)}; export default function Link({children,...props}){return React.createElement('a',props,children)}`,
  ),
  '@/lib/fleet': fleetURL,
  '@/lib/db': dataURL('export const reservedDates=()=>[]'),
  '@/lib/catalogue': catalogueURL,
  '@/lib/config': configURL,
  '@/lib/monthly-pricing': await moduleURL('src/lib/monthly-pricing.ts'),
  '@/lib/home-rentals': await moduleURL('src/lib/home-rentals.ts'),
  '@/lib/event-guides': await moduleURL('src/lib/event-guides.ts'),
  '@/components/CarGallery': stubComponent,
  '@/components/CarCard': stubComponent,
  '@/components/VehicleTitle': dataURL(
    ts
      .transpileModule(await readFile('src/components/VehicleTitle.tsx', 'utf8'), {
        compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext },
      })
      .outputText.replaceAll("from 'react'", 'from ' + JSON.stringify(reactURL))
      .replaceAll(
        'from "react/jsx-runtime"',
        'from ' + JSON.stringify(pathToFileURL(require.resolve('react/jsx-runtime')).href),
      ),
  ),
  '@/components/ReserveVehicle': dataURL(
    `import React from ${JSON.stringify(reactURL)}; export default function Reserve({plan,children}){return React.createElement('div',{'data-booking-plan':plan||'daily'},children)}`,
  ),
  '@/components/RegionalProvider': dataURL(
    `import React from ${JSON.stringify(reactURL)}; export const T=({children})=>children; export const Price=({amount})=>React.createElement('span',{'data-price':amount},amount)`,
  ),
}
let source = ts.transpileModule(await readFile('src/components/VehicleDetail.tsx', 'utf8'), {
  compilerOptions: {
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText
for (const [from, to] of Object.entries(replacements))
  source = source
    .replaceAll("from '" + from + "'", "from '" + to + "'")
    .replaceAll('from "' + from + '"', 'from "' + to + '"')
const { default: VehicleDetail, vehicleMetadata } = await import(dataURL(source))
const props = (query) => ({
  params: Promise.resolve({ slug: car.brandSlug, model: car.modelSlug }),
  searchParams: Promise.resolve(query || {}),
})

test('monthly vehicle pages have distinct canonical metadata, 30-day pricing and monthly booking context', async () => {
  const meta = await vehicleMetadata(props(), true)
  assert.equal(meta.alternates.canonical, monthlyCarHref(car))
  assert.match(meta.title, /Monthly Rental/)
  assert.match(meta.description, /30 days/)
  const html = renderToStaticMarkup(await VehicleDetail({ ...props(), monthlyPage: true }))
  assert.ok(html.includes('data-price="24000"'))
  assert.ok(html.includes('/ MONTH'))
  assert.ok(!html.includes('/ DAY'))
  assert.ok(html.includes('data-booking-plan="monthly"'))
  assert.ok(html.includes('Rental rates'))
  const json = JSON.parse(html.match(/<script[^>]*>(.*?)<\/script>/s)[1])
  assert.ok(json.url.endsWith(monthlyCarHref(car)))
  const daily = renderToStaticMarkup(await VehicleDetail(props()))
  assert.ok(daily.includes('/ DAY'))
  assert.ok(daily.includes('data-booking-plan="daily"'))
  assert.equal((await vehicleMetadata(props())).alternates.canonical, carHref(car))
})

test('old monthly query links redirect to the dedicated route and unknown monthly cars return not found', async () => {
  await assert.rejects(
    VehicleDetail(props({ plan: 'monthly', colour: 'black', start: '2026-12-01' })),
    (error) =>
      error.message === 'REDIRECT:' + monthlyCarHref(car) + '?start=2026-12-01&colour=black',
  )
  await assert.rejects(
    VehicleDetail({
      ...props(),
      params: Promise.resolve({ slug: 'unknown', model: 'unknown' }),
      monthlyPage: true,
    }),
    /NOT_FOUND/,
  )
})

test('monthly catalogue and vehicle URLs appear exactly once in the sitemap', async () => {
  const { siteConfig } = await import(configURL)
  const { default: sitemap } = await import(
    await moduleURL('src/app/sitemap.ts', {
      '@/lib/fleet': fleetURL,
      '@/lib/catalogue': catalogueURL,
      '@/lib/config': configURL,
      '@/lib/home-rentals': await moduleURL('src/lib/home-rentals.ts'),
      '@/lib/event-guides': await moduleURL('src/lib/event-guides.ts'),
      '@/lib/location-routing': dataURL("export const locationHref=()=>''"),
      '@/lib/location-pages': dataURL('export const locationPages=[]'),
      '@/lib/occasion-pages': dataURL('export const occasionPages=[]'),
    })
  )
  const urls = sitemap().map((row) => row.url)
  for (const href of ['/monthly-luxury-car-rental', monthlyCarHref(car), carHref(car)])
    assert.equal(urls.filter((url) => url === siteConfig.url + href).length, 1)
})
