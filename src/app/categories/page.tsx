import DirectoryPage from '@/components/DirectoryPage'
export const metadata = {
  title: 'Rental Car Categories',
  description:
    'Browse Zavi rental cars by category, including SUVs, sports cars, saloons and convertibles. Compare listed vehicles and daily rates.',
  alternates: { canonical: '/categories' },
}
export default function Page() {
  return <DirectoryPage type="category" />
}
