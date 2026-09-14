import type { MetadataRoute } from 'next'
import { getAllCars, getBrands, getBodyTypes, categorySlug } from '@/lib/fleet'
import { siteConfig } from '@/lib/config'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['', '/fleet', '/book', '/services', '/about', '/contact'].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  const carRoutes = getAllCars().map((car) => ({
    url: `${siteConfig.url}/fleet/${car.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const categoryRoutes = [
    ...getBrands().map((b) => `/fleet/brand/${categorySlug(b.name)}`),
    ...getBodyTypes().map((t) => `/fleet/type/${categorySlug(t.name)}`),
  ].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }))

  return [...staticRoutes, ...categoryRoutes, ...carRoutes]
}
