import { redirect } from 'next/navigation'
import PartnerPaths from '@/components/PartnerPaths'
import PartnerMotion from '@/components/PartnerMotion'
import { T } from '@/components/RegionalProvider'
import './partners.css'
export const metadata = {
  title: 'Earn with Zavi | Car consignment & rental agency partnerships',
  description:
    'Consign your own car or apply for a monthly subscription to display your rental agency fleet on Zavi.',
  alternates: { canonical: '/partners' },
}
export default async function Page({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams
  if (type === 'consignment') redirect('/partners/consign-your-car')
  if (type === 'business') redirect('/partners/rental-agencies')
  return (
    <PartnerMotion className="container-lux z-section z-partner-hub">
      <header className="z-partner-hero">
        <p className="z-kicker">
          <T>The Zavi partner programme</T>
        </p>
        <h1>
          <T>Earn with us.</T>
        </h1>
        <p className="z-partner-hero-intro">
          <T>
            A car to consign or a rental fleet to promote. Find the right way to partner with Zavi.
          </T>
        </p>
      </header>
      <PartnerPaths />
      <p className="z-partner-hub-note">
        <T>
          Every application is reviewed individually. Listings and commercial terms are agreed
          before activation.
        </T>
      </p>
    </PartnerMotion>
  )
}
