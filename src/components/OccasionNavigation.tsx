'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Icon from './Icon'
import { T } from './RegionalProvider'
import NavigationDropdown from './NavigationDropdown'
import NavigationHeading from './NavigationHeading'
export type OccasionLink = { slug: string; name: string; group: string }
export default function OccasionNavigation({
  occasions,
  mobile = false,
  onNavigate,
  onOpen,
  dismiss = false,
}: {
  occasions: OccasionLink[]
  mobile?: boolean
  onNavigate: () => void
  onOpen?: () => void
  dismiss?: boolean
}) {
  const pathname = usePathname()
  return (
    <NavigationDropdown label="Occasions" mobile={mobile} dismiss={dismiss} onOpen={onOpen}>
      {(dismissPanel) => {
        const close = () => {
          dismissPanel()
          onNavigate()
        }
        return (
          <>
            <NavigationHeading
              eyebrow="Occasions"
              title="Make it an occasion."
              href="/occasions"
              link="View all occasions"
              close={close}
            />
            <div className="z-nav-occasion-groups">
              {[...new Set(occasions.map((item) => item.group))].map((group, index) => (
                <section key={group} data-nav-reveal>
                  <div className="z-nav-group-heading">
                    <span className="z-nav-group-icon">
                      <Icon
                        name={
                          index === 0
                            ? 'heart'
                            : index === 1
                              ? 'calendar'
                              : index === 2
                                ? 'grid'
                                : 'arrow'
                        }
                        size={21}
                      />
                    </span>
                    <h3>
                      <T>{group}</T>
                    </h3>
                  </div>
                  {occasions
                    .filter((item) => item.group === group)
                    .map((item) => (
                      <Link
                        href={'/occasions/' + item.slug}
                        key={item.slug}
                        prefetch={false}
                        onClick={close}
                        aria-current={pathname === '/occasions/' + item.slug ? 'page' : undefined}
                      >
                        <T>{item.name}</T>
                        <Icon name="arrow" size={14} />
                      </Link>
                    ))}
                </section>
              ))}
            </div>
            <div className="z-nav-panel-foot">
              <span className="z-nav-foot-dot" />
              <T>From an evening for two to your next big milestone.</T>
            </div>
          </>
        )
      }}
    </NavigationDropdown>
  )
}
