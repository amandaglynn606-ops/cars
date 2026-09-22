import Link from 'next/link'
import { isAdmin } from '@/lib/auth'
import { allPartnerships } from '@/lib/db'
import { partnershipFields } from '@/lib/partnership'
import '@/app/partners/partners.css'
import { AdminLogin } from '@/components/AdminPanel'
export const metadata = { title: 'Partnership enquiries', robots: { index: false, follow: false } }
export default async function Page() {
  if (!(await isAdmin()))
    return (
      <div className="container-lux">
        <AdminLogin />
      </div>
    )
  const enquiries = allPartnerships()
  return (
    <div className="container-lux z-section">
      <Link href="/admin" className="z-text-link">
        Back to fleet management
      </Link>
      <h1 className="font-display display-md" style={{ marginBlock: 30 }}>
        Partnership enquiries
      </h1>
      <p className="z-note">
        Latest 500 enquiries. Contact details are visible only to administrators.
      </p>
      {!enquiries.length && <p style={{ marginBlock: 30 }}>No partnership enquiries yet.</p>}
      {enquiries.map((item) => (
        <article
          key={item.id}
          style={{
            paddingBlock: 28,
            borderBottom: '1px solid var(--z-line)',
            overflowWrap: 'anywhere',
          }}
        >
          <p className="z-kicker">
            {item.type === 'consignment' ? 'Car consignment' : 'Rental agency partnership'} ·{' '}
            {new Date(item.createdAt).toLocaleString('en-GB', { timeZone: 'Asia/Dubai' })} Dubai
          </p>
          <h2 style={{ fontSize: 24, marginBlock: 16 }}>{item.name}</h2>
          <p>
            {item.email} · {item.phone}
          </p>
          <p style={{ whiteSpace: 'pre-wrap', marginBlock: 16 }}>{item.details}</p>
          {item.application && (
            <dl className="z-partner-admin-details">
              {partnershipFields[item.type].map((field) => (
                <div key={field.name}>
                  <dt>{field.label}</dt>
                  <dd>{item.application?.[field.name] || 'Not provided'}</dd>
                </div>
              ))}
            </dl>
          )}
          {item.consentVersion && (
            <p className="z-note">Contact and assessment consent recorded with this application.</p>
          )}
          <small>Reference: {item.id}</small>
        </article>
      ))}
    </div>
  )
}
