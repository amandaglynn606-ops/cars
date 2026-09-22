'use client'

import { useId, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { rentalEvents } from '@/lib/home-rentals'
import { eventHref } from '@/lib/event-guides'
import { T, useRegional } from './RegionalProvider'
import Icon from './Icon'
import './event-showcase.css'

gsap.registerPlugin(useGSAP)

export default function EventShowcase() {
  const [active, setActive] = useState(0)
  const root = useRef<HTMLElement>(null)
  const id = useId()
  const { t, language } = useRegional()
  useGSAP(
    () => {
      const media = gsap.matchMedia()
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.z-event-scene:not([hidden]) .z-event-backdrop', {
          scale: 1.07,
          opacity: 0.6,
          duration: 1.2,
          ease: 'power2.out',
        })
        gsap.from('.z-event-scene:not([hidden]) .z-event-copy > *', {
          opacity: 0,
          y: 22,
          stagger: 0.07,
          duration: 0.65,
          ease: 'power3.out',
          clearProps: 'opacity,transform',
        })
      })
      return () => media.revert()
    },
    { scope: root, dependencies: [active], revertOnUpdate: true },
  )
  const select = (index: number, focus = false) => {
    const next = (index + rentalEvents.length) % rentalEvents.length
    setActive(next)
    if (focus) document.getElementById(id + '-tab-' + next)?.focus()
  }
  return (
    <section
      ref={root}
      id="event-rentals"
      className="z-events-showcase"
      aria-labelledby="events-heading"
    >
      <div className="z-events-heading container-lux">
        <div>
          <p className="z-kicker">
            06 <span aria-hidden="true">/</span> <T>Beyond the everyday</T>
          </p>
          <h2 id="events-heading">
            <T>Arrive for</T>{' '}
            <em>
              <T>the occasion.</T>
            </em>
          </h2>
        </div>
        <p>
          <T>
            Race weekends. Headline nights. A reason to make an entrance. Your plans deserve the
            right car.
          </T>
        </p>
      </div>
      <div className="z-events-stage">
        {rentalEvents.map((event, index) => (
          <article
            key={event.slug}
            id={id + '-panel-' + index}
            aria-labelledby={id + '-tab-' + index}
            role="tabpanel"
            hidden={active !== index}
            className="z-event-scene"
            tabIndex={0}
          >
            <div className="z-event-backdrop">
              <Image src={event.image} alt={event.imageAlt} fill sizes="100vw" quality={90} />
            </div>
            <div className="z-event-shade" />
            <div className="z-event-scene-inner container-lux">
              <div className="z-event-copy">
                <p className="z-event-overline">
                  <span />
                  <T>{event.category}</T>
                </p>
                <p className="z-event-calendar">
                  <Icon name="calendar" size={16} />
                  {event.date ? (
                    <time dateTime={event.date}>{event.dateLabel}</time>
                  ) : (
                    <T>{event.dateLabel}</T>
                  )}
                </p>
                <h3>
                  <T>{event.name}</T>
                </h3>
                <p className="z-event-place">
                  <Icon name="pin" size={16} />
                  <T>{event.venue}</T>
                </p>
                <p className="z-event-description">
                  <T>{event.description}</T>
                </p>
                <div className="z-event-actions">
                  <Link href={eventHref(event.slug)} className="z-button">
                    <T>Explore event rentals</T>
                    <Icon name="arrow" size={19} />
                  </Link>
                  <a
                    href={event.source}
                    className="z-event-source"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <T>Official event information</T>
                    <Icon name="arrow" size={16} />
                  </a>
                </div>
                <p className="z-event-fineprint">
                  <T>{event.detail}</T>
                </p>
              </div>
              <span className="z-event-scene-number" aria-hidden="true">
                0{index + 1}
                <span> / 0{rentalEvents.length}</span>
              </span>
            </div>
          </article>
        ))}
      </div>
      <div className="z-event-tabs-wrap">
        <div
          className="z-event-tabs container-lux"
          role="tablist"
          aria-label={t('Choose an event')}
        >
          {rentalEvents.map((event, index) => (
            <button
              key={event.slug}
              type="button"
              role="tab"
              id={id + '-tab-' + index}
              aria-controls={id + '-panel-' + index}
              aria-selected={active === index}
              tabIndex={active === index ? 0 : -1}
              onClick={() => select(index)}
              onKeyDown={(e) => {
                if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
                  e.preventDefault()
                  select(
                    e.key === 'Home'
                      ? 0
                      : e.key === 'End'
                        ? rentalEvents.length - 1
                        : active + (e.key === 'ArrowRight' ? 1 : -1) * (language === 'ar' ? -1 : 1),
                    true,
                  )
                }
              }}
            >
              <span className="z-event-tab-index">0{index + 1}</span>
              <span>
                <small>
                  <T>{event.category}</T>
                </small>
                <strong>
                  <T>{event.name}</T>
                </strong>
                <span>
                  <T>{event.dateLabel}</T>
                </span>
              </span>
              <Icon name="arrow" size={18} />
            </button>
          ))}
        </div>
      </div>
      <p className="z-event-disclaimer container-lux">
        <T>
          Confirm dates and line-ups with the organiser before booking your car. Tickets, venue
          access and chauffeur services are separate.
        </T>
      </p>
    </section>
  )
}
