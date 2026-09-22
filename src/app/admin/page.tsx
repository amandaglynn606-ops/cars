import { isAdmin } from '@/lib/auth'
import { allVehicles, allReservations } from '@/lib/db'
import AdminPanel, { AdminLogin } from '@/components/AdminPanel'
export const metadata = { title: 'Fleet Management', robots: { index: false, follow: false } }
export default async function Page() {
  if (!(await isAdmin()))
    return (
      <div className="container-lux">
        <AdminLogin />
      </div>
    )
  return <AdminPanel initialCars={allVehicles(true)} initialReservations={allReservations()} />
}
