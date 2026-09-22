import type { MetadataRoute } from 'next'
import { getAllCars, getBrands, getBodyTypes, categorySlug } from '@/lib/fleet'
import { carHref, monthlyCarHref } from '@/lib/catalogue'
import { siteConfig } from '@/lib/config'
import { locationHref } from '@/lib/location-routing'
import { locationPages } from '@/lib/location-pages'
import { occasionPages } from '@/lib/occasion-pages'
import { rentalEvents } from '@/lib/home-rentals'
import { eventHref } from '@/lib/event-guides'
export const dynamic = 'force-dynamic'
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    '',
    '/fleet',
    '/monthly-luxury-car-rental',
    '/brands',
    '/categories',
    '/about',
    '/contact',
    '/partners',
    '/partners/consign-your-car',
    '/partners/rental-agencies',
    '/locations',
    '/occasions',
    '/events',
  ]
  return [
    ...rentalEvents.map((event) => ({ url: siteConfig.url + eventHref(event.slug) })),
    ...pages.map((p) => ({ url: siteConfig.url + p })),
    ...locationPages.map((page) => ({ url: siteConfig.url + locationHref(page) })),
    ...occasionPages.map((page) => ({ url: siteConfig.url + '/occasions/' + page.slug })),
    ...getBrands().map((b) => ({ url: siteConfig.url + '/brands/' + categorySlug(b.name) })),
    ...getBodyTypes().map((c) => ({ url: siteConfig.url + '/categories/' + categorySlug(c.name) })),
    ...getAllCars()
      .filter((car) => car.pricing.daily !== null && car.pricing.daily > 0)
      .map((car) => ({
        url: siteConfig.url + monthlyCarHref(car),
        lastModified: new Date(car.updatedAt),
      })),
    ...getAllCars().map((c) => ({
      url: siteConfig.url + carHref(c),
      lastModified: new Date(c.updatedAt),
    })),
  ]
}
