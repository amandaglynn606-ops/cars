'use client'

import { useEffect, useId, useRef, useState } from 'react'
import type { Car, RentalPeriod } from '@/lib/types'
import CarCard from './CarCard'
import Icon from './Icon'
import { T, useRegional } from './RegionalProvider'
import './car-carousel.css'

export default function CarCarousel({
  cars,
  label,
  period = 'daily',
  query = '',
}: {
  cars: Car[]
  label: string
  period?: RentalPeriod
  query?: string
}) {
  const track = useRef<HTMLDivElement>(null)
  const id = useId()
  const { t, language } = useRegional()
  const [position, setPosition] = useState({ first: 1, visible: 3, start: true, end: false })
  useEffect(() => {
    const node = track.current
    if (!node) return
    const update = () => {
      const first = node.firstElementChild as HTMLElement | null
      if (!first) return
      const gap = parseFloat(getComputedStyle(node).columnGap) || 0
      const step = first.offsetWidth + gap
      const offset = Math.abs(node.scrollLeft)
      setPosition({
        first: Math.round(offset / step) + 1,
        visible: Math.max(1, Math.floor((node.clientWidth + gap) / step)),
        start: offset < 2,
        end: offset + node.clientWidth >= node.scrollWidth - 2,
      })
    }
    const observer = new ResizeObserver(update)
    observer.observe(node)
    node.addEventListener('scroll', update, { passive: true })
    update()
    return () => {
      observer.disconnect()
      node.removeEventListener('scroll', update)
    }
  }, [cars.length, language])
  const move = (direction: number) => {
    const node = track.current
    const card = node?.firstElementChild as HTMLElement | null
    if (!node || !card) return
    const step = card.offsetWidth + (parseFloat(getComputedStyle(node).columnGap) || 0)
    node.scrollBy({
      left: direction * (language === 'ar' ? -1 : 1) * step * position.visible,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    })
  }
  return (
    <section className="z-car-carousel" aria-label={t(label)} aria-roledescription="carousel">
      <div className="z-carousel-toolbar">
        <p>
          <span className="z-carousel-count">{String(cars.length).padStart(2, '0')}</span>{' '}
          <T>{period === 'monthly' ? 'cars. One monthly offer.' : 'cars in this collection'}</T>
        </p>
        <div className="z-carousel-controls">
          <span className="z-carousel-range" aria-live="polite">
            {position.first}–{Math.min(cars.length, position.first + position.visible - 1)} /{' '}
            {cars.length}
          </span>
          <button
            type="button"
            className="is-previous"
            aria-label={t('Previous cars')}
            aria-controls={id}
            disabled={position.start}
            onClick={() => move(-1)}
          >
            <Icon name="arrow" size={19} />
          </button>
          <button
            type="button"
            aria-label={t('Next cars')}
            aria-controls={id}
            disabled={position.end}
            onClick={() => move(1)}
          >
            <Icon name="arrow" size={19} />
          </button>
        </div>
      </div>
      <div
        ref={track}
        id={id}
        className="z-carousel-track"
        tabIndex={0}
        aria-label={t('Swipe or use arrow keys to browse cars')}
        onKeyDown={(event) => {
          if (
            event.target === event.currentTarget &&
            ['ArrowLeft', 'ArrowRight'].includes(event.key)
          ) {
            event.preventDefault()
            move((event.key === 'ArrowRight' ? 1 : -1) * (language === 'ar' ? -1 : 1))
          }
        }}
      >
        {cars.map((car) => (
          <CarCard key={car.id} car={car} period={period} query={query} />
        ))}
      </div>
    </section>
  )
}
