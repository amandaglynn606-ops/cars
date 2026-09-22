import { siteConfig } from './config'
import { formatDate, formatPrice, daysBetween } from './format'
import type { Car, RentalPeriod } from './types'

export interface BookingEnquiry {
  fullName: string
  phone: string
  email: string
  car: Car | null
  colour: string
  period: RentalPeriod
  pickupDate: string
  returnDate: string
  pickupLocation: string
  deliveryNotes: string
}

export const emptyEnquiry: BookingEnquiry = {
  fullName: '',
  phone: '',
  email: '',
  car: null,
  colour: '',
  period: 'daily',
  pickupDate: '',
  returnDate: '',
  pickupLocation: '',
  deliveryNotes: '',
}

/** Estimated total for the selected dates; null when it cannot be worked out. */
export function estimateTotal(enquiry: BookingEnquiry): { days: number; total: number } | null {
  const { car, period, pickupDate, returnDate } = enquiry
  if (!car) return null
  const days = daysBetween(pickupDate, returnDate)
  if (!days) return null

  if (period === 'monthly') {
    const monthly = car.pricing.monthly
    if (!monthly) return null
    return { days, total: Math.round((monthly / 30) * days) }
  }
  const daily = car.pricing.daily
  if (!daily) return null
  return { days, total: daily * days }
}

/**
 * Builds the plain-text enquiry that is handed to WhatsApp. Every field the
 * customer filled in is included so the sales team needs no follow-up round trip.
 */
export function buildEnquiryMessage(enquiry: BookingEnquiry): string {
  const { car } = enquiry
  const lines: string[] = []

  lines.push(`New booking enquiry - ${siteConfig.name}`)
  lines.push('')

  if (car) {
    lines.push('VEHICLE')
    lines.push(`  Car: ${car.name}`)
    if (car.brand) lines.push(`  Brand: ${car.brand}`)
    if (car.bodyType) lines.push(`  Type: ${car.bodyType}`)
    if (enquiry.colour) lines.push(`  Colour: ${enquiry.colour}`)

    const rate = enquiry.period === 'monthly' ? car.pricing.monthly : car.pricing.daily
    if (rate) {
      lines.push(
        `  Advertised rate: ${formatPrice(rate, car.pricing.currency)} / ${
          enquiry.period === 'monthly' ? 'month' : 'day'
        }`,
      )
    }
    lines.push('')
  }

  lines.push('RENTAL')
  lines.push(`  Period: ${enquiry.period === 'monthly' ? 'Monthly' : 'Daily'}`)
  if (enquiry.pickupDate) lines.push(`  Pick-up: ${formatDate(enquiry.pickupDate)}`)
  if (enquiry.returnDate) lines.push(`  Return: ${formatDate(enquiry.returnDate)}`)

  const estimate = estimateTotal(enquiry)
  if (estimate && car) {
    lines.push(`  Duration: ${estimate.days} day${estimate.days === 1 ? '' : 's'}`)
    lines.push(`  Estimated total: ${formatPrice(estimate.total, car.pricing.currency)}`)
  }
  if (enquiry.pickupLocation) lines.push(`  Pick-up location: ${enquiry.pickupLocation}`)
  lines.push('')

  lines.push('CUSTOMER')
  lines.push(`  Name: ${enquiry.fullName}`)
  lines.push(`  Phone: ${enquiry.phone}`)
  if (enquiry.email) lines.push(`  Email: ${enquiry.email}`)

  if (enquiry.deliveryNotes.trim()) {
    lines.push('')
    lines.push('NOTES')
    lines.push(`  ${enquiry.deliveryNotes.trim()}`)
  }

  if (car) {
    lines.push('')
    lines.push(`Listing: ${siteConfig.url}/fleet/${car.slug}`)
  }

  return lines.join('\n')
}

/**
 * wa.me deep link. Works on mobile (opens the app) and desktop (opens WhatsApp
 * Web), so one URL covers every visitor.
 */
export function buildWhatsappUrl(enquiry: BookingEnquiry): string {
  const text = encodeURIComponent(buildEnquiryMessage(enquiry))
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${text}`
}

/** Short prefilled message for the floating "chat to us" button. */
export function buildQuickChatUrl(car?: Car, period: RentalPeriod = 'daily', colour = ''): string {
  const text = car
    ? `Hi Zavi, I would like to enquire about renting the ${car.name}${colour ? ' in ' + colour : ''}${period === 'monthly' ? ' for 30 days with the 20% monthly offer' : ''}. Please confirm availability and a quote.`
    : 'Hi Zavi, I would like to enquire about renting a car. Please help me with availability and a quote.'
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(text)}`
}
