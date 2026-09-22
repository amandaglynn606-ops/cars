import VehicleDetail, { vehicleMetadata, type VehicleDetailProps } from '@/components/VehicleDetail'
export const generateMetadata = (props: VehicleDetailProps) => vehicleMetadata(props, true)
export default function Page(props: VehicleDetailProps) {
  return <VehicleDetail {...props} monthlyPage />
}
