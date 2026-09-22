export const metadata = {
  title: 'Privacy',
  description:
    'How Zavi uses reservation details, browser storage and administrator cookies, and how to request a correction or removal of your details.',
  alternates: { canonical: '/privacy' },
}
export default function Page() {
  return (
    <div className="container-lux z-section" style={{ maxWidth: 850 }}>
      <p className="z-kicker">
        <T>Zavi</T>
      </p>
      <h1 className="font-display display-lg" style={{ margin: '20px 0 35px' }}>
        <T>Privacy notice</T>
      </h1>
      <div className="z-note" style={{ fontSize: 14 }}>
        <p style={{ marginBottom: 20 }}>
          <T>
            Partnership applications store your name, email, phone number, application type, contact
            consent and submission date. Car consignment applications also store vehicle
            specifications, location, ownership, finance, condition, insurance and availability.
            Agency applications store business and trade licence details, fleet profile, service
            areas, partnership preferences and the contact channel you choose. The Zavi team uses
            these details to assess your application and discuss terms. They are available only to
            authorised administrators. Contact the team to request correction or removal.
          </T>
        </p>
        <p>
          <T>
            When you send a reservation request, Zavi stores the vehicle, dates, delivery location,
            name, email, phone number and notes you provide. The team uses these details to review
            and manage your rental request. Contact details entered in the first step are kept in
            memory while you complete the form; they are not added to URLs or browser storage.
          </T>
        </p>
        <p style={{ marginTop: 20 }}>
          <T>
            This site uses no advertising trackers or third-party analytics. Vehicle photos and
            fonts are served by this site.
          </T>
        </p>
        <p style={{ marginTop: 20 }}>
          <T>
            Administrator sign-in uses an essential, HTTP-only session cookie. Customer details are
            accessible only through the authenticated fleet management area. You may attach your
            driving licence, passport or Emirates ID in the reservation document field. Attachments
            are encrypted in storage and can be downloaded only by authorised staff. Access expires
            after 30 days, and expired attachments are removed on the next reservation or staff
            document request. Staff can delete them earlier. Do not submit payment card details.
          </T>
        </p>
        <p style={{ marginTop: 20 }}>
          <T>
            You can ask the Zavi team to correct or remove your reservation details using the
            contact channel agreed during your rental enquiry.
          </T>
        </p>
      </div>
    </div>
  )
}

import { T } from '@/components/RegionalProvider'
