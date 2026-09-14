import type { Metadata } from 'next'
import Link from 'next/link'
import Reveal from '@/components/Reveal'
import { siteConfig } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Daily and monthly supercar hire, chauffeur service, airport delivery, wedding and photoshoot cars across Dubai.',
}

const SERVICES = [
  {
    title: 'Daily hire',
    body: 'A weekend in a supercar, or a week in something more comfortable. Minimum one day, delivered wherever you are.',
  },
  {
    title: 'Monthly leasing',
    body: 'Long-stay rates with servicing and registration handled for you. The most cost-effective way to keep a car in Dubai.',
  },
  {
    title: 'Airport delivery',
    body: 'Your car waiting at DXB or DWC when you land. Send us your flight number and we track it.',
  },
  {
    title: 'Chauffeur service',
    body: 'A professional driver for business travel, events or a night out, charged by the hour or the day.',
  },
  {
    title: 'Weddings & events',
    body: 'Matched pairs, specific colours and decorated vehicles arranged in advance for your date.',
  },
  {
    title: 'Photo & film shoots',
    body: 'Cars supplied on location for commercial shoots, with permits and a handler where required.',
  },
]

const FAQS = [
  {
    q: 'What do I need to rent a car?',
    a: 'A passport, a valid driving licence and a credit card in the driver’s name. Visitors need an international driving permit alongside their home licence; UAE residents need a UAE licence.',
  },
  {
    q: 'How old do I have to be?',
    a: 'Drivers must be at least 21 for standard vehicles and 25 for supercars. Some models carry a higher minimum, which we confirm when you enquire.',
  },
  {
    q: 'Is there a security deposit?',
    a: 'Yes — a refundable deposit is held on your credit card at handover, not on this website. The amount depends on the vehicle and is confirmed before delivery.',
  },
  {
    q: 'What mileage is included?',
    a: 'Daily rentals typically include 250 km per day and monthly rentals 4,000 km per month. Additional kilometres are charged at a per-kilometre rate quoted up front.',
  },
  {
    q: 'Do you deliver outside Dubai?',
    a: 'Delivery inside Dubai is complimentary. Abu Dhabi, Sharjah and the northern emirates are available for an additional fee.',
  },
  {
    q: 'Can I pay online?',
    a: 'No. We take no payment through this website. Every booking is confirmed over WhatsApp and settled directly with our team.',
  },
]

export default function ServicesPage() {
  return (
    <div className="container-lux pt-36 pb-24 md:pt-44">
      <header className="mb-16 max-w-2xl">
        <p className="eyebrow mb-4">What we do</p>
        <h1 className="font-display text-[clamp(2.5rem,7vw,5rem)] leading-[0.98]">Services</h1>
        <p className="mt-5 leading-relaxed text-muted">
          Beyond self-drive hire, we arrange chauffeurs, events and long-term leases across
          {' '}{siteConfig.locations.slice(0, 3).join(', ')} and the wider Emirates.
        </p>
      </header>

      <Reveal stagger className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service) => (
          <div key={service.title} className="hairline pt-6">
            <h2 className="font-display text-2xl">{service.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{service.body}</p>
          </div>
        ))}
      </Reveal>

      <section className="mt-28">
        <Reveal className="mb-12 max-w-2xl">
          <p className="eyebrow mb-4">Good to know</p>
          <h2 className="font-display text-[clamp(2rem,5vw,3.25rem)] leading-[1.02]">
            Frequently asked
          </h2>
        </Reveal>

        <Reveal stagger className="mx-auto max-w-3xl divide-y divide-white/10 border-y border-white/10">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6">
                <span className="font-display text-lg transition-colors group-open:text-gold-500">
                  {faq.q}
                </span>
                <span className="text-gold-500 transition-transform duration-300 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">{faq.a}</p>
            </details>
          ))}
        </Reveal>
      </section>

      <Reveal className="mt-24 text-center">
        <Link
          href="/book"
          className="inline-block rounded-full bg-gold-500 px-10 py-4 text-xs tracking-[0.18em] uppercase text-ink-950 transition-transform duration-300 hover:scale-[1.03]"
        >
          Enquire now
        </Link>
      </Reveal>
    </div>
  )
}
