import Link from 'next/link'
import Image from 'next/image'
import { rentalEvents } from '@/lib/home-rentals'
import { eventGuides, eventHref } from '@/lib/event-guides'
import { T } from '@/components/RegionalProvider'
import Icon from '@/components/Icon'
import './events.css'
export const metadata = {
  title: 'Luxury Car Rental for UAE Events',
  description:
    'Plan a luxury car rental for Abu Dhabi F1, Dubai World Cup and major concerts in Dubai and Abu Dhabi. Explore event-specific driving and delivery guidance.',
  alternates: { canonical: '/events' },
}
export default function EventsPage() {
  return (
    <div className="container-lux z-event-guide">
      <header className="z-page-hero z-collection-hero">
        <h1>
          <T>Luxury car rental for UAE events</T>
        </h1>
        <p className="z-lead">
          <T>
            Choose the event you are planning for, then find the car and handover arrangements that
            fit your visit.
          </T>
        </p>
      </header>
      <div className="z-event-directory">
        {rentalEvents.map((event) => (
          <article key={event.slug}>
            <Link href={eventHref(event.slug)} className="z-event-directory-image">
              <Image
                src={event.image}
                alt={event.imageAlt}
                fill
                sizes="(max-width:700px) 100vw,50vw"
              />
            </Link>
            <div className="z-event-directory-copy">
              <p className="z-kicker">
                <T>{event.dateLabel}</T>
              </p>
              <p className="z-kicker">
                <T>{event.venue}</T>
              </p>
              <h2>
                <Link href={eventHref(event.slug)}>
                  <T>{event.name}</T>
                </Link>
              </h2>
              <p>
                <T>{eventGuides[event.slug].intro}</T>
              </p>
              <Link href={eventHref(event.slug)} className="z-text-link">
                <T>Explore event rentals</T>
                <Icon name="arrow" size={17} />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
