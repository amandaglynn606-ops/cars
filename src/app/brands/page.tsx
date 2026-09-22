import DirectoryPage from '@/components/DirectoryPage'
export const metadata = {
  title: 'Rental Car Brands',
  description:
    'Browse the brands listed in the Zavi fleet. Choose a brand to review models, photos and daily rental rates in Dubai.',
  alternates: { canonical: '/brands' },
}
export default function Page() {
  return <DirectoryPage type="brand" />
}
