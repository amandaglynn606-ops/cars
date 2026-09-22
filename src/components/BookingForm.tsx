'use client'
import { useState, type FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Car, RentalPeriod } from '@/lib/types'
import { carHref, monthlyCarHref, todayDubai } from '@/lib/catalogue'
import { useBookingContact } from './BookingContactProvider'
import Icon from './Icon'
import PhoneField from './PhoneField'
import { T, Price, useRegional } from './RegionalProvider'

function openDatePicker(event: React.MouseEvent<HTMLInputElement>) {
  try {
    event.currentTarget.showPicker?.()
  } catch {
    // Keep native typing and keyboard controls when the browser cannot open a picker.
    event.currentTarget.focus()
  }
}

export default function BookingForm({
  cars,
  initialCar,
  initialStart = '',
  initialEnd = '',
  initialLocation = '',
  initialNotes = '',
  initialPeriod = 'daily',
}: {
  cars: Car[]
  initialCar?: Car
  initialStart?: string
  initialEnd?: string
  initialLocation?: string
  initialNotes?: string
  initialColour?: string
  initialPeriod?: RentalPeriod
}) {
  const { t } = useRegional()
  const { contact, setContact } = useBookingContact()
  const [step, setStep] = useState(contact && contact.vehicleId === initialCar?.id ? 2 : 1)
  const [vehicleName, setVehicleName] = useState(initialCar?.name || '')
  const car = cars.find((c) => c.name === vehicleName)
  const [start, setStart] = useState(initialStart),
    [end, setEnd] = useState(initialEnd),
    [location, setLocation] = useState(initialLocation)
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [reference, setReference] = useState('')
  const days = start && end ? Math.round((Date.parse(end) - Date.parse(start)) / 86400000) : 0
  const durationRate = car
    ? (
        {
          1: car.pricing.daily,
          3: car.pricing.threeDays,
          7: car.pricing.weekly,
          14: car.pricing.fortnightly,
          30: car.pricing.monthly,
        } as Record<number, number | null | undefined>
      )[days]
    : null
  function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!car) {
      setError('Choose a vehicle from the collection.')
      return
    }
    const form = new FormData(event.currentTarget)
    setContact({
      vehicleId: car.id,
      name: String(form.get('name')).trim(),
      email: String(form.get('email')).trim(),
      phone: String(form.get('phone')).trim(),
    })
    setError('')
    setStep(2)
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!car || !contact) {
      setStep(1)
      return
    }
    if (files.length > 4 || files.some((file) => file.size > 8 * 1024 * 1024)) {
      setError('Attach up to 4 documents, no more than 8 MB each.')
      return
    }
    setBusy(true)
    setError('')
    const form = new FormData(event.currentTarget)
    const payload = new FormData()
    for (const [key, value] of Object.entries({
      ...contact,
      vehicleId: car.id,
      start,
      end,
      location,
      notes: String(form.get('notes') || ''),
    }))
      payload.set(key, value)
    payload.set('consent', 'true')
    files.forEach((file) => payload.append('documents', file))
    try {
      const response = await fetch('/api/reservations', { method: 'POST', body: payload })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'The request could not be saved.')
      setReference(result.id)
      setContact(null)
      setFiles([])
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Please try again.')
    } finally {
      setBusy(false)
    }
  }
  if (reference)
    return (
      <div className="z-empty" style={{ margin: '45px 0 90px' }}>
        <Icon name="check" size={36} />
        <h2>
          <T>Reservation request received</T>
        </h2>
        <p>
          <T>
            Your details and any attached documents have been saved for review. The team will
            confirm availability, delivery charges and your final quote.
          </T>
        </p>
        <p>
          <T>Reference: </T>
          <strong>{reference}</strong>
        </p>
        <Link href="/fleet" className="z-button">
          <T>Return to the fleet</T>
          <Icon name="arrow" />
        </Link>
      </div>
    )
  return (
    <div className="z-book-grid">
      <div>
        <div className="z-book-progress" aria-label={t('Reservation progress')}>
          <span aria-current={step === 1 ? 'step' : undefined}>
            <T>1 · Contact details</T>
          </span>
          <span aria-current={step === 2 ? 'step' : undefined}>
            <T>2 · Reservation details</T>
          </span>
        </div>
        {step === 1 ? (
          <form onSubmit={next}>
            {!initialCar && (
              <label className="z-field">
                <T>Your vehicle</T>
                <input
                  list="booking-vehicles"
                  required
                  value={vehicleName}
                  onChange={(e) => setVehicleName(e.target.value)}
                  placeholder={t('Type a model or choose a car')}
                />
                <datalist id="booking-vehicles">
                  {cars
                    .filter((c) => c.availability === 'available')
                    .map((c) => (
                      <option value={c.name} key={c.id} />
                    ))}
                </datalist>
              </label>
            )}
            <label className="z-field">
              <T>Full name</T>
              <input
                name="name"
                required
                autoComplete="name"
                maxLength={150}
                defaultValue={contact?.name || ''}
              />
            </label>
            <label className="z-field">
              <T>Email</T>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                maxLength={200}
                defaultValue={contact?.email || ''}
              />
            </label>
            <PhoneField defaultValue={contact?.phone || ''} />
            <button className="z-button" type="submit">
              <T>Continue to reservation</T>
              <Icon name="arrow" />
            </button>
          </form>
        ) : (
          <form onSubmit={submit}>
            <div className="z-contact-recap">
              <strong>{contact?.name}</strong>
              <p>
                {contact?.email} · {contact?.phone}
              </p>
              <button type="button" className="z-text-link" onClick={() => setStep(1)}>
                <T>Edit contact details</T>
              </button>
            </div>
            <div className="z-two-fields">
              <label className="z-field">
                <T>Collection date</T>
                <input
                  type="date"
                  onClick={openDatePicker}
                  required
                  min={todayDubai()}
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </label>
              <label className="z-field">
                <T>Return date</T>
                <input
                  type="date"
                  onClick={openDatePicker}
                  required
                  min={start || todayDubai()}
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </label>
            </div>
            <label className="z-field">
              <T>Delivery address</T>
              <textarea
                required
                name="location"
                autoComplete="street-address"
                maxLength={200}
                minLength={5}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t('Emirate, neighbourhood, hotel or building, street and entrance')}
              />
              <span className="z-note">
                <T>
                  Delivery across the UAE. Charges vary by location and are confirmed with your
                  quote.
                </T>
              </span>
            </label>
            <div className="z-document-upload">
              <label className="z-field">
                <T>Rental documents</T>
                <span className="z-note">
                  <T>
                    Attach your driving licence and passport or Emirates ID if available. PDF, JPEG,
                    PNG, WebP, HEIC, HEIF, AVIF or TIFF. Up to 4 files, 8 MB each.
                  </T>
                </span>
                <input
                  type="file"
                  name="documents"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,.avif,.tif,.tiff"
                  onChange={(e) => setFiles(Array.from(e.target.files || []))}
                />
              </label>
              {files.length > 0 && (
                <>
                  <ul>
                    {files.map((file, index) => (
                      <li key={index}>
                        {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="z-text-link"
                    onClick={() => {
                      setFiles([])
                      const input =
                        document.querySelector<HTMLInputElement>('input[name="documents"]')
                      if (input) input.value = ''
                    }}
                  >
                    <T>Clear attachments</T>
                  </button>
                </>
              )}
              <p className="z-note">
                <T>
                  Documents are private and available only to authorised staff reviewing your
                  rental. Do not upload payment card details.
                </T>
              </p>
            </div>
            <label className="z-field">
              <T>Additional requests</T>
              <textarea
                name="notes"
                defaultValue={initialNotes}
                maxLength={1000}
                placeholder={t('Preferred colour, arrival time or other requests')}
              />
            </label>
            <label className="z-admin-check">
              <input type="checkbox" required />
              <span>
                <T>
                  I agree to the use of these details and documents to review my rental request and
                  have read the
                </T>{' '}
                <Link href="/privacy" style={{ textDecoration: 'underline' }}>
                  <T>privacy notice</T>
                </Link>
                .
              </span>
            </label>
            <button className="z-button" disabled={busy}>
              <T>{busy ? 'Submitting your request…' : 'Send reservation request'}</T>
              <Icon name="arrow" />
            </button>
          </form>
        )}
        {error && (
          <p role="alert" className="z-error">
            {t(error)}
          </p>
        )}
      </div>
      <aside className="z-book-summary">
        <p className="z-kicker">
          <T>Your selection</T>
        </p>
        {car ? (
          <>
            {car.featuredImage && (
              <div style={{ position: 'relative', aspectRatio: '1.5', marginTop: 20 }}>
                <Image
                  src={car.featuredImage}
                  alt={car.name}
                  fill
                  sizes="(max-width:800px) 100vw,40vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            )}
            <h2>{car.name}</h2>
            <Link
              href={initialPeriod === 'monthly' ? monthlyCarHref(car) : carHref(car)}
              className="z-text-link"
            >
              <T>View vehicle details</T>
            </Link>
            <dl>
              <div>
                <dt>
                  <T>{initialPeriod === 'monthly' ? '30-day rate' : 'Daily rate'}</T>
                </dt>
                <dd>
                  {car.pricing[initialPeriod] ? (
                    <Price amount={car.pricing[initialPeriod]!} />
                  ) : (
                    <T>On request</T>
                  )}
                </dd>
              </div>
              {days > 0 && (
                <div>
                  <dt>
                    <T>Duration</T>
                  </dt>
                  <dd>
                    {days} <T>days</T>
                  </dd>
                </div>
              )}
              {durationRate && (
                <div>
                  <dt>
                    <T>Listed duration rate</T>
                  </dt>
                  <dd>
                    <Price amount={durationRate} />
                  </dd>
                </div>
              )}
              {location && (
                <div>
                  <dt>
                    <T>Delivery address</T>
                  </dt>
                  <dd>{location}</dd>
                </div>
              )}
            </dl>
          </>
        ) : (
          <p className="z-note">
            <T>Choose a vehicle to see its details.</T>
          </p>
        )}
        <p className="z-note">
          <T>
            Your request is subject to availability and a confirmed quote. No payment is taken on
            this website.
          </T>
        </p>
      </aside>
    </div>
  )
}
