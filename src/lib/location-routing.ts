import type { LocationPage } from './location-pages'
export const locationEmirates = [
  { slug: 'dubai', name: 'Dubai' },
  { slug: 'sharjah', name: 'Sharjah' },
  { slug: 'fujairah', name: 'Fujairah' },
  { slug: 'ajman', name: 'Ajman' },
  { slug: 'umm-al-quwain', name: 'Umm Al Quwain' },
  { slug: 'ras-al-khaimah', name: 'Ras Al Khaimah' },
  { slug: 'abu-dhabi', name: 'Abu Dhabi' },
] as const
export const locationHref = (location: Pick<LocationPage, 'slug'> | string) =>
  '/' + (typeof location === 'string' ? location : location.slug) + '-luxury-car-rental'
export const findLocationRoute = (segment: string, pages: LocationPage[]) =>
  pages.find((page) => locationHref(page) === '/' + segment)
export const locationGroups = (pages: LocationPage[]) =>
  locationEmirates.map((emirate) => ({
    name: emirate.name,
    href: locationHref(emirate.slug),
    links: pages
      .filter((page) => page.region === emirate.name && page.slug !== emirate.slug)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((page) => ({ name: page.name, href: locationHref(page) })),
  }))
export const locationDescription = (page: LocationPage) =>
  'Plan luxury car rental in ' +
  page.name +
  (page.name !== page.region ? ', ' + page.region : '') +
  '. Compare models and rates, check local handover details and request your dates.'
