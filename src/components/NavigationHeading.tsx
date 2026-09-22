import Link from 'next/link'
import Icon from './Icon'
import { T } from './RegionalProvider'
export default function NavigationHeading({
  eyebrow,
  title,
  href,
  link,
  close,
}: {
  eyebrow: string
  title: string
  href: string
  link: string
  close: () => void
}) {
  return (
    <div className="z-nav-panel-heading" data-nav-reveal>
      <div>
        <p className="z-kicker">
          <T>{eyebrow}</T>
        </p>
        <h2>
          <T>{title}</T>
        </h2>
      </div>
      <Link href={href} onClick={close} className="z-nav-view-all">
        <T>{link}</T>
        <Icon name="arrow" size={17} />
      </Link>
    </div>
  )
}
