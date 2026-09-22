import VehicleDetail, { vehicleMetadata, type VehicleDetailProps } from '@/components/VehicleDetail'
export const generateMetadata = (props: VehicleDetailProps) => vehicleMetadata(props)
export default function Page(props: VehicleDetailProps) {
  return <VehicleDetail {...props} />
}
