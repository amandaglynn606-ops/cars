import assert from 'node:assert/strict'
const base = 'http://127.0.0.1:43117'
const xml = await (await fetch(base + '/sitemap.xml')).text()
const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, '&'))
assert.ok(urls.length > 140)
for (const url of urls) assert.equal(new URL(url).origin, base)
for (let i = 0; i < urls.length; i += 4)
  await Promise.all(
    urls.slice(i, i + 4).map(async (url) => {
      const r = await fetch(url)
      assert.equal(r.status, 200, url)
      const html = await r.text()
      assert.ok(html.includes('<h1'), url)
      assert.ok(!html.includes('Application error:'), url)
    }),
  )
for (const [from, to] of [
  ['/fleet/lamborghini-revuelto', '/fleet/lamborghini/revuelto'],
  ['/fleet/brand/lamborghini', '/brands/lamborghini'],
  ['/fleet/type/super-sport', '/categories/supersport'],
  ['/fleet/suv', '/categories/suv'],
  ['/fleet/range-rover/land-rover-defender', '/fleet/land-rover/defender'],
]) {
  const r = await fetch(base + from, { redirect: 'manual' })
  assert.equal(r.status, 308, from)
  assert.equal(new URL(r.headers.get('location'), base).pathname, to)
}
for (const endpoint of ['/api/admin/vehicles', '/api/admin/reservations', '/api/admin/audit'])
  assert.equal((await fetch(base + endpoint)).status, 401)
assert.equal((await fetch(base + '/fleet/no-such-brand/no-such-car')).status, 404)
console.log(
  `Verified ${urls.length} canonical pages, 5 legacy redirects, 3 protected endpoints and unknown-route 404 handling.`,
)
