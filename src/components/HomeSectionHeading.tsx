import Link from 'next/link'
import Icon from './Icon'

export default function HomeSectionHeading({
  id,
  number,
  eyebrow,
  title,
  description,
  href,
  linkLabel,
}: {
  id: string
  number: string
  eyebrow: string
  title: string
  description: string
  href?: string
  linkLabel?: string
}) {
  return (
    <header className="z-home-heading">
      <p className="z-kicker">
        <span>
          <T>{number}</T>
        </span>
        <T>{eyebrow}</T>
      </p>
      <h2 id={id}>
        <T>{title}</T>
      </h2>
      <div className="z-home-section-intro">
        <p>
          <T>{description}</T>
        </p>
        {href && (
          <Link href={href} className="z-text-link">
            <T>{linkLabel}</T>
            <Icon name="arrow" size={18} />
          </Link>
        )}
      </div>
    </header>
  )
}

import { T } from '@/components/RegionalProvider'
