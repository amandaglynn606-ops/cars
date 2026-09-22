import Link from 'next/link'
import FleetBrowser from '@/components/FleetBrowser'
import { T } from '@/components/RegionalProvider'
import { getAllCars } from '@/lib/fleet'
import { monthlyRentalCars } from '@/lib/home-rentals'
import Icon from '@/components/Icon'
import './monthly.css'

export const metadata = {
  title: 'Monthly Luxury Car Rental in Dubai | 30-Day Offers',
  description:
    'Compare monthly luxury car rentals in Dubai. Save 20% against 30 daily rentals, browse every available model and request a quote for delivery and mileage.',
  alternates: { canonical: '/monthly-luxury-car-rental' },
}

export default function MonthlyRentalsPage() {
  const cars = monthlyRentalCars(getAllCars())
  return (
    <div className="container-lux z-monthly-catalogue">
      <header className="z-page-hero z-collection-hero z-monthly-hero">
        <h1>
          <T>Monthly luxury car rental</T>
        </h1>
        <p className="z-lead">
          <T>
            Your Dubai stay, with a car for the whole month. Compare our collection with 20% off the
            equivalent of 30 daily rentals.
          </T>
        </p>
        <Link href="/book?plan=monthly" className="z-button">
          <T>Request a monthly quote</T>
          <Icon name="arrow" size={18} />
        </Link>
      </header>
      <p className="z-monthly-catalogue-note">
        <T>
          Prices cover 30 days. The crossed-out amount is 30 days at the current daily rate. Mileage
          allowance, insurance, deposit and delivery are confirmed with your quote.
        </T>
      </p>
      <FleetBrowser cars={cars} period="monthly" />
      <section className="z-monthly-guide" aria-labelledby="monthly-guide-heading">
        <h2 id="monthly-guide-heading">
          <T>A month that fits your plans.</T>
        </h2>
        <div>
          <article>
            <h3>
              <T>Choose around your stay</T>
            </h3>
            <p>
              <T>
                For a relocation, extended holiday or a longer work visit, compare seating, luggage
                space and the model you want to drive. Select a car to see its colours and 30-day
                price.
              </T>
            </p>
          </article>
          <article>
            <h3>
              <T>Confirm the complete quote</T>
            </h3>
            <p>
              <T>
                Share your collection date and delivery location. Confirm the mileage allowance,
                insurance excess, deposit, maintenance arrangements and any extra charges before
                agreeing to the rental.
              </T>
            </p>
          </article>
          <article>
            <h3>
              <T>Plan extensions in advance</T>
            </h3>
            <p>
              <T>
                The displayed offer covers 30 days. Extra days, an early return or another month
                need an agreed quote and availability check; the rental does not renew automatically
                through this website.
              </T>
            </p>
          </article>
        </div>
      </section>
    </div>
  )
}
