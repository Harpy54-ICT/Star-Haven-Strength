import Link from 'next/link'
import { requireAuth } from '@/lib/auth/guards'
import { ClipboardList, Calendar } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MyProgramPage() {
  await requireAuth()

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-3">
        <ClipboardList className="text-gold" size={28} />
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal">
          My Program
        </h1>
      </div>

      <p className="max-w-2xl font-body text-grey-dark">
        Your coach will upload your personalized program here. Check back after
        your first session.
      </p>

      <div className="mt-6 max-w-2xl rounded-xl border-2 border-gold bg-white p-6">
        <h2 className="font-display text-lg font-bold text-charcoal">
          Week 1 of Your Journey
        </h2>
        <p className="mt-2 font-body text-grey-dark">
          Your program is being customized for you.
        </p>
      </div>

      <div className="mt-6">
        <Link
          href="/dashboard/schedule"
          className="inline-flex items-center gap-2 rounded-lg bg-green px-5 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-green-dark"
        >
          <Calendar size={18} />
          Book Your First Session
        </Link>
      </div>
    </div>
  )
}
