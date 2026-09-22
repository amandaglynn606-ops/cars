'use client'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
gsap.registerPlugin(useGSAP)
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { MenuCar } from './Nav'
import NavigationDropdown from './NavigationDropdown'
import NavigationHeading from './NavigationHeading'
import Icon from './Icon'
import { T, Price } from './RegionalProvider'
import { categorySlug } from '@/lib/catalogue'
export default function FleetNavigation({
  cars,
  categories,
  mobile = false,
  dismiss = false,
  onOpen,
  onNavigate,
}: {
  cars: MenuCar[]
  categories: { name: string; count: number }[]
  mobile?: boolean
  dismiss?: boolean
  onOpen?: () => void
  onNavigate: () => void
}) {
  const pathname = usePathname()
  const [activeCategory, setActiveCategory] = useState(categories[0]?.name || '')
  const modelGrid = useRef<HTMLDivElement>(null)
  const previewCars = cars.filter(
    (car) => !activeCategory || car.categories.includes(activeCategory),
  )
  useGSAP(
    () => {
      const element = modelGrid.current
      if (!element) return
      element.scrollTop = 0
      const media = gsap.matchMedia()
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          element.children,
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.32,
            stagger: 0.025,
            ease: 'power2.out',
            clearProps: 'opacity,transform',
          },
        )
      })
      return () => media.revert()
    },
    { scope: modelGrid, dependencies: [activeCategory], revertOnUpdate: true },
  )
  return (
    <NavigationDropdown label="The fleet" mobile={mobile} dismiss={dismiss} onOpen={onOpen}>
      {(dismissPanel) => {
        const close = () => {
          dismissPanel()
          onNavigate()
        }
        return (
          <>
            <NavigationHeading
              eyebrow="The fleet"
              title="A drive for every mood."
              href="/fleet"
              link="Explore the full fleet"
              close={close}
            />
            <div className="z-nav-fleet-layout">
              <section className="z-nav-fleet-categories" data-nav-reveal>
                <h3 className="z-kicker">
                  <T>Choose your style</T>
                </h3>
                {categories.map((category) => (
                  <Link
                    href={'/categories/' + categorySlug(category.name)}
                    key={category.name}
                    onPointerEnter={(event) => {
                      if (event.pointerType !== 'touch') setActiveCategory(category.name)
                    }}
                    onFocus={() => setActiveCategory(category.name)}
                    data-preview-active={activeCategory === category.name}
                    onClick={close}
                    aria-current={
                      pathname === '/categories/' + categorySlug(category.name) ? 'page' : undefined
                    }
                  >
                    <T>{category.name}</T>
                    <span>
                      {category.count}
                      <Icon name="arrow" size={14} />
                    </span>
                  </Link>
                ))}
              </section>
              <section className="z-nav-fleet-models" data-nav-reveal>
                <div className="z-nav-list-heading">
                  <h3 className="z-kicker">
                    <T>{activeCategory || 'Find your next drive'}</T>
                  </h3>
                  <span>
                    {previewCars.length} <T>vehicles</T>
                  </span>
                </div>
                <div
                  className="z-nav-car-grid"
                  ref={modelGrid}
                  aria-label={activeCategory + ' rental cars'}
                >
                  {[...previewCars]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((car) => (
                      <Link
                        href={car.href}
                        key={car.id}
                        prefetch={false}
                        onClick={close}
                        aria-current={pathname === car.href ? 'page' : undefined}
                      >
                        <span className="z-nav-car-photo">
                          <Image src={car.thumbnail} alt="" fill sizes="76px" />
                        </span>
                        <span>
                          <strong>
                            <T>{car.name}</T>
                          </strong>
                          <small>
                            <Price amount={car.price} /> / <T>day</T>
                          </small>
                        </span>
                        <Icon name="arrow" size={14} />
                      </Link>
                    ))}
                </div>
              </section>
            </div>
            <div className="z-nav-panel-foot">
              <span className="z-nav-foot-dot" />
              <T>Explore models, colours and listed rental rates.</T>
            </div>
          </>
        )
      }}
    </NavigationDropdown>
  )
}
