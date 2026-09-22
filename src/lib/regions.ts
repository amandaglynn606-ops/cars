export const languages = [
  { code: 'en', name: 'English', intl: 'en-AE' },
  { code: 'ar', name: 'العربية', intl: 'ar-AE' },
  { code: 'ru', name: 'Русский', intl: 'ru-RU' },
  { code: 'tr', name: 'Türkçe', intl: 'tr-TR' },
  { code: 'de', name: 'Deutsch', intl: 'de-DE' },
  { code: 'nl', name: 'Nederlands', intl: 'nl-NL' },
  { code: 'az', name: 'Azərbaycanca', intl: 'az-AZ' },
  { code: 'ka', name: 'ქართული', intl: 'ka-GE' },
  { code: 'it', name: 'Italiano', intl: 'it-IT' },
  { code: 'fr', name: 'Français', intl: 'fr-FR' },
  { code: 'uk', name: 'Українська', intl: 'uk-UA' },
] as const
export type Language = (typeof languages)[number]['code']
export const currencies = [
  { code: 'AED', name: 'UAE dirham', label: 'Dirham', symbol: 'د.إ' },
  { code: 'USD', name: 'US dollar', label: 'U.S. Dollar', symbol: '$' },
  { code: 'GBP', name: 'British pound', label: 'GBP', symbol: '£' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'CAD', name: 'Canadian dollar', symbol: 'C$' },
  { code: 'RUB', name: 'Russian ruble', symbol: '₽' },
  { code: 'TRY', name: 'Turkish lira', symbol: '₺' },
  { code: 'AZN', name: 'Azerbaijani manat', symbol: '₼' },
  { code: 'GEL', name: 'Georgian lari', symbol: '₾' },
  { code: 'UAH', name: 'Ukrainian hryvnia', symbol: '₴' },
] as const
export type Currency = (typeof currencies)[number]['code']
export type ExchangeRates = {
  date: string | null
  source: string | null
  rates: Partial<Record<Currency, number>>
}
export const validLanguage = (value: unknown): value is Language =>
  languages.some((l) => l.code === value)
export const validCurrency = (value: unknown): value is Currency =>
  currencies.some((c) => c.code === value)
