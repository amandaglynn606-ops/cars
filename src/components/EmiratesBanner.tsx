'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { T, useRegional } from './RegionalProvider'
import Icon from './Icon'
import { locationHref } from '@/lib/location-routing'
import { destinationMedia } from '@/lib/destination-media'

const emirates = [
  { id: 'dubai', name: 'Dubai', landmark: 'The Dubai skyline', position: '50% 48%' },
  {
    id: 'abu-dhabi',
    name: 'Abu Dhabi',
    landmark: 'Sheikh Zayed Grand Mosque',
    position: '57% 44%',
  },
  {
    id: 'sharjah',
    name: 'Sharjah',
    landmark: 'Al Noor Island and Al Majaz waterfront',
    position: '60% 62%',
  },
  { id: 'ajman', name: 'Ajman', landmark: 'Fairmont Ajman', position: '50% 65%' },
  {
    id: 'umm-al-quwain',
    name: 'Umm Al Quwain',
    landmark: 'Vida Beach Resort',
    position: '50% 75%',
  },
  {
    id: 'ras-al-khaimah',
    name: 'Ras Al Khaimah',
    landmark: 'Mövenpick Resort Al Marjan Island',
    position: '50% 50%',
  },
  {
    id: 'fujairah',
    name: 'Fujairah',
    landmark: 'InterContinental Fujairah Resort',
    position: '50% 50%',
  },
]

export default function EmiratesBanner() {
  const [active, setActive] = useState(0)
  const { t } = useRegional()
  return (
    <section id="emirates" className="z-emirates" aria-labelledby="emirates-heading">
      <div className="z-emirates-images" aria-hidden="true">
        {emirates.map((emirate, index) => (
          <Image
            key={emirate.id}
            src={destinationMedia[emirate.id].src}
            alt=""
            fill
            sizes="100vw"
            quality={90}
            className={active === index ? 'is-active' : ''}
            style={{ objectPosition: emirate.position }}
          />
        ))}
      </div>
      <div className="z-emirates-content container-lux">
        <div className="z-emirates-heading">
          <p className="z-kicker">
            03 <span aria-hidden="true">/</span> <T>Across the UAE</T>
          </p>
          <h2 id="emirates-heading">
            <T>Explore the emirates</T>
          </h2>
          <p>
            <T>Plan your route and request delivery in your chosen emirate.</T>
          </p>
        </div>
        <div className="z-emirates-destination">
          <div id="emirate-preview" role="region" aria-label={t('Selected emirate')}>
            <h3>
              <Link href={locationHref(emirates[active].id)}>
                <T>{emirates[active].name}</T>
                <Icon name="arrow" size={30} />
              </Link>
            </h3>
          </div>
          <Link
            href={'/book?location=' + encodeURIComponent(emirates[active].name)}
            className="z-button z-button-outline"
          >
            <T>Reserve a vehicle</T>
            <Icon name="arrow" size={18} />
          </Link>
        </div>
        <div className="z-emirates-options" role="group" aria-label={t('Explore the emirates')}>
          {emirates.map((emirate, index) => (
            <button
              key={emirate.id}
              type="button"
              aria-pressed={active === index}
              aria-controls="emirate-preview"
              onPointerEnter={(e) => {
                if (e.pointerType !== 'touch' && window.matchMedia('(min-width: 901px)').matches)
                  setActive(index)
              }}
              onFocus={() => setActive(index)}
              onClick={() => setActive(index)}
            >
              <span aria-hidden="true">0{index + 1}</span>
              <T>{emirate.name}</T>
              <Icon name="arrow" size={15} />
            </button>
          ))}
        </div>
        <div className="z-emirates-foot">
          <p>
            <T>Delivery timing and charges are confirmed with your quote.</T>
          </p>
          <Link href="/image-credits">
            <T>Photo credits</T>
          </Link>
        </div>
      </div>
    </section>
  )
}
