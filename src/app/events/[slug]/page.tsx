import Link from 'next/link'
import Image from 'next/image'
import SingleLineHeading from '@/components/SingleLineHeading'
import { notFound } from 'next/navigation'
import { rentalEvents } from '@/lib/home-rentals'
import { eventGuides, eventHref } from '@/lib/event-guides'
import { eventExperiences } from '@/lib/event-experiences'
import { getAllCars } from '@/lib/fleet'
import CarCarousel from '@/components/CarCarousel'
import EventGallery from '@/components/EventGallery'
import PartnerMotion from '@/components/PartnerMotion'
import { T } from '@/components/RegionalProvider'
import Icon from '@/components/Icon'
import '../events.css'

const findEvent = (slug: string) =>
  rentalEvents.find((event) => eventHref(event.slug) === '/events/' + slug)
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const event = findEvent((await params).slug)
  if (!event) return { title: 'Event not found' }
  const guide = eventGuides[event.slug]
  return {
    title: guide.title,
    description: guide.intro,
    alternates: { canonical: eventHref(event.slug) },
    openGraph: {
      title: guide.title,
      description: guide.intro,
      images: [{ url: event.image, alt: event.imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.title,
      description: guide.intro,
      images: [event.image],
    },
  }
}
export default async function EventRentalPage({ params }: { params: Promise<{ slug: string }> }) {
  const event = findEvent((await params).slug)
  if (!event) notFound()
  const guide = eventGuides[event.slug]
  const experience = eventExperiences[event.slug]
  const isRace = event.slug === 'dubai-world-cup'
  const isF1 = event.slug === 'abu-dhabi-grand-prix'
  const preferred = isF1
    ? ['Ferrari', 'Lamborghini', 'McLaren']
    : ['Rolls-Royce', 'Bentley', 'Mercedes-Benz']
  const cars = getAllCars()
    .filter((car) => car.availability === 'available')
    .sort(
      (a, b) =>
        Number(preferred.includes(b.brand || '')) - Number(preferred.includes(a.brand || '')) ||
        Number(b.featured) - Number(a.featured),
    )
    .slice(0, 6)
  const bookingHref = '/book?event=' + event.slug
  const specificQuestions: [string, string][] = isF1
    ? [
        [
          'Who is performing during the 2026 Abu Dhabi Grand Prix week?',
          'Andrea Bocelli on 2 December; Lewis Capaldi on 3 December; Alex Warren and Anyma on 4 December; Imagine Dragons on 5 December; The Chainsmokers and The Script on 6 December. Bocelli is at Etihad Arena, the after-race concerts are at Etihad Live, and Anyma’s separate official after-party is at Yas Gateway Park.',
        ],
        [
          'Does my F1 ticket include every concert and after-party?',
          'The organiser restricts general admission to after-race concerts to GP ticket holders; check your ticket’s valid days. Bocelli’s Yasalam Classics concert and Anyma’s after-party have separate admission terms. Golden Circle is an upgrade, not a replacement for required admission.',
        ],
        [
          'When should I collect and return the car?',
          'Choose dates around your first and last event. A visit including Bocelli starts before the 4–6 December race weekend. Sunday concerts finish after the race, so confirm a late or next-day return instead of assuming the rental ends when racing finishes.',
        ],
      ]
    : isRace
      ? [
          [
            'When is the next Dubai World Cup?',
            'The latest completed edition documented here took place on 28 March 2026. The next date has not been verified in the organiser information used for this guide. Confirm the current calendar before committing to travel or event-day car rental.',
          ],
          [
            'Is there a singer lineup for the next Dubai World Cup?',
            'No upcoming singer lineup has been confirmed for this guide. Dubai World Cup is primarily an international horse-racing meeting; any entertainment programme must be checked with Dubai Racing Club.',
          ],
          [
            'Are the race photos from a future event?',
            'No. They are authentic archive images from Dubai Racing Club showing racing and guests at Meydan. They illustrate the venue and atmosphere; they do not depict an event that has not yet happened.',
          ],
        ]
      : [
          [
            'Which artists and dates are listed?',
            experience.schedule
              .map((item) => item.activity + ' — ' + item.day + ' 2026')
              .join('; ') + '. Check the official venue links for changes and ticket availability.',
          ],
          [
            'Are the listed door times the performance start times?',
            'No. Doors opening allows guests into the venue before the performance. Show start and finish times, admission ages and bag policies depend on the specific event. Confirm these directly with the organiser.',
          ],
          [
            'What is included in an event car rental?',
            'Your confirmed quote sets out the vehicle, rental period, mileage, insurance, deposit and delivery terms. Concert tickets, venue parking, hospitality and a chauffeur are separate unless explicitly agreed in your booking.',
          ],
        ]
  return (
    <PartnerMotion className={'z-event-guide z-event-editorial z-event-theme-' + event.slug}>
      <div className="container-lux">
        <header className="z-event-intro">
          <p className="z-event-eyebrow">
            <span />
            <T>{event.category}</T>
            <span />
          </p>
          <SingleLineHeading text={guide.title} />
          <p className="z-event-subtitle">
            <T>{experience.subtitle}</T>
          </p>
          <p className="z-event-dateline">
            <Icon name="calendar" size={17} />
            <T>{event.dateLabel}</T>
            <span>·</span>
            <T>{event.venue}</T>
          </p>
          <div className="z-event-actions">
            <Link href={bookingHref} className="z-button">
              <T>Arrange your car</T>
              <Icon name="arrow" />
            </Link>
            <a href={experience.artists.length ? '#lineup' : '#programme'} className="z-text-link">
              <T>{experience.artists.length ? 'Explore the lineup' : 'Explore the event'}</T>
              <Icon name="arrow" size={16} />
            </a>
          </div>
        </header>
      </div>
      <figure className="z-event-cover">
        <div>
          <Image src={event.image} alt={event.imageAlt} fill priority sizes="100vw" />
        </div>
        <figcaption className="container-lux">
          {isRace ? 'Racing at Meydan · archive photograph from Dubai Racing Club' : event.imageAlt}
        </figcaption>
      </figure>
      <div className="container-lux">
        <nav className="z-event-jump" aria-label="On this event page">
          {experience.artists.length > 0 && (
            <a href="#lineup">
              <T>Artist lineup</T>
            </a>
          )}
          <a href="#programme">
            <T>{isRace ? 'Race programme' : 'Dates & schedule'}</T>
          </a>
          <a href="#event-gallery">
            <T>Event gallery</T>
          </a>
          <a href="#venue">
            <T>Venue & arrival</T>
          </a>
          <a href="#event-cars">
            <T>Choose your car</T>
          </a>
          <a href="#event-faq">
            <T>FAQs</T>
          </a>
        </nav>
        <section className="z-event-overview">
          <p>
            <T>{experience.overview}</T>
          </p>
        </section>
        {experience.artists.length > 0 && (
          <section id="lineup" className="z-event-block">
            <header className="z-event-section-heading">
              <p className="z-kicker">
                <T>The names making the night</T>
              </p>
              <h2>
                <T>{isF1 ? 'Your 2026 Yasalam lineup' : 'Who’s taking the stage'}</T>
              </h2>
              <p>
                <T>
                  Find your artist, date and venue. Follow the official event link for tickets and
                  the latest admission information.
                </T>
              </p>
            </header>
            <div className="z-event-artists">
              {experience.artists.map((artist) => (
                <article className="z-event-artist" key={artist.name}>
                  <a
                    className="z-event-artist-image"
                    href={artist.ticket}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={'Official event information for ' + artist.name}
                  >
                    <Image
                      src={artist.image}
                      alt={artist.name + ' — official event artwork'}
                      fill
                      sizes={
                        event.slug === 'dubai-concerts'
                          ? '(max-width:600px) 100vw,50vw'
                          : '(max-width:600px) 90vw,(max-width:1000px) 42vw,33vw'
                      }
                      quality={90}
                    />
                  </a>
                  <div className="z-event-artist-copy">
                    <p className="z-kicker">{artist.date}</p>
                    <h3>{artist.name}</h3>
                    <p className="z-event-artist-venue">{artist.venue}</p>
                    <p>{artist.description}</p>
                    <a
                      href={artist.ticket}
                      target="_blank"
                      rel="noreferrer"
                      className="z-text-link"
                    >
                      <T>Event details & tickets</T>
                      <Icon name="arrow" size={15} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
        <section id="programme" className="z-event-block">
          <header className="z-event-section-heading">
            <p className="z-kicker">
              <T>{isRace ? 'The racing, in focus' : 'Put it in your calendar'}</T>
            </p>
            <h2>
              <T>{isRace ? 'The meeting & its highlights' : 'Your event schedule'}</T>
            </h2>
            <p>
              <T>
                {isRace
                  ? 'Past results are identified by edition. The next meeting’s details will follow the organiser’s announcement.'
                  : 'Dates are for 2026. Door times, where published, are UAE local time and are separate from performance start times.'}
              </T>
            </p>
          </header>
          <div className="z-event-timeline">
            {experience.schedule.map((row) => (
              <article key={row.day}>
                <p className="z-event-timeline-date">{row.day}</p>
                <div>
                  <h3>{row.activity}</h3>
                  <p className="z-event-timeline-venue">{row.venue}</p>
                  <p>{row.note}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section id="event-gallery" className="z-event-block">
          <header className="z-event-section-heading">
            <p className="z-kicker">
              <T>Get a feel for the occasion</T>
            </p>
            <h2>
              <T>Inside the experience</T>
            </h2>
          </header>
          <EventGallery images={experience.gallery} />
        </section>
        <section id="venue" className="z-event-block">
          <header className="z-event-section-heading">
            <p className="z-kicker">
              <T>Before you set off</T>
            </p>
            <h2>
              <T>Your visit, planned properly</T>
            </h2>
            <p>
              <T>
                Venue access, tickets and parking are arranged with the organiser. Your vehicle
                delivery and return are agreed with the rental team.
              </T>
            </p>
          </header>
          <div className="z-event-visit-grid">
            {experience.visit.map((item, index) => (
              <article key={item.heading}>
                <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <h3>{item.heading}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>
        <aside className="z-event-sources">
          <p className="z-kicker">
            <T>From the organisers</T>
          </p>
          <p>
            Information checked 20 September 2026. Programmes, prices and access arrangements can
            change.
          </p>
          <div>
            {experience.sources.map((source) => (
              <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
                {source.label}
                <Icon name="arrow" size={14} />
              </a>
            ))}
          </div>
        </aside>
        <section id="event-cars" className="z-event-car-section">
          <header className="z-event-section-heading">
            <p className="z-kicker">
              <T>The finishing touch</T>
            </p>
            <h2>
              <T>Choose your arrival</T>
            </h2>
            <p>
              <T>
                Explore models and listed daily rates, then request your dates. Availability,
                insurance, mileage and delivery charges are confirmed with your quote.
              </T>
            </p>
          </header>
          <CarCarousel
            cars={cars}
            label="Explore event rental cars"
            query={'?event=' + event.slug}
          />
        </section>
        <section id="event-faq" className="z-event-guide-faq">
          <header className="z-event-section-heading">
            <p className="z-kicker">
              <T>The details that matter</T>
            </p>
            <h2>
              <T>Before you book</T>
            </h2>
          </header>
          <div className="z-event-faq-list">
            {[...specificQuestions, ...guide.questions].map(([question, answer]) => (
              <details key={question}>
                <summary>
                  <span>{question}</span>
                  <Icon name="plus" size={18} />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="z-event-closing">
          <p className="z-kicker">
            <T>Your date. Your destination.</T>
          </p>
          <h2>
            <T>Make the arrival part of it.</T>
          </h2>
          <p>
            <T>
              Share your event, preferred car and collection address. We’ll confirm the rental
              details around your plans.
            </T>
          </p>
          <Link href={bookingHref} className="z-button">
            <T>Request your event rental</T>
            <Icon name="arrow" />
          </Link>
        </section>
        <nav className="z-event-related" aria-label="More event rentals">
          {rentalEvents
            .filter((item) => item.slug !== event.slug)
            .map((item) => (
              <Link key={item.slug} href={eventHref(item.slug)}>
                <span className="z-event-related-photo">
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    sizes="(max-width:640px) 100vw,33vw"
                  />
                </span>
                <span className="z-kicker">{item.dateLabel}</span>
                <strong>{item.name}</strong>
                <Icon name="arrow" size={18} />
              </Link>
            ))}
        </nav>
      </div>
    </PartnerMotion>
  )
}
