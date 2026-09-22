import { isAdmin } from '@/lib/auth'
import { allVehicles } from '@/lib/db'
import { allReservations } from '@/lib/reservation-store'
import AdminPanel, { AdminLogin } from '@/components/AdminPanel'
export const metadata = { title: 'Fleet Management', robots: { index: false, follow: false } }
export default async function Page() {
  if (!(await isAdmin()))
    return (
      <div className="container-lux">
        <AdminLogin />
      </div>
    )
  return (
    <AdminPanel initialCars={allVehicles(true)} initialReservations={await allReservations()} />
  )
}
