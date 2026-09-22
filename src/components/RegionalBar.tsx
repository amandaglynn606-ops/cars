'use client'
import { languages, currencies } from '@/lib/regions'
import { T, useRegional } from './RegionalProvider'
export default function RegionalBar() {
  const { language, currency, setLanguage, setCurrency, exchange, busy, error, t } = useRegional()
  return (
    <div className="z-regional-bar">
      <div className="container-lux z-regional-inner">
        <span className="z-regional-note">
          <T>Delivery across the UAE. Charges vary by location.</T>
        </span>
        <div className="z-regional-controls">
          <label>
            <span className="sr-only">
              <T>Language</T>
            </span>
            <select
              aria-label={t('Language')}
              value={language}
              disabled={busy}
              onChange={(e) => void setLanguage(e.target.value)}
            >
              {languages.map((item) => (
                <option key={item.code} value={item.code} lang={item.code}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">
              <T>Currency</T>
            </span>
            <select
              aria-label={t('Currency')}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {currencies.map((item) => (
                <option
                  key={item.code}
                  value={item.code}
                  aria-label={t(item.name)}
                  disabled={!exchange.rates[item.code]}
                >
                  {t('label' in item ? item.label : item.name)} {item.symbol}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      {currency !== 'AED' && (
        <p className="z-conversion-note">
          <T>Estimated conversion. Final quote in AED.</T> <T>Rates dated</T> {exchange.date}
          {' · '}
          <a href="https://www.exchangerate-api.com" rel="noreferrer">
            ExchangeRate-API
          </a>
        </p>
      )}
      {error && (
        <p role="alert" className="z-conversion-note">
          {t(error)}
        </p>
      )}
    </div>
  )
}
