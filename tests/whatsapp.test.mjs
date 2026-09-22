import test from 'node:test'
import assert from 'node:assert/strict'
import { moduleURL } from './load-module.mjs'
const { buildQuickChatUrl } = await import(
  await moduleURL('src/lib/whatsapp.ts', {
    './config': await moduleURL('src/lib/config.ts'),
    './format': await moduleURL('src/lib/format.ts'),
  })
)

test('WhatsApp links go directly to the supplied business number with an encoded vehicle enquiry', () => {
  const car = { name: 'Mercedes-Benz A & B + Special' }
  const url = new URL(buildQuickChatUrl(car, 'daily', 'Black & Gold'))
  assert.equal(url.origin, 'https://wa.me')
  assert.equal(url.pathname, '/971545974005')
  assert.deepEqual([...url.searchParams.keys()], ['text'])
  assert.ok(url.searchParams.get('text').includes(car.name))
  assert.ok(url.searchParams.get('text').includes('Black & Gold'))
  assert.equal(url.hash, '')
})
test('monthly and general WhatsApp buttons preserve the correct enquiry context', () => {
  const monthly = new URL(buildQuickChatUrl({ name: 'Rolls-Royce Cullinan' }, 'monthly'))
  assert.match(monthly.searchParams.get('text'), /Cullinan for 30 days with the 20% monthly offer/)
  const general = new URL(buildQuickChatUrl())
  assert.equal(general.pathname, '/971545974005')
  assert.match(general.searchParams.get('text'), /Hi Zavi/)
  assert.ok(!general.searchParams.get('text').includes('undefined'))
})
