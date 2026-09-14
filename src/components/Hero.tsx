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

/**
 * Cinematic hero: the featured cars cross-fade on a timer, the headline reveals
 * line by line, and the whole stage parallaxes and dims as the visitor scrolls on.
 */
export default function Hero({ cars }: { cars: Car[] }) {
  const root = useRef<HTMLElement>(null)
  const [index, setIndex] = useState(0)
  const slides = cars.slice(0, 4)

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (!reduced) {
        // Entrance: headline lines rise, then the supporting furniture fades up.
        gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .from('.hero-line > span', { yPercent: 118, duration: 1.25, stagger: 0.12 }, 0.15)
          .from('.hero-eyebrow', { opacity: 0, y: 16, duration: 0.8 }, 0.1)
          .from('.hero-sub', { opacity: 0, y: 24, duration: 0.9 }, 0.75)
          .from('.hero-cta', { opacity: 0, y: 24, duration: 0.9, stagger: 0.1 }, 0.9)
          .from('.hero-stat', { opacity: 0, y: 20, duration: 0.8, stagger: 0.08 }, 1.0)
          .from('.hero-scroll', { opacity: 0, duration: 0.8 }, 1.2)

        // Slow push-in on the backdrop keeps the frame alive while idle.
        gsap.to('.hero-media', { scale: 1.12, duration: 14, ease: 'none', repeat: -1, yoyo: true })
      }

      // Parallax + fade as the hero leaves the viewport.
      gsap.to('.hero-media', {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
      gsap.to('.hero-content', {
        yPercent: 42,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
    },
    { scope: root },
  )

  // Advance the backdrop on a timer.
  useGSAP(() => {
    if (slides.length < 2) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), 5200)
    return () => window.clearInterval(id)
  }, [slides.length])

  const active = slides[index]

  return (
    <section ref={root} className="relative h-[100svh] min-h-[640px] overflow-hidden">
      {/* Backdrop stack - all slides mounted, opacity cross-fades between them */}
      <div className="hero-media absolute inset-0 will-change-transform">
        {slides.map((car, i) => (
          <div
            key={car.slug}
            className="absolute inset-0 transition-opacity duration-[1600ms] ease-[var(--ease-lux)]"
            style={{ opacity: i === index ? 1 : 0 }}
          >
            <Image
              src={car.images[0].src}
              alt={car.name}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Legibility scrims */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/55 to-ink-950/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink-950/85 via-transparent to-transparent" />

      <div className="hero-content container-lux relative flex h-full flex-col justify-end pb-20 md:justify-center md:pb-0">
        <p className="hero-eyebrow eyebrow mb-5">Dubai &middot; United Arab Emirates</p>

        <h1 className="font-display text-[clamp(2.75rem,8vw,7rem)] leading-[0.92] tracking-tight">
          <span className="hero-line reveal-line">
            <span>Drive the</span>
          </span>
          <span className="hero-line reveal-line text-gold-500">
            <span>extraordinary</span>
          </span>
        </h1>

        <p className="hero-sub mt-7 max-w-lg text-base leading-relaxed text-bone/70 md:text-lg">
          {cars.length}+ supercars and luxury vehicles, delivered anywhere in Dubai. No deposits
          held, no hidden fees &mdash; confirm your booking in a single WhatsApp message.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/fleet"
            className="hero-cta group relative overflow-hidden rounded-full bg-gold-500 px-9 py-4 text-xs tracking-[0.18em] uppercase text-ink-950 transition-transform duration-300 hover:scale-[1.03]"
          >
            <span className="relative z-10">Explore the fleet</span>
            <span className="absolute inset-0 translate-y-full bg-bone transition-transform duration-400 ease-[var(--ease-lux)] group-hover:translate-y-0" />
          </Link>
          <Link
            href="/book"
            className="hero-cta rounded-full border border-bone/25 px-9 py-4 text-xs tracking-[0.18em] uppercase transition-colors duration-300 hover:border-gold-500 hover:text-gold-500"
          >
            Reserve a car
          </Link>
        </div>

        {/* Live caption for the car currently on screen */}
        {active && (
          <div className="hairline mt-12 flex flex-wrap items-end gap-x-10 gap-y-4 pt-7">
            <div className="hero-stat">
              <p className="eyebrow mb-1.5">Now showing</p>
              <Link
                href={`/fleet/${active.slug}`}
                className="font-display text-lg transition-colors hover:text-gold-500"
              >
                {active.name}
              </Link>
            </div>
            {active.pricing.daily && (
              <div className="hero-stat">
                <p className="eyebrow mb-1.5">From</p>
                <p className="font-display text-lg">
                  {formatPrice(active.pricing.daily, active.pricing.currency)}
                  <span className="ml-1 text-xs text-muted">/ day</span>
                </p>
              </div>
            )}
            {active.specs.horsepower && (
              <div className="hero-stat">
                <p className="eyebrow mb-1.5">Power</p>
                <p className="font-display text-lg">
                  {active.specs.horsepower} <span className="text-xs text-muted">hp</span>
                </p>
              </div>
            )}

            {/* Slide selector */}
            <div className="hero-stat ml-auto flex items-center gap-2.5">
              {slides.map((car, i) => (
                <button
                  key={car.slug}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show ${car.name}`}
                  aria-current={i === index}
                  className={`h-px transition-all duration-500 ease-[var(--ease-lux)] ${
                    i === index ? 'w-12 bg-gold-500' : 'w-6 bg-bone/30 hover:bg-bone/60'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="hero-scroll absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
        <span className="eyebrow text-bone/40">Scroll</span>
        <span className="h-12 w-px bg-gradient-to-b from-gold-500 to-transparent" />
      </div>
    </section>
  )
}
