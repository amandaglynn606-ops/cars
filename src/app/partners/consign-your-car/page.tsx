import PartnerLanding from '@/components/PartnerLanding'
export const metadata = {
  title: 'Consign your car with Zavi',
  description:
    'Apply to consign your car with Zavi. Share your vehicle details and discuss rental potential, management and consignment terms.',
  alternates: { canonical: '/partners/consign-your-car' },
}
export default function Page() {
  return <PartnerLanding type="consignment" />
}
