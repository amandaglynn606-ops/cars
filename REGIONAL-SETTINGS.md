# Language and currency controls

The top bar offers English, Arabic, Russian, Turkish, German, Dutch, Azerbaijani, Georgian, Italian, French and Ukrainian. The visible Language and Currency labels are hidden, with accessible labels retained. Currency options show a name followed by its symbol: Dirham د.إ, GBP £, U.S. Dollar $, Euro €, and the corresponding name/symbol for the remaining currencies. The navigation logo is centered using equal side columns; smaller screens place search and reservation controls on a second row.

Local dictionaries translate the customer interface, homepage, rental questions and booking guidance. Model names and stored vehicle identities are preserved. Arabic sets the page direction to RTL. Selection cookies remember language and currency across navigation and reloads; invalid cookie values fall back to English and AED. Translations are locally authored and have not received independent native-speaker review. Some technical specifications, service messages and metadata retain their source English wording.

## Verified exchange rates

AED, USD, GBP, EUR, CAD, RUB, TRY, AZN, GEL and UAH are enabled. Following the user's authorization, a verified snapshot dated 15 September 2026 was downloaded from ExchangeRate-API. All ten conversions have been checked in the browser.

`src/lib/exchange.ts` fetches the fixed ExchangeRate-API AED endpoint on the server, with 24-hour revalidation and a three-second timeout. It rejects missing/nonfinite/nonpositive rates, an incorrect base currency and timestamps more than 72 hours from the current time. Provider failure falls back to the checked local snapshot with its original date. `node scripts/update-exchange-rates.mjs` refreshes that fallback snapshot. The top bar shows the rate date and provider attribution for foreign currencies. Conversions are estimates; the final quote remains AED.

All underlying catalogue rates and reservation data stay in AED. Price displays and price-filter input conversion use the selected currency when its verified rate exists. Original AED filter values remain in the URL, and location option values remain the canonical stored names. Administrative pricing and enquiry messages use the stored AED values.

## Checks

`node scripts/test-regional-settings.mjs` covers every language, direction, centered logo and responsive widths, hidden control labels, currency names, supported-rate display, preference persistence and rejection of invalid cookies. It checks Arabic fleet accessibility and blocks test-browser traffic outside loopback. Tests report enabled currencies separately so unavailable conversions are not represented as verified.

Existing homepage/browser tests cover selection, search, booking, authentication and upload boundaries. Local security scanning is limited to the configured rules; it does not establish complete security or translation accuracy. No dependencies were added and no public deployment was performed.

The new location and occasion headings and shared controls have additional translations. The detailed destination and occasion guidance is original English content marked with `lang="en"`; it has not been translated into all languages.
