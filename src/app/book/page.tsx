import type { Metadata } from 'next'
import BookingForm from '@/components/BookingForm'
import { getAllCars, getCarBySlug } from '@/lib/fleet'

export const metadata: Metadata = {
  title: 'Make a Booking',
  description:
    'Reserve a supercar or luxury vehicle in Dubai. Send your dates and details straight to our team on WhatsApp - no payment taken online.',
}

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ car?: string; colour?: string; period?: string }>
}) {
  const params = await searchParams
  const cars = getAllCars()
  const initialCar = params.car ? getCarBySlug(params.car) : undefined
  const initialPeriod = params.period === 'monthly' ? 'monthly' : 'daily'

  return (
    <div className="container-lux pt-36 pb-24 md:pt-44">
      <header className="mb-14 max-w-2xl">
        <p className="eyebrow mb-4">Reservations</p>
        <h1 className="font-display text-[clamp(2.5rem,7vw,5rem)] leading-[0.98]">
          Make a booking
        </h1>
        <p className="mt-5 leading-relaxed text-muted">
          Fill in your details and we will send the whole enquiry to our team on WhatsApp in one
          tap. No card details, no deposit taken on this site.
        </p>
      </header>

      <BookingForm
        cars={cars}
        initialCar={initialCar}
        initialColour={params.colour}
        initialPeriod={initialPeriod}
      />
    </div>
  )
}
