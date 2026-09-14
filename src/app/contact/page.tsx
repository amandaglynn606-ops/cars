import type { Metadata } from 'next'
import Link from 'next/link'
import Reveal from '@/components/Reveal'
import ContactActions from '@/components/ContactActions'
import { siteConfig } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Reach our Dubai team on WhatsApp for availability, pricing and delivery anywhere in the Emirates.',
}

export default function ContactPage() {
  return (
    <div className="container-lux pt-36 pb-24 md:pt-44">
      <header className="mb-16 max-w-2xl">
        <p className="eyebrow mb-4">Get in touch</p>
        <h1 className="font-display text-[clamp(2.5rem,7vw,5rem)] leading-[0.98]">Contact</h1>
        <p className="mt-5 leading-relaxed text-muted">
          WhatsApp is the fastest way to reach us &mdash; most enquiries are answered within a few
          minutes, day or night.
        </p>
      </header>

      <div className="grid gap-14 lg:grid-cols-2">
        <Reveal>
          <ContactActions />
        </Reveal>

        <Reveal className="space-y-10">
          <div>
            <p className="eyebrow mb-4">Delivery areas</p>
            <ul className="space-y-2.5 text-sm text-bone/75">
              {siteConfig.locations.map((location) => (
                <li key={location} className="hairline pt-2.5">
                  {location}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted">
              Delivery inside Dubai is complimentary. Other emirates available on request.
            </p>
          </div>

          <div>
            <p className="eyebrow mb-4">Opening hours</p>
            <dl className="space-y-2.5 text-sm">
              <div className="hairline flex justify-between pt-2.5">
                <dt className="text-muted">Monday &ndash; Sunday</dt>
                <dd>8:00 &ndash; 23:00</dd>
              </div>
              <div className="hairline flex justify-between pt-2.5">
                <dt className="text-muted">WhatsApp enquiries</dt>
                <dd>24 hours</dd>
              </div>
            </dl>
          </div>

          <div>
            <p className="eyebrow mb-4">Prefer to browse first?</p>
            <Link
              href="/fleet"
              className="inline-block rounded-full border border-white/20 px-8 py-3.5 text-xs tracking-[0.16em] uppercase transition-colors duration-300 hover:border-gold-500 hover:text-gold-500"
            >
              View the fleet
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
