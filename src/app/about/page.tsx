import Link from 'next/link'
import Image from 'next/image'
import { getAllCars, getBrands, getFeaturedCars } from '@/lib/fleet'
import Icon from '@/components/Icon'
export const metadata = {
  title: 'About Zavi',
  description:
    'Learn how to review cars and request a rental with Zavi, including availability, quotes and booking confirmation.',
  alternates: { canonical: '/about' },
}
export default function Page() {
  const cars = getAllCars(),
    brands = getBrands(),
    hero = getFeaturedCars(1)[0]
  return (
    <div className="container-lux">
      <header className="z-page-hero">
        <p className="z-kicker">
          <T>About Zavi</T>
        </p>
        <h1>
          <T>Choosing your rental car</T>
        </h1>
        <p className="z-lead">
          <T>Explore the fleet and understand the steps before booking.</T>
        </p>
      </header>
      {hero && (
        <div style={{ position: 'relative', aspectRatio: '2.3', margin: '40px 0' }}>
          <Image
            src={hero.featuredImage}
            alt={hero.name}
            fill
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
        </div>
      )}
      <section className="z-section">
        <header className="z-section-heading">
          <div>
            <p className="z-kicker">
              {cars.length} <T>vehicles · </T>
              {brands.length} <T>brands</T>
            </p>
            <h2>
              <T>Explore cars.</T>
              <br />
              <span>
                <T>Check the details.</T>
              </span>
            </h2>
          </div>
          <p>
            <T>
              Zavi lists rental cars in Dubai with photos, daily rates and available specifications.
              You can review vehicles and send a request for your preferred dates. A request does
              not confirm a booking or take payment.
            </T>
          </p>
        </header>
        <div className="z-steps">
          <div>
            <span className="z-step-number">01</span>
            <h3>
              <T>Explore the listings</T>
            </h3>
            <p>
              <T>
                Browse a full catalogue of supercars, luxury saloons, convertibles and SUVs, with
                colour previews and listed rates.
              </T>
            </p>
          </div>
          <div>
            <span className="z-step-number">02</span>
            <h3>
              <T>Share your requirements</T>
            </h3>
            <p>
              <T>
                Choose your dates, preferred vehicle and a listed delivery location. Add your
                arrival details or preferred colour if needed.
              </T>
            </p>
          </div>
          <div>
            <span className="z-step-number">03</span>
            <h3>
              <T>Confirm the terms</T>
            </h3>
            <p>
              <T>
                Ask the team to confirm availability, the total price, mileage allowance, deposit,
                insurance, driver requirements and cancellation terms before agreeing to a rental.
              </T>
            </p>
          </div>
        </div>
        <Link className="z-button" href="/fleet" style={{ marginTop: 40 }}>
          <T>Browse rental cars</T>
          <Icon name="arrow" />
        </Link>
      </section>
    </div>
  )
}

import { T } from '@/components/RegionalProvider'
