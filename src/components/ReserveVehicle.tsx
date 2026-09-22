'use client'
import { useRouter } from 'next/navigation'
import type { FormEvent, ReactNode } from 'react'
import type { Car, ReservedDates } from '@/lib/types'
import { useBookingContact } from './BookingContactProvider'
import { buildQuickChatUrl } from '@/lib/whatsapp'
import WhatsappIcon from './WhatsappIcon'
import Icon from './Icon'
import PhoneField from './PhoneField'
import { T } from './RegionalProvider'
export default function ReserveVehicle({
  car,
  plan,
  event: rentalEvent,
  children,
}: {
  car: Car
  reservations: ReservedDates[]
  start?: string
  end?: string
  location?: string
  plan?: string
  event?: string
  children?: ReactNode
}) {
  const router = useRouter()
  const { contact, setContact } = useBookingContact()
  const available = car.availability === 'available'
  function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setContact({
      vehicleId: car.id,
      name: String(data.get('name')).trim(),
      email: String(data.get('email')).trim(),
      phone: String(data.get('phone')).trim(),
    })
    const query = new URLSearchParams({ car: car.slug })
    if (rentalEvent) query.set('event', rentalEvent)
    if (plan === 'monthly') query.set('plan', 'monthly')
    router.push('/book?' + query)
  }
  return (
    <div className="z-vehicle-enquiry">
      <p className="z-kicker z-enquiry-step">
        <T>Step 1 of 2 · Your details</T>
      </p>
      <form onSubmit={next} className="z-reserve-contact-grid">
        <label className="z-field">
          <T>Full name</T>
          <input
            name="name"
            autoComplete="name"
            required
            maxLength={150}
            defaultValue={contact?.name || ''}
          />
        </label>
        <label className="z-field">
          <T>Email</T>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={200}
            defaultValue={contact?.email || ''}
          />
        </label>
        <PhoneField defaultValue={contact?.phone || ''} />
        <button type="submit" className="z-button" style={{ width: '100%' }} disabled={!available}>
          <T>Continue to reservation</T>
          <Icon name="arrow" />
        </button>
      </form>
      {!available && (
        <p className="z-error">
          <T>This vehicle is not currently accepting reservations.</T>
        </p>
      )}
      <p className="z-note" style={{ marginTop: 10 }}>
        <T>
          Next: choose dates, enter your delivery address and attach your documents. No payment is
          taken here.
        </T>
      </p>
      {children}
      <a
        href={buildQuickChatUrl(car, plan === 'monthly' ? 'monthly' : 'daily')}
        target="_blank"
        rel="noopener noreferrer"
        className="z-car-whatsapp"
      >
        <WhatsappIcon size={20} />
        <T>Enquire on WhatsApp</T>
        <Icon name="arrow" size={16} />
      </a>
    </div>
  )
}
