'use client'
import Image from 'next/image'
import { useState } from 'react'
import type { Car } from '@/lib/types'
import { photographedColours, colourPreview, colourSwatch } from '@/lib/image-variants'
import { T } from './RegionalProvider'
export default function CarGallery({
  car,
  initialColour = '',
}: {
  car: Car
  initialColour?: string
}) {
  const colours = photographedColours(car)
  const [selected, setSelected] = useState(() => colourPreview(car, initialColour).colour)
  const { colour, image } = colourPreview(car, selected)
  const activeName = colours.find((item) => item.slug === colour)?.name
  return (
    <div className="z-gallery">
      <div
        className="z-gallery-photo relative aspect-[4/3] overflow-hidden bg-ink-900"
        data-gallery-colour={colour || 'unassigned'}
      >
        {image && (
          <Image
            key={image.src}
            src={image.src}
            alt={car.name + (activeName ? ' in ' + activeName : '')}
            fill
            priority
            sizes="(max-width:800px) 100vw,55vw"
            className="object-cover"
          />
        )}
      </div>
      {colours.length > 0 && (
        <div className="z-gallery-colours" style={{ marginTop: 24 }}>
          {colours.length > 0 && (
            <>
              <p className="z-kicker">
                <T>Choose a colour</T>
              </p>
              <div className="z-colour-options" role="group" aria-label="Vehicle colours">
                {colours.map((item) => (
                  <button
                    key={item.slug}
                    type="button"
                    aria-pressed={colour === item.slug}
                    onClick={() => setSelected(item.slug)}
                    aria-label={'View ' + item.name + ' car'}
                  >
                    <span
                      className="z-colour-dot"
                      style={{ background: colourSwatch(item.slug) }}
                    />
                    <T>{item.name}</T>
                  </button>
                ))}
              </div>
            </>
          )}
          <p className="z-gallery-caption" role="status">
            <>
              <T>{activeName}</T>
              <T> · Colour availability is confirmed with your reservation.</T>
            </>
          </p>
        </div>
      )}
    </div>
  )
}
