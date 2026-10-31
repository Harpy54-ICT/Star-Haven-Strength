import { requireAdmin } from '@/lib/auth/guards'
import { CalendarClock } from 'lucide-react'
import BookingsManager from '@/components/admin/BookingsManager'

export const dynamic = 'force-dynamic'

export default async function AdminBookingsPage() {
  await requireAdmin()
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-3">
        <CalendarClock className="text-gold" size={28} />
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal">
          Bookings
        </h1>
      </div>
      <BookingsManager />
    </div>
  )
}
