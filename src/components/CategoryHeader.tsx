import Image from 'next/image'
import type { ReactNode } from 'react'
import { formatPrice } from '@/lib/format'

/** Banner shared by the marque and body-type category pages. */
export default function CategoryHeader({
  eyebrow,
  title,
  count,
  image,
  bounds,
  breadcrumb,
}: {
  eyebrow: string
  title: string
  count: number
  image?: string
  bounds: { min: number; max: number } | null
  breadcrumb: ReactNode
}) {
  return (
    <header className="relative">
      {image && (
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <Image src={image} alt="" fill priority sizes="100vw" className="object-cover" />
          {/* Only the lower band is scrimmed, so the car stays visible. */}
          <div className="absolute inset-0 bg-ink-950/45" />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink-950 to-transparent" />
        </div>
      )}

      <div className={`container-lux ${image ? 'pt-16 pb-14' : 'pt-8'}`}>
        <nav className="mb-7 flex items-center gap-2 text-xs text-muted">{breadcrumb}</nav>

        <p className="eyebrow mb-5">{eyebrow}</p>
        <h1 className="font-display display-lg">{title}</h1>

        <div className="mt-7 flex flex-wrap items-center gap-x-10 gap-y-3 text-sm">
          <span className="text-bone/80">
            {count} {count === 1 ? 'vehicle' : 'vehicles'}
          </span>
          {bounds && (
            <span className="text-muted">
              From <span className="text-bone">{formatPrice(bounds.min)}</span> / day
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
