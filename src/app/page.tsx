import Hero from '@/components/Hero'
import HomeRentalPlans from '@/components/HomeRentalPlans'
import Icon from '@/components/Icon'
import HomeSectionHeading from '@/components/HomeSectionHeading'
import HomeBrandBrowser from '@/components/HomeBrandBrowser'
import HotRentals from '@/components/HotRentals'
import EmiratesBanner from '@/components/EmiratesBanner'
import EarnWithUs from '@/components/EarnWithUs'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { getAllCars, getFeaturedCars, getBrands, categorySlug } from '@/lib/fleet'
import './home.css'

export const metadata = {
  title: 'Luxury Car Rental Dubai | Daily & Monthly Rentals | Zavi',
  description:
    'Explore luxury cars in Dubai by brand. Explore daily rates, save 20% on a 30-day rental and plan a car for UAE events. Request availability and delivery.',
  alternates: { canonical: '/' },
}
const brandOrder = [
  'Lamborghini',
  'Ferrari',
  'Rolls-Royce',
  'Bentley',
  'Porsche',
  'McLaren',
  'Mercedes-Benz',
  'BMW',
  'Audi',
  'Aston Martin',
  'Range Rover',
  'Maserati',
]
const rentalQuestions = [
  {
    question: 'Do tourists need a passport to rent a car in Dubai?',
    answer:
      'Tourists are normally asked for a valid passport, entry visa or entry record, and a driving licence accepted in the UAE. Requirements depend on your residency and licence country. Confirm the documents before collection; do not send passport copies through the initial enquiry form.',
  },
  {
    question: 'Do UAE residents need an Emirates ID?',
    answer:
      'Residents are normally asked for a valid Emirates ID and UAE driving licence. Bring the required originals for the rental checks. If your ID is being renewed, ask the rental provider which documents it can accept before reserving a car.',
  },
  {
    question: 'What is the minimum age for a luxury car rental?',
    answer:
      'Many rental providers require drivers to be at least 21, while luxury and high-performance cars may require 25 or older. Minimum age and how long you must have held your licence depend on the car and insurer. Share your age and licence history so the team can confirm eligibility for your chosen model.',
  },
  {
    question: 'Will I need an International Driving Permit?',
    answer:
      'This depends on the country that issued your licence and your visitor or resident status. Some visitors can use an accepted national licence; others need an International Driving Permit alongside their original licence. Confirm acceptance with the rental provider before booking.',
  },
  {
    question: 'Is a security deposit required?',
    answer:
      'Deposit requirements, accepted payment methods and the release period depend on the vehicle and rental provider. Ask for these terms in writing, including how tolls, fines, fuel and damage are handled. No payment is collected when you submit a request on this website.',
  },
  {
    question: 'What does the monthly rental price include?',
    answer:
      'Our 30-day rental price is 20% below 30 days at the car’s current daily rate. Confirm the mileage allowance, insurance cover and excess, deposit, delivery and any additional charges with your quote. Extra days and extensions are priced separately.',
  },
]
export default function Home() {
  const cars = getAllCars()
  const brands = getBrands()
  const featured = getFeaturedCars(100)
  const chosenBrands = new Set<string | null>()
  const diverseFeatured = featured
    .filter((car) => {
      if (car.availability !== 'available' || chosenBrands.has(car.brand)) return false
      chosenBrands.add(car.brand)
      return true
    })
    .slice(0, 6)
  const featuredSelection = [
    ...diverseFeatured,
    ...featured.filter(
      (car) =>
        car.availability === 'available' &&
        !diverseFeatured.some((selected) => selected.id === car.id),
    ),
  ].slice(0, 6)
  const brabus = cars.find(
    (car) => car.id === 'mercedes-benz-g-63-brabus' && car.availability === 'available',
  )
  const hotRentals = brabus
    ? [brabus, ...featuredSelection.filter((car) => car.id !== brabus.id)].slice(0, 6)
    : featuredSelection
  const selectedBrands = [...brands]
    .sort((a, b) => {
      const rank = (name: string) =>
        brandOrder.includes(name) ? brandOrder.indexOf(name) : brandOrder.length
      return rank(a.name) - rank(b.name) || a.name.localeCompare(b.name)
    })
    .map((brand) => {
      const logo = '/brands/' + categorySlug(brand.name) + '.svg'
      return { ...brand, logo: existsSync(path.join(process.cwd(), 'public', logo)) ? logo : null }
    })
  return (
    <div className="z-home">
      <Hero
        cars={featuredSelection.length ? featuredSelection : cars.slice(0, 1)}
        total={cars.length}
      />
      <nav className="z-home-jump" aria-label="Homepage sections">
        <div className="container-lux">
          <span className="z-kicker">
            <T>Find your rental</T>
          </span>
          <a href="#browse-brands">
            <T>Brands </T>
            <Icon name="arrow" size={15} />
          </a>
          <a href="#monthly-rentals">
            <T>Monthly rentals </T>
            <Icon name="arrow" size={15} />
          </a>
          <a href="#hot-rentals">
            <T>Hot rentals </T>
            <Icon name="arrow" size={15} />
          </a>
          <a href="#emirates">
            <T>Emirates</T>
            <Icon name="arrow" size={15} />
          </a>
          <a href="#event-rentals">
            <T>Events</T>
            <Icon name="arrow" size={15} />
          </a>
          <a href="#earn-with-us">
            <T>Earn with us</T>
            <Icon name="arrow" size={15} />
          </a>
        </div>
      </nav>
      <section
        id="browse-brands"
        className="z-home-section container-lux"
        aria-labelledby="brands-heading"
      >
        <HomeSectionHeading
          id="brands-heading"
          number="01"
          eyebrow="The brands"
          title="Browse brands"
          description="Choose a brand to see its models, photos and listed daily rates."
          href="/brands"
          linkLabel={`View all ${brands.length} brands`}
        />
        <HomeBrandBrowser brands={selectedBrands} cars={cars} />
      </section>
      {hotRentals.length > 0 && (
        <section
          id="hot-rentals"
          className="z-home-section container-lux z-hot-section"
          aria-labelledby="hot-heading"
        >
          <HomeSectionHeading
            id="hot-heading"
            number="02"
            eyebrow="The Zavi selection"
            title="Hot rentals"
            description="Featured cars from the catalogue. Explore their listed rates and request a quote for your dates."
            href="/fleet"
            linkLabel={`View all ${cars.length} vehicles`}
          />
          <HotRentals cars={hotRentals} />
        </section>
      )}
      <EmiratesBanner />
      <EarnWithUs image={brabus?.featuredImage || cars[0].featuredImage} />
      <HomeRentalPlans cars={cars} />
      <section
        id="rental-questions"
        className="z-home-section z-section-tint"
        aria-labelledby="questions-heading"
      >
        <div className="container-lux">
          <HomeSectionHeading
            id="questions-heading"
            number="07"
            eyebrow="Before you book"
            title="Rental questions"
            description="Passports, Emirates ID, driving licences and the essentials before you collect your car."
            href="/contact"
            linkLabel="Contact Zavi"
          />
          <div className="z-home-faq">
            {[rentalQuestions.slice(0, 3), rentalQuestions.slice(3)].map((column, index) => (
              <div className="z-home-faq-column" key={index}>
                {column.map((item, row) => (
                  <details key={item.question}>
                    <summary>
                      <span className="z-faq-number">0{index * 3 + row + 1}</span>
                      <T>{item.question}</T>
                      <span className="z-faq-plus" aria-hidden="true">
                        +
                      </span>
                    </summary>
                    <p>
                      <T>{item.answer}</T>
                    </p>
                  </details>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

import { T } from '@/components/RegionalProvider'
