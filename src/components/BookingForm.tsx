'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { siteConfig, hasWhatsapp } from '@/lib/config'
import { formatPrice } from '@/lib/format'
import {
  buildWhatsappUrl,
  buildEnquiryMessage,
  estimateTotal,
  emptyEnquiry,
  type BookingEnquiry,
} from '@/lib/whatsapp'
import type { Car, RentalPeriod } from '@/lib/types'

const todayIso = () => new Date().toISOString().slice(0, 10)

type Errors = Partial<Record<'fullName' | 'phone' | 'car' | 'pickupDate' | 'returnDate', string>>

export default function BookingForm({
  cars,
  initialCar,
  initialColour,
  initialPeriod = 'daily',
}: {
  cars: Car[]
  initialCar?: Car
  initialColour?: string
  initialPeriod?: RentalPeriod
}) {
  const [enquiry, setEnquiry] = useState<BookingEnquiry>({
    ...emptyEnquiry,
    car: initialCar ?? null,
    colour: initialColour ?? initialCar?.colors.find((c) => c.default)?.name ?? '',
    period: initialPeriod,
  })
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState(false)

  const set = <K extends keyof BookingEnquiry>(key: K, value: BookingEnquiry[K]) => {
    setEnquiry((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const sortedCars = useMemo(() => [...cars].sort((a, b) => a.name.localeCompare(b.name)), [cars])
  const estimate = estimateTotal(enquiry)
  const configured = hasWhatsapp()

  const validate = (): Errors => {
    const next: Errors = {}
    if (!enquiry.fullName.trim()) next.fullName = 'Please tell us your name'
    // Loose on purpose: international visitors write numbers many ways.
    if (!/^[+\d][\d\s()-]{6,}$/.test(enquiry.phone.trim())) next.phone = 'Enter a contact number'
    if (!enquiry.car) next.car = 'Choose a vehicle'
    if (!enquiry.pickupDate) next.pickupDate = 'Choose a pick-up date'
    if (!enquiry.returnDate) next.returnDate = 'Choose a return date'
    if (enquiry.pickupDate && enquiry.returnDate && enquiry.returnDate < enquiry.pickupDate) {
      next.returnDate = 'Return must be on or after pick-up'
    }
    return next
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) {
      document.querySelector('[data-error="true"]')?.scrollIntoView({ block: 'center' })
      return
    }
    // Opened in a new tab so the visitor keeps the site behind WhatsApp.
    window.open(buildWhatsappUrl(enquiry), '_blank', 'noopener,noreferrer')
    setSent(true)
  }

  const field = 'w-full rounded-sm border border-white/15 bg-ink-800 px-4 py-3.5 text-sm text-bone outline-none transition-colors placeholder:text-muted focus:border-gold-500'
  const label = 'eyebrow mb-2.5 block'
  const errorText = 'mt-1.5 text-xs text-red-400'

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr]">
      <div className="space-y-7">
        {/* Vehicle */}
        <fieldset data-error={!!errors.car}>
          <label htmlFor="car" className={label}>
            Vehicle
          </label>
          <select
            id="car"
            value={enquiry.car?.slug ?? ''}
            onChange={(e) => {
              const car = cars.find((c) => c.slug === e.target.value) ?? null
              setEnquiry((prev) => ({
                ...prev,
                car,
                colour: car?.colors.find((c) => c.default)?.name ?? '',
              }))
              setErrors((prev) => ({ ...prev, car: undefined }))
            }}
            className={field}
          >
            <option value="">Select a car&hellip;</option>
            {sortedCars.map((car) => (
              <option key={car.slug} value={car.slug}>
                {car.name}
                {car.pricing.daily ? ` - ${formatPrice(car.pricing.daily)} / day` : ''}
              </option>
            ))}
          </select>
          {errors.car && <p className={errorText}>{errors.car}</p>}
        </fieldset>

        {/* Colour - only when the chosen car has variants */}
        {enquiry.car && enquiry.car.colors.length > 0 && (
          <fieldset>
            <label htmlFor="colour" className={label}>
              Preferred colour
            </label>
            <select
              id="colour"
              value={enquiry.colour}
              onChange={(e) => set('colour', e.target.value)}
              className={field}
            >
              <option value="">No preference</option>
              {enquiry.car.colors.map((colour) => (
                <option key={colour.slug} value={colour.name}>
                  {colour.name}
                </option>
              ))}
            </select>
          </fieldset>
        )}

        {/* Period */}
        <fieldset>
          <span className={label}>Rental basis</span>
          <div className="grid grid-cols-2 gap-3">
            {(['daily', 'monthly'] as RentalPeriod[]).map((period) => {
              const available = !enquiry.car || enquiry.car.pricing[period] != null
              return (
                <button
                  key={period}
                  type="button"
                  disabled={!available}
                  onClick={() => set('period', period)}
                  className={`rounded-sm border px-4 py-3.5 text-xs tracking-[0.16em] uppercase transition-colors ${
                    enquiry.period === period
                      ? 'border-gold-500 bg-gold-500 text-ink-950'
                      : 'border-white/15 text-bone/70 hover:border-white/35'
                  } ${available ? '' : 'cursor-not-allowed opacity-35'}`}
                >
                  {period === 'daily' ? 'Per day' : 'Per month'}
                </button>
              )
            })}
          </div>
        </fieldset>

        {/* Dates */}
        <div className="grid gap-5 sm:grid-cols-2">
          <fieldset data-error={!!errors.pickupDate}>
            <label htmlFor="pickup" className={label}>
              Pick-up date
            </label>
            <input
              id="pickup"
              type="date"
              min={todayIso()}
              value={enquiry.pickupDate}
              onChange={(e) => set('pickupDate', e.target.value)}
              className={`${field} [color-scheme:dark]`}
            />
            {errors.pickupDate && <p className={errorText}>{errors.pickupDate}</p>}
          </fieldset>

          <fieldset data-error={!!errors.returnDate}>
            <label htmlFor="return" className={label}>
              Return date
            </label>
            <input
              id="return"
              type="date"
              min={enquiry.pickupDate || todayIso()}
              value={enquiry.returnDate}
              onChange={(e) => set('returnDate', e.target.value)}
              className={`${field} [color-scheme:dark]`}
            />
            {errors.returnDate && <p className={errorText}>{errors.returnDate}</p>}
          </fieldset>
        </div>

        {/* Location */}
        <fieldset>
          <label htmlFor="location" className={label}>
            Delivery / pick-up location
          </label>
          <input
            id="location"
            list="locations"
            value={enquiry.pickupLocation}
            onChange={(e) => set('pickupLocation', e.target.value)}
            placeholder="Hotel, residence or terminal"
            className={field}
          />
          <datalist id="locations">
            {siteConfig.locations.map((location) => (
              <option key={location} value={location} />
            ))}
          </datalist>
        </fieldset>

        {/* Customer */}
        <div className="grid gap-5 sm:grid-cols-2">
          <fieldset data-error={!!errors.fullName}>
            <label htmlFor="name" className={label}>
              Full name
            </label>
            <input
              id="name"
              value={enquiry.fullName}
              onChange={(e) => set('fullName', e.target.value)}
              placeholder="As shown on your licence"
              className={field}
            />
            {errors.fullName && <p className={errorText}>{errors.fullName}</p>}
          </fieldset>

          <fieldset data-error={!!errors.phone}>
            <label htmlFor="phone" className={label}>
              Phone / WhatsApp
            </label>
            <input
              id="phone"
              type="tel"
              value={enquiry.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+971 50 000 0000"
              className={field}
            />
            {errors.phone && <p className={errorText}>{errors.phone}</p>}
          </fieldset>
        </div>

        <fieldset>
          <label htmlFor="email" className={label}>
            Email <span className="normal-case opacity-60">(optional)</span>
          </label>
          <input
            id="email"
            type="email"
            value={enquiry.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="you@example.com"
            className={field}
          />
        </fieldset>

        <fieldset>
          <label htmlFor="notes" className={label}>
            Anything else we should know?
          </label>
          <textarea
            id="notes"
            rows={4}
            value={enquiry.deliveryNotes}
            onChange={(e) => set('deliveryNotes', e.target.value)}
            placeholder="Flight number, preferred handover time, additional driver&hellip;"
            className={`${field} resize-y`}
          />
        </fieldset>
      </div>

      {/* Summary rail */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-sm border border-white/12 bg-ink-900 p-7">
          <p className="eyebrow mb-5">Your enquiry</p>

          {enquiry.car ? (
            <>
              <div className="relative mb-5 aspect-[4/3] overflow-hidden rounded-sm">
                <Image
                  src={enquiry.car.images[0].src}
                  alt={enquiry.car.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 30vw"
                  className="object-cover"
                />
              </div>
              <p className="font-display text-2xl">{enquiry.car.name}</p>
              {enquiry.colour && <p className="mt-1 text-sm text-muted">{enquiry.colour}</p>}
            </>
          ) : (
            <p className="text-sm text-muted">No vehicle selected yet.</p>
          )}

          <dl className="hairline mt-6 space-y-3 pt-6 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Basis</dt>
              <dd>{enquiry.period === 'monthly' ? 'Monthly' : 'Daily'}</dd>
            </div>
            {estimate && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Duration</dt>
                <dd>
                  {estimate.days} day{estimate.days === 1 ? '' : 's'}
                </dd>
              </div>
            )}
            {estimate && enquiry.car && (
              <div className="hairline flex justify-between gap-4 pt-3">
                <dt className="text-muted">Estimated total</dt>
                <dd className="font-display text-lg text-gold-500">
                  {formatPrice(estimate.total, enquiry.car.pricing.currency)}
                </dd>
              </div>
            )}
          </dl>

          <p className="mt-5 text-xs leading-relaxed text-muted">
            Estimate only &mdash; no payment is taken on this site. We confirm final pricing,
            security deposit and mileage allowance over WhatsApp.
          </p>

          {configured ? (
            <button
              type="submit"
              className="mt-7 w-full rounded-full bg-[#25D366] py-4 text-xs tracking-[0.18em] uppercase text-ink-950 transition-transform duration-300 hover:scale-[1.02]"
            >
              Send on WhatsApp
            </button>
          ) : (
            <div className="mt-7 rounded-sm border border-amber-500/40 bg-amber-500/10 p-4 text-xs leading-relaxed text-amber-200">
              <strong className="block">WhatsApp number not configured.</strong>
              Set <code className="text-amber-100">NEXT_PUBLIC_WHATSAPP_NUMBER</code> in{' '}
              <code className="text-amber-100">.env.local</code> to enable sending.
            </div>
          )}

          {sent && (
            <p className="mt-4 text-center text-xs text-gold-500">
              WhatsApp opened in a new tab. Press send there to reach us.
            </p>
          )}

          {/* Lets the operator eyeball exactly what the customer will send. */}
          {enquiry.car && (
            <details className="mt-5">
              <summary className="cursor-pointer text-xs text-muted hover:text-bone">
                Preview message
              </summary>
              <pre className="mt-3 max-h-64 overflow-auto rounded-sm bg-ink-950 p-3 text-[11px] leading-relaxed whitespace-pre-wrap text-bone/75">
                {buildEnquiryMessage(enquiry)}
              </pre>
            </details>
          )}
        </div>
      </aside>
    </form>
  )
}
