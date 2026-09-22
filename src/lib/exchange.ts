import 'server-only'
import snapshot from '../../data/exchange-rates.json'
import { currencies, type ExchangeRates } from './regions'

// Only this fixed provider is contacted, on the server. Never send visitor details.
export async function getExchangeRates(): Promise<ExchangeRates> {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/AED', {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(3000),
    })
    if (!response.ok) throw new Error('Rate provider unavailable')
    const data = await response.json()
    const timestamp = Number(data.time_last_update_unix) * 1000
    if (
      data.result !== 'success' ||
      data.base_code !== 'AED' ||
      data.rates?.AED !== 1 ||
      !Number.isFinite(timestamp) ||
      Math.abs(Date.now() - timestamp) > 72 * 3600000
    )
      throw new Error('Invalid rate data')
    const rates: ExchangeRates['rates'] = {}
    for (const { code } of currencies) {
      const value = data.rates[code]
      if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0 || value > 1000000)
        throw new Error('Invalid exchange rate')
      rates[code] = value
    }
    return {
      date: new Date(timestamp).toISOString().slice(0, 10),
      source: 'https://open.er-api.com/v6/latest/AED',
      rates,
    }
  } catch {
    // Keep the last checked, dated snapshot available when the provider is offline.
    return snapshot
  }
}
