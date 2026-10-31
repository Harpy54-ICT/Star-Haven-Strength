import { requireAdmin } from '@/lib/auth/guards'
import { ClipboardCheck } from 'lucide-react'
import CheckInReview from '@/components/admin/CheckInReview'

export const dynamic = 'force-dynamic'

export default async function AdminCheckInsPage() {
  await requireAdmin()
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-3">
        <ClipboardCheck className="text-gold" size={28} />
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal">
          Client Check-Ins
        </h1>
      </div>
      <CheckInReview />
    </div>
  )
}
