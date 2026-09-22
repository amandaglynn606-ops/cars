import { mkdir, writeFile } from 'node:fs/promises'

// Explicitly approved source only. This never downloads or executes third-party code.
const endpoint = 'https://luxmotorsdxb.com/wp-json/wc/store/v1/products'
const products = []
for (let page = 1; page <= 20; page++) {
  const response = await fetch(`${endpoint}?per_page=100&page=${page}`, {
    redirect: 'error',
    signal: AbortSignal.timeout(30000),
  })
  if (!response.ok) throw new Error(`Catalogue HTTP ${response.status}`)
  const batch = await response.json()
  if (!Array.isArray(batch)) throw new Error('Unexpected catalogue response')
  products.push(...batch)
  if (batch.length < 100) break
}
await mkdir('.local', { recursive: true })
await writeFile(
  '.local/lux-source.json',
  JSON.stringify({ retrievedAt: new Date().toISOString(), endpoint, products }, null, 2),
)
console.log(`Saved ${products.length} source listings for factual import review.`)
