import type { MetadataRoute } from 'next'
import { getAllCars } from '@/lib/fleet'
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

  return [...staticRoutes, ...carRoutes]
}
