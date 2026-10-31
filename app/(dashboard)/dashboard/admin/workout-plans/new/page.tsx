import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { requireAdmin } from '@/lib/auth/guards'
import { db } from '@/lib/db/client'
import WorkoutPlanBuilder from '@/components/admin/WorkoutPlanBuilder'

export const dynamic = 'force-dynamic'

export default async function NewWorkoutPlanPage() {
  await requireAdmin()

  const users = await db.user.findMany({
    where: { role: 'client' },
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }, { email: 'asc' }],
    select: { id: true, firstName: true, lastName: true, email: true },
  })
  const clients = users.map((u) => ({
    id: u.id,
    name: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email,
    email: u.email,
  }))

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard/admin/workout-plans"
          className="inline-flex items-center gap-1 font-body text-sm text-grey-dark hover:text-green"
        >
          <ChevronLeft size={16} /> Back to Workout Plans
        </Link>
        <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-wide text-green">
          Create Workout Plan
        </h1>
        <p className="mt-1 font-body text-sm text-grey-dark">
          Build a plan and assign it to a client.
        </p>

        <div className="mt-6">
          <WorkoutPlanBuilder mode="create" clients={clients} />
        </div>
      </div>
    </div>
  )
}
