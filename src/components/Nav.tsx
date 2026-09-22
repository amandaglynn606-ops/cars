'use client'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import ZaviLogo from './ZaviLogo'
import Icon from './Icon'
import RegionalBar from './RegionalBar'
import OccasionNavigation, { type OccasionLink } from './OccasionNavigation'
import FleetNavigation from './FleetNavigation'
import EventNavigation, { type EventLink } from './EventNavigation'
import BrowseNavigation, { type BrowseGroup } from './BrowseNavigation'
import { Price, T, useRegional } from '@/components/RegionalProvider'
import { categorySlug, searchDestination } from '@/lib/catalogue'
export interface MenuCar {
  id: string
  name: string
  brand: string
  categories: string[]
  href: string
  thumbnail: string
  price: number
  searchText: string
  model: string
  keywords: string[]
}
type Facet = { name: string; count: number }
export default function Nav({
  cars,
  brands,
  categories,
  occasions,
  locationGroups,
  events,
}: {
  cars: MenuCar[]
  brands: Facet[]
  categories: Facet[]
  occasions: OccasionLink[]
  locationGroups: BrowseGroup[]
  events: EventLink[]
}) {
  const pathname = usePathname()
  const { t } = useRegional()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeBrowse, setActiveBrowse] = useState('')
  const brandGroups = [
    {
      name: 'Car brands',
      links: [...brands]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((brand) => ({
          name: brand.name,
          href: '/brands/' + categorySlug(brand.name),
          count: brand.count,
        })),
    },
  ]
  const browse = (name: string) => {
    setSearchOpen(false)
    setActiveBrowse(name)
  }
  const searchBox = useRef<HTMLDivElement>(null)
  const dialog = useRef<HTMLDialogElement>(null),
    header = useRef<HTMLElement>(null)
  useEffect(() => {
    setOpen(false)
    setSearchOpen(false)
    setQuery(searchParams.get('search') || '')
  }, [pathname, searchParams])
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!searchBox.current?.contains(event.target as Node)) setSearchOpen(false)
    }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [])
  useEffect(() => {
    if (open) {
      dialog.current?.showModal()
      document.body.style.overflow = 'hidden'
    } else {
      dialog.current?.close()
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])
  useEffect(() => {
    const element = header.current
    if (!element) return
    const resize = () =>
      element.style.setProperty('--z-nav-bottom', element.getBoundingClientRect().bottom + 'px')
    const observer = new ResizeObserver(resize)
    observer.observe(element)
    resize()
    return () => observer.disconnect()
  }, [])
  const close = () => {
    setActiveBrowse('')
    setOpen(false)
    setSearchOpen(false)
  }
  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    close()
    router.push(searchDestination(query, cars, brands))
  }
  const found = [...cars]
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((c) =>
      query
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .every((word) => c.searchText.includes(word)),
    )
  const navigationLinks = [
    ['Monthly rentals', '/monthly-luxury-car-rental'],
    ['Earn with us', '/partners'],
    ['About Zavi', '/about'],
    ['Contact', '/contact'],
    ['Reserve a vehicle', '/book'],
  ]
  return (
    <header ref={header} className="z-header">
      <RegionalBar />
      <div className="z-header-inner">
        <Link href="/" className="z-nav-logo" aria-label="Zavi home" onClick={close}>
          <ZaviLogo />
        </Link>
        <nav aria-label={t('Main navigation')} className="z-desktop-nav">
          <FleetNavigation
            cars={cars}
            categories={categories}
            onNavigate={close}
            onOpen={() => browse('fleet')}
            dismiss={searchOpen || open || activeBrowse !== 'fleet'}
          />
          <Link
            href="/monthly-luxury-car-rental"
            onClick={close}
            aria-current={pathname.startsWith('/monthly-luxury-car-rental') ? 'page' : undefined}
          >
            <T>Monthly rentals</T>
          </Link>
          <BrowseNavigation
            label="Car brands"
            href="/brands"
            groups={brandGroups}
            onNavigate={close}
            onOpen={() => browse('brands')}
            dismiss={searchOpen || open || activeBrowse !== 'brands'}
          />
          <BrowseNavigation
            label="Locations"
            href="/locations"
            groups={locationGroups}
            collapsible
            onNavigate={close}
            onOpen={() => browse('locations')}
            dismiss={searchOpen || open || activeBrowse !== 'locations'}
          />
          <OccasionNavigation
            occasions={occasions}
            dismiss={searchOpen || open || activeBrowse !== 'occasions'}
            onNavigate={close}
            onOpen={() => browse('occasions')}
          />
          <EventNavigation
            events={events}
            onNavigate={close}
            onOpen={() => browse('events')}
            dismiss={searchOpen || open || activeBrowse !== 'events'}
          />
        </nav>
        <div className="z-header-actions">
          <div
            className="z-nav-search-wrap"
            ref={searchBox}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node)) setSearchOpen(false)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setSearchOpen(false)
            }}
          >
            <form className="z-nav-search" role="search" action="/fleet" onSubmit={submitSearch}>
              <input
                type="search"
                name="search"
                aria-label={t('Search vehicles')}
                placeholder={t('Search cars')}
                value={query}
                autoComplete="off"
                onFocus={() => {
                  setSearchOpen(true)
                }}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setSearchOpen(true)
                }}
              />
              <button type="submit" aria-label={t('Search fleet')}>
                <Icon name="search" size={18} />
              </button>
            </form>
            {searchOpen && query.trim() && (
              <div
                className="z-nav-search-results"
                role="region"
                aria-label={t('Search suggestions')}
              >
                <p className="z-note" role="status">
                  {found.length} <T>matching vehicles</T>
                </p>
                {found.slice(0, 6).map((car) => (
                  <Link key={car.id} href={car.href} onClick={close}>
                    <span>
                      <T>{car.name}</T>
                      <small>
                        <Price amount={car.price} /> / <T>day</T>
                      </small>
                    </span>
                    <Icon name="arrow" size={16} />
                  </Link>
                ))}
                <Link
                  className="z-text-link"
                  href={'/fleet?search=' + encodeURIComponent(query.trim())}
                  onClick={close}
                >
                  <T>View search results </T>
                  <Icon name="arrow" size={16} />
                </Link>
              </div>
            )}
          </div>
          <Link href="/book" className="z-button z-header-cta" onClick={close}>
            <T>Reserve a vehicle </T>
            <Icon name="arrow" size={16} />
          </Link>
        </div>
        <button
          className="z-icon-button z-menu-toggle"
          aria-label={t('Open navigation')}
          aria-expanded={open}
          onClick={() => {
            setActiveBrowse('')
            setOpen(true)
          }}
        >
          <Icon name="menu" />
        </button>
      </div>
      <dialog
        ref={dialog}
        className="z-nav-dialog"
        aria-label={t('Navigation')}
        onCancel={() => setOpen(false)}
      >
        <div className="z-drawer-top">
          <ZaviLogo />
          <button
            className="z-icon-button"
            aria-label={t('Close navigation')}
            onClick={() => setOpen(false)}
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="z-mobile-nav-scroll">
          <FleetNavigation
            cars={cars}
            categories={categories}
            mobile
            onNavigate={close}
            dismiss={!open}
          />

          <BrowseNavigation
            label="Car brands"
            href="/brands"
            groups={brandGroups}
            mobile
            dismiss={!open}
            onNavigate={close}
          />
          <BrowseNavigation
            label="Locations"
            href="/locations"
            groups={locationGroups}
            collapsible
            mobile
            dismiss={!open}
            onNavigate={close}
          />
          <OccasionNavigation occasions={occasions} mobile dismiss={!open} onNavigate={close} />
          <EventNavigation events={events} mobile dismiss={!open} onNavigate={close} />
          <nav aria-label={t('Mobile navigation')}>
            {navigationLinks.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={close}
                aria-current={
                  pathname === href || pathname.startsWith(href + '/') ? 'page' : undefined
                }
              >
                <T>{label}</T>
                <Icon name="arrow" />
              </Link>
            ))}
          </nav>
        </div>
        <p className="z-kicker">
          <T>Zavi · Car rental in Dubai</T>
        </p>
      </dialog>
    </header>
  )
}
