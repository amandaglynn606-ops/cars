'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  languages,
  validLanguage,
  validCurrency,
  type Language,
  type Currency,
  type ExchangeRates,
} from '@/lib/regions'
type Dictionary = Record<string, string>
type Region = {
  language: Language
  currency: Currency
  exchange: ExchangeRates
  busy: boolean
  error: string
  setLanguage: (language: string) => Promise<void>
  setCurrency: (currency: string) => void
  t: (text: string) => string
  money: (aed: number) => string
  rate: number
}
const RegionalContext = createContext<Region | null>(null)
const dictionaries = new Map<string, Dictionary>([['en', {}]])
function remember(key: string, value: string) {
  document.cookie = `${key}=${encodeURIComponent(value)}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`
}
export default function RegionalProvider({
  children,
  initialLanguage,
  initialCurrency,
  initialDictionary,
  exchange,
}: {
  children: ReactNode
  initialLanguage: Language
  initialCurrency: Currency
  initialDictionary: Dictionary
  exchange: ExchangeRates
}) {
  const [language, updateLanguage] = useState(initialLanguage)
  const [currency, updateCurrency] = useState(initialCurrency)
  const [dictionary, updateDictionary] = useState(initialDictionary)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  }, [language])
  async function setLanguage(value: string) {
    if (!validLanguage(value) || busy) return
    setBusy(true)
    setError('')
    try {
      let next = dictionaries.get(value)
      if (!next) {
        const response = await fetch(`/locales/${value}.json`)
        if (!response.ok) throw new Error('translation unavailable')
        const data: unknown = await response.json()
        if (
          !data ||
          typeof data !== 'object' ||
          Array.isArray(data) ||
          !Object.values(data).every((item) => typeof item === 'string')
        )
          throw new Error('invalid translation')
        next = data as Dictionary
        dictionaries.set(value, next)
      }
      updateDictionary(next)
      updateLanguage(value)
      remember('zavi-language', value)
    } catch {
      setError('Language could not be loaded. Please try again.')
    } finally {
      setBusy(false)
    }
  }
  function setCurrency(value: string) {
    if (!validCurrency(value) || !exchange.rates[value]) return
    updateCurrency(value)
    remember('zavi-currency', value)
  }
  function t(text: string): string {
    if (language === 'en') return text
    const key = text.replace(/\s+/g, ' ').trim()
    if (typeof dictionary[key] === 'string') return text.replace(text.trim(), dictionary[key])
    const counted = key.match(/^View all (\d+) (brands|vehicles|SUVs)$/)
    if (counted) return `${t('View all')} ${counted[1]} ${t(counted[2])}`
    return text
  }
  const rate = exchange.rates[currency] || 1
  const intl = languages.find((l) => l.code === language)!.intl
  const formatter = useMemo(() => new Intl.NumberFormat(intl, { maximumFractionDigits: 2 }), [intl])
  const money = (aed: number) => `${currency} ${formatter.format(aed * rate)}`
  return (
    <RegionalContext.Provider
      value={{
        language,
        currency,
        exchange,
        busy,
        error,
        setLanguage,
        setCurrency,
        t,
        money,
        rate,
      }}
    >
      {children}
    </RegionalContext.Provider>
  )
}
export function useRegional() {
  const value = useContext(RegionalContext)
  if (!value) throw new Error('RegionalProvider is required')
  return value
}
export function T({ children }: { children: string | number | null | undefined }) {
  const { t } = useRegional()
  return children == null ? null : t(String(children))
}
export function Price({ amount }: { amount: number }) {
  const { money, currency } = useRegional()
  return (
    <bdi data-price-aed={amount} data-currency={currency}>
      {money(amount)}
    </bdi>
  )
}
