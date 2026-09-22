'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { Car } from '@/lib/types'
import { carHref } from '@/lib/catalogue'
import Icon from './Icon'
export default function Hero({ cars, total }: { cars: Car[]; total?: number }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoFailed, setVideoFailed] = useState(false)
  const car = cars[0]

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotion = () => {
      if (motion.matches) video.pause()
      else void video.play().catch(() => {})
    }
    syncMotion()
    motion.addEventListener('change', syncMotion)
    return () => {
      motion.removeEventListener('change', syncMotion)
      video.pause()
    }
  }, [Boolean(car)])

  if (!car) return null
  return (
    <section className="z-hero">
      <div className="z-hero-photo">
        <Image
          src="/videos/zavi-banner-poster.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="is-active"
        />
        <video
          ref={videoRef}
          id="hero-video"
          className="z-hero-video"
          src="/videos/zavi-banner.mp4"
          poster="/videos/zavi-banner-poster.webp"
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          hidden={videoFailed}
          onError={() => {
            setVideoFailed(true)
          }}
        />
      </div>
      <div className="container-lux z-hero-content">
        <p className="z-kicker">
          <T>Zavi · Dubai</T>
        </p>
        <h1>
          <T>Luxury car rental</T>
          <br />
          <span>
            <T>in Dubai</T>
          </span>
        </h1>
        <p className="z-hero-intro">
          <T>Compare cars, photos and daily rental rates.</T>
          <br />
          <T>Choose your dates and send a reservation request.</T>
        </p>
        <Link href="/fleet" className="z-button">
          <T>Explore the fleet </T>
          <Icon name="arrow" />
        </Link>
      </div>
      <div className="container-lux z-hero-bottom">
        <div className="z-hero-car">
          <span className="z-kicker">
            <T>In the spotlight</T>
          </span>
          <Link href={carHref(car)}>
            <T>{car.name}</T> <Icon name="arrow" size={18} />
          </Link>
          <span>
            {car.pricing.daily && <Price amount={car.pricing.daily} />}
            <T> </T>
            <small>
              <T>/ day</T>
            </small>
          </span>
        </div>
        <Link href="/fleet" className="z-hero-count">
          <strong>{total || cars.length}</strong>
          <span>
            <T>vehicles</T>
            <br />
            <T>in the catalogue.</T>
          </span>
        </Link>
      </div>
    </section>
  )
}

import { T, Price } from '@/components/RegionalProvider'
