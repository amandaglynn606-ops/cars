import Link from 'next/link'
import BookingForm from '@/components/BookingForm'
import SingleLineHeading from '@/components/SingleLineHeading'
import { getAllCars, getCarBySlug } from '@/lib/fleet'
import { rentalRequestContext } from '@/lib/home-rentals'
export const metadata = { title: 'Request a Reservation', robots: { index: false, follow: true } }
export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{
    car?: string
    start?: string
    end?: string
    location?: string
    event?: string
    plan?: string
  }>
}) {
  const p = await searchParams
  const context = rentalRequestContext(p.event, p.plan)
  return (
    <div className="container-lux">
      <header className="z-page-hero">
        <p className="z-kicker">
          <T>Rental enquiry</T>
        </p>
        <SingleLineHeading text="Request a reservation" />
        <p className="z-lead">
          <T>
            Complete your reservation details. The team will confirm availability and your final
            quote.
          </T>
        </p>
      </header>
      <BookingForm
        maxUploadBytes={(process.env.VERCEL === '1' ? 3 : 32) * 1024 * 1024}
        cars={getAllCars()}
        initialCar={p.car ? getCarBySlug(p.car) : undefined}
        initialStart={p.start}
        initialEnd={p.end}
        initialLocation={p.location || context.location}
        initialNotes={context.notes}
        initialPeriod={p.plan === 'monthly' ? 'monthly' : 'daily'}
      />
    </div>
  )
}

import { T } from '@/components/RegionalProvider'
