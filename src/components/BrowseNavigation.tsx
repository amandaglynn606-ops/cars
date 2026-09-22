'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useLayoutEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { gsap } from 'gsap'
import Icon from './Icon'
import { T } from './RegionalProvider'
import NavigationDropdown from './NavigationDropdown'
import NavigationHeading from './NavigationHeading'
export type BrowseLink = { name: string; href: string; count?: number }
export type BrowseGroup = { name: string; href?: string; links: BrowseLink[] }
export default function BrowseNavigation({
  label,
  href,
  groups,
  mobile = false,
  collapsible = false,
  dismiss = false,
  onOpen,
  onNavigate,
}: {
  label: string
  href: string
  groups: BrowseGroup[]
  mobile?: boolean
  collapsible?: boolean
  dismiss?: boolean
  onOpen?: () => void
  onNavigate: () => void
}) {
  const pathname = usePathname()
  const [selected, setSelected] = useState(() =>
    Math.max(
      0,
      groups.findIndex(
        (group) => group.href === pathname || group.links.some((link) => link.href === pathname),
      ),
    ),
  )
  const content = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (!content.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const context = gsap.context(() => {
      gsap.fromTo(
        content.current,
        { opacity: 0, y: 7 },
        { opacity: 1, y: 0, duration: 0.24, ease: 'power2.out', clearProps: 'opacity,transform' },
      )
    }, content)
    return () => context.revert()
  }, [selected])
  const brands = href === '/brands'
  return (
    <NavigationDropdown label={label} mobile={mobile} dismiss={dismiss} onOpen={onOpen}>
      {(dismissPanel) => {
        const close = () => {
          dismissPanel()
          onNavigate()
        }
        return (
          <>
            <NavigationHeading
              eyebrow={label}
              title={brands ? 'Find your signature.' : 'Where will you go?'}
              href={href}
              link={brands ? 'View all brands' : 'View all locations'}
              close={close}
            />
            {collapsible ? (
              <div className="z-nav-destinations">
                <div
                  className="z-nav-emirates"
                  role="group"
                  aria-label="Choose an emirate"
                  data-nav-reveal
                >
                  {groups.map((group, index) => (
                    <button
                      key={group.name}
                      type="button"
                      aria-pressed={selected === index}
                      onClick={() => setSelected(index)}
                    >
                      <span className="z-nav-index">{String(index + 1).padStart(2, '0')}</span>
                      <T>{group.name}</T>
                      <Icon name="arrow" size={16} />
                    </button>
                  ))}
                </div>
                <div ref={content} className="z-nav-destination-content" data-nav-reveal>
                  {groups.map((group, index) => (
                    <section hidden={index !== selected} key={group.name} aria-label={group.name}>
                      <div className="z-nav-area-heading">
                        <div>
                          <p className="z-kicker">
                            <T>Explore the emirate</T>
                          </p>
                          <h3>
                            <T>{group.name}</T>
                          </h3>
                        </div>
                        {group.href && (
                          <Link href={group.href} onClick={close}>
                            <T>Overview</T>
                            <Icon name="arrow" size={16} />
                          </Link>
                        )}
                      </div>
                      <div className="z-nav-area-links">
                        {group.links.map((item) => (
                          <Link
                            href={item.href}
                            key={item.href}
                            prefetch={false}
                            onClick={close}
                            aria-current={pathname === item.href ? 'page' : undefined}
                          >
                            <T>{item.name}</T>
                            <Icon name="arrow" size={14} />
                          </Link>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            ) : (
              <div className="z-nav-brand-grid">
                {groups
                  .flatMap((group) => group.links)
                  .map((item) => (
                    <Link
                      className="z-nav-brand-tile"
                      data-nav-reveal
                      href={item.href}
                      key={item.href}
                      prefetch={false}
                      onClick={close}
                      aria-current={pathname === item.href ? 'page' : undefined}
                    >
                      <span className="z-nav-brand-mark">
                        <Image
                          src={'/brands/' + item.href.split('/').pop() + '.svg'}
                          alt=""
                          width={52}
                          height={38}
                        />
                      </span>
                      <span>
                        <strong>
                          <T>{item.name}</T>
                        </strong>
                        <small>
                          {item.count} <T>vehicles</T>
                        </small>
                      </span>
                      <Icon name="arrow" size={16} />
                    </Link>
                  ))}
              </div>
            )}
            <div className="z-nav-panel-foot">
              <span className="z-nav-foot-dot" />
              <T>
                {brands
                  ? 'Explore the models. Find your drive.'
                  : 'Choose your area to plan delivery and collection.'}
              </T>
            </div>
          </>
        )
      }}
    </NavigationDropdown>
  )
}
