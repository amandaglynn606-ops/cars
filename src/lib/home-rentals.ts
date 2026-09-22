import type { Car } from './types'

export type RentalEvent = {
  slug: string
  category: string
  name: string
  venue: string
  location: string
  icon: string
  description: string
  detail: string
  image: string
  imageAlt: string
  date: string | null
  endDate?: string
  dateLabel: string
  source: string
}
export const rentalEvents: readonly RentalEvent[] = [
  {
    slug: 'abu-dhabi-grand-prix',
    image: '/verified-places/abu-dhabi-grand-prix.webp',
    imageAlt: 'Formula 1 at Yas Marina Circuit, Abu Dhabi',
    date: '2026-12-04',
    endDate: '2026-12-06',
    dateLabel: '4–6 December 2026',
    source: 'https://www.formula1.com/en/racing/2026/united-arab-emirates',
    category: 'Formula 1',
    name: 'Abu Dhabi Grand Prix',
    venue: 'Yas Island · Abu Dhabi',
    location: 'Abu Dhabi',
    icon: 'grid',
    description:
      'Make a weekend of the racing and after-race concerts. Plan hotel collection, the drive to Yas Island and your return around the sessions you are attending.',
    detail: 'Circuit access, parking passes and concert admission are arranged separately.',
  },
  {
    slug: 'dubai-concerts',
    image: '/verified-places/dubai-concerts.webp',
    imageAlt:
      'Maroon 5 performing at Coca-Cola Arena in Dubai, June 2019 — archive concert photograph',
    date: null,
    dateLabel: 'Choose your show date',
    source: 'https://www.coca-cola-arena.com/',
    category: 'Headline concerts',
    name: 'Concerts in Dubai',
    venue: 'Coca-Cola Arena & Dubai venues',
    location: 'Dubai',
    icon: 'heart',
    description:
      'Dinner, a headline show and a car for the evening. Share the artist, venue and performance date so your collection and return fit the night.',
    detail: 'Confirm the venue entrance and parking instructions on your event ticket.',
  },
  {
    slug: 'abu-dhabi-concerts',
    image: '/verified-places/hans-zimmer.webp',
    imageAlt: 'Hans Zimmer Live promotional artwork from Etihad Arena',
    date: '2026-11-13',
    dateLabel: 'Hans Zimmer · 13 November 2026',
    source: 'https://www.etihadarena.ae/en/event-booking/hans-zimmer-live',
    category: 'Live music',
    name: 'Concerts in Abu Dhabi',
    venue: 'Etihad Arena & Yas Island venues',
    location: 'Abu Dhabi',
    icon: 'calendar',
    description:
      'Heading to a major concert in Abu Dhabi? Choose around your group, an overnight stay and the journey from Dubai or your local hotel.',
    detail: 'Allow time after the show for crowds and agree the vehicle return window.',
  },
  {
    slug: 'dubai-world-cup',
    image: '/verified-places/meydan-racing.webp',
    imageAlt: 'Horse racing at Meydan Racecourse — archive Dubai Racing Club photograph',
    date: null,
    dateLabel: 'Next edition: date to be confirmed',
    source: 'https://www.dubairacingclub.com/',
    category: 'Race-day arrivals',
    name: 'Dubai World Cup',
    venue: 'Meydan · Dubai',
    location: 'Dubai',
    icon: 'arrow',
    description:
      'Choose a comfortable arrival for a day at the races. A luxury saloon or SUV gives you room for formalwear, your guests and the rest of your plans.',
    detail: 'Ask the organiser about permitted parking; hospitality and admission are separate.',
  },
] as const

export function monthlyRentalCars(cars: Car[]) {
  return cars.filter(
    (car) =>
      car.publicationStatus === 'published' &&
      car.availability === 'available' &&
      car.pricing.daily !== null &&
      car.pricing.daily > 0,
  )
}

export function rentalRequestContext(event: unknown, plan: unknown) {
  const selected =
    typeof event === 'string' ? rentalEvents.find((item) => item.slug === event) : undefined
  return {
    location: selected?.location,
    notes: [
      selected
        ? 'Event rental: ' +
          selected.name +
          ' — ' +
          selected.venue +
          '. Please confirm my event date, collection and return arrangements.'
        : '',
      plan === 'monthly'
        ? 'Monthly rental request. Please confirm the monthly rate, rental period, mileage allowance, deposit and delivery charges.'
        : '',
    ]
      .filter(Boolean)
      .join('\n'),
  }
}
