import type { Car } from '@/lib/types'
import { monthlyRentalCars } from '@/lib/home-rentals'
import HomeSectionHeading from './HomeSectionHeading'
import CarCarousel from './CarCarousel'
import PartnerMotion from './PartnerMotion'
import EventShowcase from './EventShowcase'
import { T } from './RegionalProvider'
import './home-rental-plans.css'

export default function HomeRentalPlans({ cars }: { cars: Car[] }) {
  const monthly = monthlyRentalCars(cars)
  return (
    <>
      <PartnerMotion
        as="section"
        id="monthly-rentals"
        className="z-home-section container-lux z-monthly-rentals"
        aria-labelledby="monthly-heading"
      >
        <HomeSectionHeading
          id="monthly-heading"
          number="05"
          eyebrow="Stay a little longer"
          title="Your car, for the month."
          description="Settling into Dubai, extending a stay or choosing a longer drive? Rent any car in our daily collection for 30 days and save 20% against its daily rate."
          href="/monthly-luxury-car-rental"
          linkLabel="Explore monthly rentals"
        />
        <div className="z-monthly-intro">
          <p>
            <T>30 days. 20% less.</T>
          </p>
          <span>
            <T>Daily rate × 30 days, less 20%</T>
          </span>
        </div>
        <CarCarousel cars={monthly} label="Monthly car rentals" period="monthly" />
        <p className="z-monthly-note">
          <T>
            {monthly.length
              ? 'Prices cover 30 days. The crossed-out amount is 30 days at the current daily rate. Mileage allowance, insurance, deposit and delivery are confirmed with your quote.'
              : 'Tell us your preferred model and length of stay for a monthly quote.'}
          </T>
        </p>
      </PartnerMotion>
      <EventShowcase />
    </>
  )
}
