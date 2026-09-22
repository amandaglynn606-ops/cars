import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { siteConfig } from '@/lib/config'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import WhatsappFab from '@/components/WhatsappFab'
import BookingContactProvider from '@/components/BookingContactProvider'
import PageFrame from '@/components/PageFrame'
import { getAllCars } from '@/lib/fleet'
import { locationPages } from '@/lib/location-pages'
import { locationGroups } from '@/lib/location-routing'
import { occasionPages } from '@/lib/occasion-pages'
import { rentalEvents } from '@/lib/home-rentals'
import { eventHref } from '@/lib/event-guides'
import { carHref, facetCounts, vehicleSearchText } from '@/lib/catalogue'
import './globals.css'
import { cookies } from 'next/headers'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import RegionalProvider from '@/components/RegionalProvider'
import { validLanguage, validCurrency, type ExchangeRates } from '@/lib/regions'
import { getExchangeRates } from '@/lib/exchange'
const qiswah = localFont({
  src: '../fonts/Qiswah.woff2',
  variable: '--font-qiswah',
  display: 'swap',
  weight: '400',
})
const haymila = localFont({
  src: '../fonts/Haymila-Regular.woff2',
  variable: '--font-haymila',
  display: 'swap',
  weight: '400',
})
export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: 'Zavi | Luxury Car Rental in Dubai', template: '%s | Zavi' },
  description: siteConfig.description,
  openGraph: {
    type: 'website',
    locale: 'en_AE',
    siteName: 'Zavi',
    title: 'Zavi',
    description: siteConfig.description,
  },
  icons: { icon: '/icon.svg' },
}
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const preferences = await cookies()
  const localeCookie = preferences.get('zavi-language')?.value
  const currencyCookie = preferences.get('zavi-currency')?.value
  const language = validLanguage(localeCookie) ? localeCookie : 'en'
  const exchange: ExchangeRates = await getExchangeRates()
  const currency =
    validCurrency(currencyCookie) && exchange.rates[currencyCookie] ? currencyCookie : 'AED'
  const dictionary =
    language === 'en'
      ? {}
      : JSON.parse(
          await readFile(path.join(process.cwd(), 'public', 'locales', language + '.json'), 'utf8'),
        )
  const cars = getAllCars()
  const menuCars = cars.map((c) => ({
    id: c.id,
    name: c.name,
    brand: c.brand || '',
    categories: c.categories,
    href: carHref(c),
    thumbnail: c.featuredImage,
    price: c.pricing.daily || 0,
    searchText: vehicleSearchText(c),
    model: c.model,
    keywords: c.keywords,
  }))
  return (
    <html
      lang={language}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className={qiswah.variable + ' ' + haymila.variable}
    >
      <body>
        <RegionalProvider
          initialLanguage={language}
          initialCurrency={currency}
          initialDictionary={dictionary}
          exchange={exchange}
        >
          <a className="z-skip" href="#main-content">
            <T>Skip to content</T>
          </a>
          <Nav
            events={rentalEvents.map(({ slug, name, venue, dateLabel }) => ({
              name,
              venue,
              dateLabel,
              href: eventHref(slug),
            }))}
            locationGroups={locationGroups(locationPages)}
            occasions={occasionPages.map(({ slug, name, group }) => ({ slug, name, group }))}
            cars={menuCars}
            brands={facetCounts(cars, 'brand')}
            categories={facetCounts(cars, 'categories')}
          />
          <BookingContactProvider>
            <PageFrame>{children}</PageFrame>
          </BookingContactProvider>
          <Footer />
          <WhatsappFab />
        </RegionalProvider>
      </body>
    </html>
  )
}

import { T } from '@/components/RegionalProvider'
