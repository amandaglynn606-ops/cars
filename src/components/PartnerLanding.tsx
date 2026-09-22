import Link from 'next/link'
import PartnershipForm from './PartnershipForm'
import EnquiryFallback from './EnquiryFallback'
import { siteConfig } from '@/lib/config'
import PartnerMotion from './PartnerMotion'
import Icon from './Icon'
import { T } from './RegionalProvider'
import type { PartnershipType } from '@/lib/partnership'
import '@/app/partners/partners.css'

const content = {
  consignment: {
    eyebrow: 'Vehicle consignment',
    title: 'Let your car do more.',
    intro:
      'Consign your car with Zavi and explore its rental potential. Start with your vehicle details; we will discuss suitability, how it could be managed and the terms that work for you.',
    cta: 'Submit your car',
    points: [
      'For private owners and authorised representatives',
      'Vehicle review before any commitment',
      'Management and commercial terms agreed with you',
    ],
    steps: [
      [
        'Introduce your car',
        'Share the model, mileage, condition and when it is available. No documents are needed for this first application.',
      ],
      [
        'Review the opportunity',
        'We discuss suitability, rental pricing, insurance requirements, maintenance, handovers and your expectations.',
      ],
      [
        'Agree, then get started',
        'If there is a fit, review the consignment agreement, required documents and payment arrangements before any listing or rental.',
      ],
    ],
    faqs: [
      [
        'Can I apply for one car?',
        'Yes. This application is for an individual vehicle. If you own several cars, mention them in the notes and we can discuss them together.',
      ],
      [
        'How much could my car earn?',
        'Rental potential depends on the model, condition, availability and customer demand. Pricing, fees and payment arrangements are discussed after review; there is no guaranteed income.',
      ],
      [
        'What if my car is financed or leased?',
        'Tell us its current status. Any lender or lessor permissions and rental insurance requirements must be reviewed before the car can be accepted.',
      ],
      [
        'Who handles insurance, maintenance and damage?',
        'These responsibilities, along with vehicle custody, permitted use and claims handling, must be agreed in the consignment terms before the car is made available.',
      ],
      [
        'Can I still use my car?',
        'Tell us the period you can make it available. Personal use, notice periods and ending the arrangement need to be agreed before you consign it.',
      ],
    ],
    asideTitle: 'A considered start.',
    aside:
      'Your car is a valuable asset. This application helps us start the right conversation about its care, availability and rental potential.',
    other: 'Represent a rental agency?',
    otherLabel: 'Explore agency partnerships',
    otherHref: '/partners/rental-agencies',
  },
  business: {
    eyebrow: 'Monthly subscriptions for rental agencies',
    title: 'Display your cars. Pay monthly.',
    intro:
      'Apply for a monthly subscription to display your approved rental cars on Zavi. Share your agency and fleet details below; we will confirm the subscription fee and listing terms before activation.',
    cta: 'Apply for a subscription',
    points: [],
    steps: [],
    faqs: [
      [
        'What does the monthly subscription cover?',
        'The subscription is for displaying approved cars on Zavi. We confirm the fee, number of listings, billing cycle and renewal or cancellation terms before you subscribe.',
      ],
      [
        'What will you need to publish our cars?',
        'Accurate vehicle details, rental rates, availability and photographs you have permission to use. Your agency remains responsible for keeping its information current.',
      ],
      [
        'Can we ask about rental leads?',
        'Yes. Choose rental leads in the form if that is your priority. Lead handover and any separate charges are agreed with your agency; bookings and enquiry volumes are not guaranteed.',
      ],
    ],
    asideTitle: '',
    aside: '',
    other: 'Applying for your own car?',
    otherLabel: 'Explore car consignment',
    otherHref: '/partners/consign-your-car',
  },
} as const
export default function PartnerLanding({ type }: { type: PartnershipType }) {
  const c = content[type]
  return (
    <PartnerMotion className="container-lux z-section z-partner-landing">
      <header className="z-partner-hero">
        <p className="z-kicker">
          <T>{c.eyebrow}</T>
        </p>
        <h1>
          <T>{c.title}</T>
        </h1>
        <p className="z-partner-hero-intro">
          <T>{c.intro}</T>
        </p>
        {type === 'consignment' && (
          <>
            {' '}
            <a href="#apply" className="z-button">
              <T>{c.cta}</T>
              <Icon name="arrow" />
            </a>
            <ul>
              {c.points.map((point) => (
                <li key={point}>
                  <Icon name="check" size={16} />
                  <T>{point}</T>
                </li>
              ))}
            </ul>
          </>
        )}
      </header>
      <section
        id="apply"
        className={
          'z-partner-application' + (type === 'business' ? ' z-partner-application-first' : '')
        }
        aria-label={
          type === 'consignment' ? 'Car consignment application' : 'Rental agency application'
        }
      >
        {type === 'consignment' && (
          <aside>
            <p className="z-kicker">
              <T>Start your application</T>
            </p>
            <h2>
              <T>{c.asideTitle}</T>
            </h2>
            <p>
              <T>{c.aside}</T>
            </p>
            <div className="z-partner-switch">
              <p>
                <T>{c.other}</T>
              </p>
              <Link href={c.otherHref} className="z-text-link">
                <T>{c.otherLabel}</T>
                <Icon name="arrow" size={16} />
              </Link>
            </div>
          </aside>
        )}
        {process.env.VERCEL === '1' ? (
          <EnquiryFallback
            href={
              'https://wa.me/' +
              siteConfig.whatsappNumber +
              '?text=' +
              encodeURIComponent(
                type === 'consignment'
                  ? 'Hello Zavi, I would like to discuss consigning my car.'
                  : 'Hello Zavi, I would like to discuss an agency partnership.',
              )
            }
          />
        ) : (
          <PartnershipForm key={type} initialType={type} />
        )}
      </section>
      {type === 'consignment' && (
        <>
          {' '}
          <section className="z-partner-process" aria-labelledby="process-heading">
            <p className="z-kicker">
              <T>A clear path forward</T>
            </p>
            <h2 id="process-heading">
              <T>How it works</T>
            </h2>
            <ol>
              {c.steps.map(([title, description], index) => (
                <li key={title}>
                  <span>0{index + 1}</span>
                  <h3>
                    <T>{title}</T>
                  </h3>
                  <p>
                    <T>{description}</T>
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
      <section className="z-partner-faq" aria-labelledby="partner-faq-heading">
        <p className="z-kicker">
          <T>Before you apply</T>
        </p>
        <h2 id="partner-faq-heading">
          <T>A few things to know.</T>
        </h2>
        {c.faqs.map(([question, answer]) => (
          <details key={question}>
            <summary>
              <T>{question}</T>
            </summary>
            <p>
              <T>{answer}</T>
            </p>
          </details>
        ))}
      </section>
      {type === 'business' && (
        <p className="z-partner-hub-note">
          <T>{c.other}</T>{' '}
          <Link href={c.otherHref} className="z-text-link">
            <T>{c.otherLabel}</T>
          </Link>
        </p>
      )}
    </PartnerMotion>
  )
}
