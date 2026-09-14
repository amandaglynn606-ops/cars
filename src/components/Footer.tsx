import Link from 'next/link'
import { siteConfig } from '@/lib/config'
import { getBrands } from '@/lib/fleet'

export default function Footer() {
  const brands = getBrands().slice(0, 8)
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-white/10 bg-ink-900">
      <div className="container-lux py-20">
        <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <p className="font-display text-2xl tracking-[0.14em] uppercase">
              {siteConfig.name.split(' ')[0]}
            </p>
            <p className="eyebrow mt-1">Dubai</p>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
              Supercar and luxury vehicle hire across the Emirates. Delivered to your hotel,
              residence or terminal.
            </p>
          </div>

          <div>
            <p className="eyebrow mb-5">Browse</p>
            <ul className="space-y-3 text-sm text-bone/70">
              <li>
                <Link href="/fleet" className="transition-colors hover:text-gold-500">
                  Full fleet
                </Link>
              </li>
              <li>
                <Link href="/book" className="transition-colors hover:text-gold-500">
                  Make a booking
                </Link>
              </li>
              <li>
                <Link href="/services" className="transition-colors hover:text-gold-500">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition-colors hover:text-gold-500">
                  About us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-gold-500">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-5">Marques</p>
            <ul className="space-y-3 text-sm text-bone/70">
              {brands.map((brand) => (
                <li key={brand.name}>
                  <Link
                    href={`/fleet?brand=${encodeURIComponent(brand.name)}`}
                    className="transition-colors hover:text-gold-500"
                  >
                    {brand.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-5">Delivery</p>
            <ul className="space-y-3 text-sm text-bone/70">
              {siteConfig.locations.map((location) => (
                <li key={location}>{location}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="hairline mt-16 flex flex-col gap-4 pt-8 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>
          <p>Rates in AED. A valid driving licence and passport are required at handover.</p>
        </div>
      </div>
    </footer>
  )
}
