'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { Car } from '@/lib/types'
import { swatchFor } from './CarCard'

/** Main image plus thumbnail rail and, when the car has them, colour swatches. */
export default function CarGallery({ car }: { car: Car }) {
  const [index, setIndex] = useState(0)
  const [colour, setColour] = useState(car.colors.find((c) => c.default)?.slug ?? '')

  const image = car.images[index] ?? car.images[0]

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-ink-900">
        {image && (
          <Image
            key={image.src}
            src={image.src}
            alt={`${car.name} - view ${index + 1}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover"
          />
        )}

        {car.images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setIndex((i) => (i - 1 + car.images.length) % car.images.length)}
              aria-label="Previous image"
              className="absolute top-1/2 left-4 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-ink-950/55 backdrop-blur-sm transition-colors hover:border-gold-500 hover:text-gold-500"
            >
              &larr;
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => (i + 1) % car.images.length)}
              aria-label="Next image"
              className="absolute top-1/2 right-4 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-ink-950/55 backdrop-blur-sm transition-colors hover:border-gold-500 hover:text-gold-500"
            >
              &rarr;
            </button>
            <span className="absolute right-4 bottom-4 rounded-full bg-ink-950/65 px-3 py-1 text-xs text-bone/80 backdrop-blur-sm">
              {index + 1} / {car.images.length}
            </span>
          </>
        )}
      </div>

      {car.images.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-3 sm:grid-cols-6">
          {car.images.slice(0, 12).map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === index}
              className={`relative aspect-square overflow-hidden rounded-sm border transition-colors ${
                i === index ? 'border-gold-500' : 'border-transparent hover:border-white/30'
              }`}
            >
              <Image
                src={img.thumbnail}
                alt=""
                fill
                sizes="100px"
                className={`object-cover transition-opacity ${i === index ? '' : 'opacity-60'}`}
              />
            </button>
          ))}
        </div>
      )}

      {car.colors.length > 0 && (
        <div className="mt-8">
          <p className="eyebrow mb-4">
            Available colours
            <span className="ml-2 normal-case tracking-normal text-muted">
              {car.colors.find((c) => c.slug === colour)?.name ?? ''}
            </span>
          </p>
          <div className="flex flex-wrap gap-3">
            {car.colors.map((item) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => setColour(item.slug)}
                title={item.name}
                aria-label={item.name}
                aria-current={colour === item.slug}
                className={`h-9 w-9 rounded-full border-2 transition-transform duration-300 hover:scale-110 ${
                  colour === item.slug ? 'border-gold-500' : 'border-white/25'
                }`}
                style={{ background: swatchFor(item.slug) }}
              />
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">
            Colour availability is confirmed at the time of booking.
          </p>
        </div>
      )}
    </div>
  )
}
