import Link from 'next/link'
import { getAllCars } from '@/lib/fleet'
import { hasWhatsapp } from '@/lib/config'
import ContactActions from '@/components/ContactActions'
import Icon from '@/components/Icon'
import { deliveryLocations } from '@/lib/delivery'
export const metadata = {
  title: 'Contact Zavi',
  description:
    'Send Zavi your preferred vehicle, rental dates and delivery location. Availability and delivery charges are confirmed with your quote.',
  alternates: { canonical: '/contact' },
}
export default function Page() {
  const locations = [...new Set(getAllCars().flatMap(deliveryLocations))]
  return (
    <div className="container-lux">
      <header className="z-page-hero">
        <p className="z-kicker">
          <T>Contact Zavi</T>
        </p>
        <h1>
          <T>Ask about a rental</T>
        </h1>
        <p className="z-lead">
          <T>Send your preferred car, dates and delivery location.</T>
        </p>
      </header>
      <section className="z-section z-book-grid">
        <div>
          <h2 className="font-display display-md" style={{ marginBottom: 25 }}>
            <T>Request availability and a quote</T>
          </h2>
          <p className="z-note" style={{ fontSize: 14, marginBottom: 30 }}>
            <T>
              Share your preferred vehicle and dates through our reservation form. The Zavi team
              will review your request and get in touch using the contact details you provide.
            </T>
          </p>
          <Link href="/book" className="z-button">
            <T>Send a rental request</T>
            <Icon name="arrow" />
          </Link>
          {hasWhatsapp() && (
            <div style={{ marginTop: 30 }}>
              <ContactActions />
            </div>
          )}
        </div>
        <div>
          <p className="z-kicker" style={{ marginBottom: 20 }}>
            <T>Delivery locations</T>
          </p>
          {locations.map((l) => (
            <div
              key={l}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 15,
                padding: '17px 0',
                borderBottom: '1px solid var(--z-line)',
                fontSize: 14,
              }}
            >
              <Icon name="pin" size={17} />
              <T>{l}</T>
            </div>
          ))}
          <p className="z-note" style={{ marginTop: 20 }}>
            <T>
              Location options vary by vehicle. Delivery arrangements and any charges are confirmed
              with your final quote.
            </T>
          </p>
        </div>
      </section>
    </div>
  )
}

import { T } from '@/components/RegionalProvider'
