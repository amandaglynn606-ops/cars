// Run only with authorization for exchange-rate network access.
import { writeFile } from 'node:fs/promises'
const source = 'https://open.er-api.com/v6/latest/AED'
const response = await fetch(source, { signal: AbortSignal.timeout(20000) })
if (!response.ok) throw new Error('Exchange-rate provider HTTP ' + response.status)
const data = await response.json()
if (data.result !== 'success' || data.base_code !== 'AED')
  throw new Error('Invalid exchange-rate response')
const codes = ['AED', 'USD', 'GBP', 'EUR', 'CAD', 'RUB', 'TRY', 'AZN', 'GEL', 'UAH']
const rates = {}
for (const code of codes) {
  const value = data.rates?.[code]
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0 || value > 1000000)
    throw new Error('Invalid rate for ' + code)
  rates[code] = value
}
if (rates.AED !== 1) throw new Error('Incorrect base rate')
const timestamp = Number(data.time_last_update_unix) * 1000
if (!Number.isFinite(timestamp) || Math.abs(Date.now() - timestamp) > 72 * 3600000)
  throw new Error('Exchange rates are stale or invalid')
await writeFile(
  'data/exchange-rates.json',
  JSON.stringify({ date: new Date(timestamp).toISOString().slice(0, 10), source, rates }, null, 2) +
    '\n',
)
console.log('Saved 10 AED exchange rates dated ' + new Date(timestamp).toISOString().slice(0, 10))
