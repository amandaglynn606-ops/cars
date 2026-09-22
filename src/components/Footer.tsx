import Link from 'next/link'
import ZaviLogo from './ZaviLogo'
import Icon from './Icon'
import { T } from './RegionalProvider'
import { getBrands, categorySlug } from '@/lib/fleet'
import { locationHref } from '@/lib/location-routing'
import './footer.css'

export default function Footer() {
  const groups = [
    {
      title: 'Find your drive',
      links: [
        ['The collection', '/fleet'],
        ['Car brands', '/brands'],
        ['Monthly rentals', '/monthly-luxury-car-rental'],
        ['Events & occasions', '/events'],
        ['Vehicle categories', '/categories'],
      ],
    },
    {
      title: 'Across the UAE',
      links: [
        ['Dubai', locationHref('dubai')],
        ['Abu Dhabi', locationHref('abu-dhabi')],
        ['Sharjah', locationHref('sharjah')],
        ['All locations', '/locations'],
      ],
    },
    {
      title: 'With Zavi',
      links: [
        ['About us', '/about'],
        ['Consign your car', '/partners/consign-your-car'],
        ['Agency subscriptions', '/partners/rental-agencies'],
        ['Contact the team', '/contact'],
      ],
    },
  ]
  return (
    <footer className="z-footer z-footer-redesign">
      <div className="container-lux">
        <div className="z-footer-invitation">
          <div>
            <p className="z-kicker">
              <T>The next chapter starts here</T>
            </p>
            <h2>
              <T>Where are you</T>
              <br />
              <em>
                <T>heading next?</T>
              </em>
            </h2>
          </div>
          <div className="z-footer-reserve">
            <p>
              <T>
                A city stay. A special evening. A month on your terms. Find the car for what comes
                next.
              </T>
            </p>
            <Link href="/book" className="z-button">
              <T>Find your drive</T>
              <Icon name="arrow" size={19} />
            </Link>
          </div>
        </div>
        <div className="z-footer-navigation">
          <div className="z-footer-identity">
            <Link href="/" aria-label="Zavi home">
              <ZaviLogo large />
            </Link>
            <p>
              <T>Luxury car rental.</T>
              <br />
              <T>Dubai and across the UAE.</T>
            </p>
            <Link href="/contact" className="z-footer-contact">
              <T>Talk to the team</T>
              <Icon name="arrow" size={17} />
            </Link>
            <span className="z-footer-location">
              <Icon name="pin" size={14} />
              <T>Dubai, United Arab Emirates</T>
            </span>
          </div>
          {groups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h3>
                <T>{group.title}</T>
              </h3>
              {group.links.map(([label, href]) => (
                <Link key={href} href={href}>
                  <T>{label}</T>
                </Link>
              ))}
            </nav>
          ))}
        </div>
        <div className="z-footer-marques">
          <span className="z-kicker">
            <T>Exceptional marques</T>
          </span>
          <div>
            {getBrands()
              .sort((a, b) => b.count - a.count)
              .slice(0, 6)
              .map((brand) => (
                <Link key={brand.name} href={'/brands/' + categorySlug(brand.name)}>
                  <T>{brand.name}</T>
                </Link>
              ))}
          </div>
        </div>
        <div className="z-footer-legal">
          <p>
            © {new Date().getFullYear()} Zavi. <T>All rights reserved.</T>
          </p>
          <div>
            <Link href="/privacy">
              <T>Privacy</T>
            </Link>
            <Link href="/image-credits">
              <T>Photo credits</T>
            </Link>
            <Link href="/admin">
              <T>Fleet management</T>
            </Link>
          </div>
          <a href="#main-content" className="z-footer-top">
            <T>Back to top</T>
            <Icon name="arrow" size={15} />
          </a>
        </div>
      </div>
    </footer>
  )
}
