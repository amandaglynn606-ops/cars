'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import type { Car } from '@/lib/types'
import { formatPrice } from '@/lib/format'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const SLIDE_MS = 6000

/**
 * Cinematic hero. Featured cars cross-fade behind a headline that reveals line
 * by line; the whole stage parallaxes and dims as the visitor scrolls past.
 */
export default function Hero({ cars }: { cars: Car[] }) {
  const root = useRef<HTMLElement>(null)
  const [index, setIndex] = useState(0)
  const slides = cars.slice(0, 4)

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (!reduced) {
        gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .from('.hero-line > span', { yPercent: 115, duration: 1.35, stagger: 0.1 }, 0.2)
          .from('.hero-eyebrow', { opacity: 0, x: -20, duration: 0.9 }, 0.15)
          .from('.hero-sub', { opacity: 0, y: 22, duration: 0.9 }, 0.8)
          .from('.hero-cta', { opacity: 0, y: 22, duration: 0.9, stagger: 0.09 }, 0.95)
          .from('.hero-meta', { opacity: 0, y: 18, duration: 0.8, stagger: 0.07 }, 1.1)
          .from('.hero-scroll', { opacity: 0, duration: 0.9 }, 1.35)

        // Slow drift keeps the frame alive while the visitor reads.
        gsap.to('.hero-media', { scale: 1.1, duration: 16, ease: 'none', repeat: -1, yoyo: true })
      }

      gsap.to('.hero-media', {
        yPercent: 16,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
      gsap.to('.hero-content', {
        yPercent: 34,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
    },
    { scope: root },
  )

  useGSAP(() => {
    if (slides.length < 2) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), SLIDE_MS)
    return () => window.clearInterval(id)
  }, [slides.length])

  const active = slides[index]

  return (
    <section ref={root} className="relative h-[100svh] min-h-[660px] overflow-hidden">
      <div className="hero-media absolute inset-0 will-change-transform">
        {slides.map((car, i) => (
          <div
            key={car.slug}
            aria-hidden={i !== index}
            className="absolute inset-0 transition-opacity duration-[1800ms] ease-[var(--ease-lux)]"
            style={{ opacity: i === index ? 1 : 0 }}
          >
            <Image
              src={car.images[0].src}
              alt={i === index ? car.name : ''}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* No wash over the car itself - only a bottom scrim deep enough to carry
          the headline, so the upper two-thirds of the photograph stays clean. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-ink-950 via-ink-950/75 to-transparent" />

      <div className="hero-content container-lux relative flex h-full flex-col justify-end pb-14 md:pb-20">
        <p className="hero-eyebrow eyebrow mb-6">Dubai &middot; United Arab Emirates</p>

        <h1 className="font-display display-xl max-w-[18ch]">
          <span className="hero-line reveal-line">
            <span>Drive the</span>
          </span>
          <span className="hero-line reveal-line">
            <span className="text-gold-500 italic">extraordinary</span>
          </span>
        </h1>

        <div className="mt-9 flex flex-col gap-9 lg:flex-row lg:items-end lg:justify-between">
          <p className="hero-sub max-w-md text-[0.95rem] leading-relaxed text-bone/65 md:text-base">
            {cars.length > 0 && `${cars.length} `}supercars and luxury vehicles, delivered anywhere
            in Dubai. No deposits held online, no hidden fees &mdash; confirm your booking in a
            single WhatsApp message.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/fleet"
              className="hero-cta group relative overflow-hidden rounded-full bg-bone px-8 py-4 text-[0.7rem] font-medium tracking-[0.16em] text-ink-950 uppercase"
            >
              <span className="relative z-10">Explore the fleet</span>
              <span className="absolute inset-0 -translate-x-full bg-gold-500 transition-transform duration-500 ease-[var(--ease-lux)] group-hover:translate-x-0" />
            </Link>
            <Link
              href="/book"
              className="hero-cta rounded-full border border-bone/25 px-8 py-4 text-[0.7rem] font-medium tracking-[0.16em] uppercase transition-colors duration-400 hover:border-gold-500 hover:text-gold-500"
            >
              Reserve a car
            </Link>
          </div>
        </div>

        {active && (
          <div className="hairline mt-11 flex flex-wrap items-end gap-x-12 gap-y-5 pt-6">
            <div className="hero-meta">
              <p className="mb-2 text-[0.6rem] tracking-[0.22em] text-faint uppercase">
                Now showing
              </p>
              <Link
                href={`/fleet/${active.slug}`}
                className="link-sweep font-display text-xl transition-colors hover:text-gold-500"
              >
                {active.name}
              </Link>
            </div>

            {active.pricing.daily && (
              <div className="hero-meta">
                <p className="mb-2 text-[0.6rem] tracking-[0.22em] text-faint uppercase">From</p>
                <p className="font-display text-xl">
                  {formatPrice(active.pricing.daily, active.pricing.currency)}
                  <span className="ml-1.5 font-sans text-[0.7rem] text-muted">/ day</span>
                </p>
              </div>
            )}

            {active.specs.horsepower && (
              <div className="hero-meta hidden sm:block">
                <p className="mb-2 text-[0.6rem] tracking-[0.22em] text-faint uppercase">Power</p>
                <p className="font-display text-xl">
                  {active.specs.horsepower}
                  <span className="ml-1.5 font-sans text-[0.7rem] text-muted">hp</span>
                </p>
              </div>
            )}

            <div className="hero-meta ml-auto flex items-center gap-3">
              {slides.map((car, i) => (
                <button
                  key={car.slug}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show ${car.name}`}
                  aria-current={i === index}
                  className="group relative py-3"
                >
                  <span
                    className={`block h-px transition-all duration-600 ease-[var(--ease-lux)] ${
                      i === index
                        ? 'w-14 bg-gold-500'
                        : 'w-7 bg-bone/25 group-hover:w-10 group-hover:bg-bone/60'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="hero-scroll pointer-events-none absolute right-8 bottom-16 hidden flex-col items-center gap-3 lg:flex">
        <span className="text-[0.6rem] tracking-[0.22em] text-bone/35 uppercase [writing-mode:vertical-rl]">
          Scroll
        </span>
        <span className="h-14 w-px bg-gradient-to-b from-gold-500 to-transparent" />
      </div>
    </section>
  )
}
