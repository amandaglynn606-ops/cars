'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import NavigationDropdown from './NavigationDropdown'
import NavigationHeading from './NavigationHeading'
import Icon from './Icon'
import { T } from './RegionalProvider'
import './event-navigation.css'

export type EventLink = { name: string; href: string; venue: string; dateLabel: string }

export default function EventNavigation({
  events,
  mobile = false,
  dismiss = false,
  onOpen,
  onNavigate,
}: {
  events: EventLink[]
  mobile?: boolean
  dismiss?: boolean
  onOpen?: () => void
  onNavigate: () => void
}) {
  const pathname = usePathname()
  return (
    <NavigationDropdown label="Events" mobile={mobile} dismiss={dismiss} onOpen={onOpen}>
      {(dismissPanel) => {
        const close = () => {
          dismissPanel()
          onNavigate()
        }
        return (
          <>
            <NavigationHeading
              eyebrow="Events"
              title="Plan your next occasion"
              href="/events"
              link="View all events"
              close={close}
            />
            <div className="z-event-nav-grid">
              {events.map((event) => (
                <Link
                  key={event.href}
                  href={event.href}
                  onClick={close}
                  className="z-event-nav-link"
                  aria-current={pathname === event.href ? 'page' : undefined}
                  data-nav-reveal
                >
                  <span>
                    <small>
                      <T>{event.dateLabel}</T>
                    </small>
                    <strong>
                      <T>{event.name}</T>
                    </strong>
                    <span>
                      <T>{event.venue}</T>
                    </span>
                  </span>
                  <Icon name="arrow" size={20} />
                </Link>
              ))}
            </div>
          </>
        )
      }}
    </NavigationDropdown>
  )
}
