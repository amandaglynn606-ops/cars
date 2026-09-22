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
const replacements = {
  react: reactURL,
  'react/jsx-runtime': pathToFileURL(require.resolve('react/jsx-runtime')).href,
  'next/navigation': dataURL('export const useRouter=()=>({push:()=>{}})'),
  'next/image': dataURL(
    `import React from ${JSON.stringify(reactURL)};export default function Image({src,alt}){return React.createElement('img',{src,alt})}`,
  ),
  'next/link': dataURL(
    `import React from ${JSON.stringify(reactURL)};export default function Link({children,...props}){return React.createElement('a',props,children)}`,
  ),
  './Icon': dataURL('export default function Icon(){return null}'),
  './WhatsappIcon': dataURL('export default function Icon(){return null}'),
  './RegionalProvider': dataURL(
    'export const T=({children})=>children; export const Price=({amount})=>amount; export const useRegional=()=>({t:value=>value})',
  ),
  './BookingContactProvider': dataURL(
    'export const useBookingContact=()=>({contact:globalThis.bookingTestContact||null,setContact:()=>{}})',
  ),
  '@/lib/catalogue': await moduleURL('src/lib/catalogue.ts'),
  '@/lib/whatsapp': await moduleURL('src/lib/whatsapp.ts', {
    './config': await moduleURL('src/lib/config.ts'),
    './format': await moduleURL('src/lib/format.ts'),
  }),
}
async function component(file) {
  let source = ts.transpileModule(await readFile(file, 'utf8'), {
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
  return (await import(dataURL(source))).default
}
const PhoneField = await component('src/components/PhoneField.tsx')
// Use the actual shared phone component when rendering the booking steps.
globalThis.bookingTestPhoneField = PhoneField
replacements['./PhoneField'] = dataURL('export default globalThis.bookingTestPhoneField')
const Reserve = await component('src/components/ReserveVehicle.tsx')
const Booking = await component('src/components/BookingForm.tsx')
const [car] = JSON.parse(await readFile('data/fleet.json', 'utf8'))
test('vehicle-page first step collects only contact details, with dates and documents deferred', () => {
  globalThis.bookingTestContact = null
  const html = renderToStaticMarkup(React.createElement(Reserve, { car, reservations: [] }))
  for (const field of ['name', 'email', 'phone'])
    assert.equal((html.match(new RegExp('name="' + field + '"', 'g')) || []).length, 1)
  assert.ok(!html.includes('type="date"'))
  assert.ok(!html.includes('name="location"'))
  assert.ok(!html.includes('type="file"'))
  assert.ok(html.includes('Continue to reservation'))
})
test('reservation second step carries contact details without repeating inputs, and accepts a custom address and documents', () => {
  globalThis.bookingTestContact = {
    vehicleId: car.id,
    name: 'Test Driver',
    email: 'driver@example.invalid',
    phone: '+971545974005',
  }
  const html = renderToStaticMarkup(React.createElement(Booking, { cars: [car], initialCar: car }))
  for (const field of ['name', 'email', 'phone']) assert.ok(!html.includes('name="' + field + '"'))
  assert.ok(html.includes('driver@example.invalid'))
  assert.equal((html.match(/type="date"/g) || []).length, 2)
  assert.ok(html.includes('name="location"'))
  assert.ok(html.includes('type="file"'))
  assert.ok(html.includes('.pdf,.jpg,.jpeg'))
  assert.ok(html.includes('Edit contact details'))
})
test('a direct visit or refreshed booking can start with contact details without losing access to the flow', () => {
  globalThis.bookingTestContact = null
  const html = renderToStaticMarkup(React.createElement(Booking, { cars: [car], initialCar: car }))
  assert.ok(html.includes('name="email"'))
  assert.ok(!html.includes('type="date"'))
})
