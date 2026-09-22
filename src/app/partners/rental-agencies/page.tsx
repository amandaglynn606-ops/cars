import PartnerLanding from '@/components/PartnerLanding'
export const metadata = {
  title: 'Monthly Car Listing Subscriptions for Rental Agencies',
  description:
    'Apply for a monthly subscription to display your rental cars on Zavi. Submit your agency and fleet details to discuss fees, listing approval and subscription terms.',
  alternates: { canonical: '/partners/rental-agencies' },
}
export default function Page() {
  return <PartnerLanding type="business" />
}
