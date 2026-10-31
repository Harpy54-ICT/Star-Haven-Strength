import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { requireAdmin } from '@/lib/auth/guards'
import { db } from '@/lib/db/client'
import { parsePlanDays } from '@/lib/workout-plans/types'
import WorkoutPlanBuilder from '@/components/admin/WorkoutPlanBuilder'
import WorkoutPlanActions from '@/components/admin/WorkoutPlanActions'

export const dynamic = 'force-dynamic'

export default async function EditWorkoutPlanPage({
  params,
}: {
  params: { id: string }
}) {
  await requireAdmin()

  const plan = await db.workoutPlan.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  })
  if (!plan) notFound()

  const clientName =
    [plan.user.firstName, plan.user.lastName].filter(Boolean).join(' ') ||
    plan.user.email

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard/admin/workout-plans"
          className="inline-flex items-center gap-1 font-body text-sm text-grey-dark hover:text-green"
        >
          <ChevronLeft size={16} /> Back to Workout Plans
        </Link>

        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-green">
              {plan.title}
            </h1>
            <p className="mt-1 font-body text-sm text-grey-dark">
              Assigned to{' '}
              <span className="font-semibold text-charcoal">{clientName}</span> ·{' '}
              {plan.weeks} weeks ·{' '}
              {plan.isActive ? (
                <span className="font-semibold text-green">Active</span>
              ) : (
                <span className="text-grey-dark">Inactive</span>
              )}
            </p>
          </div>
          <WorkoutPlanActions planId={plan.id} isActive={plan.isActive} />
        </div>

        <div className="mt-6">
          <WorkoutPlanBuilder
            mode="edit"
            planId={plan.id}
            initial={{
              userId: plan.user.id,
              title: plan.title,
              description: plan.description ?? '',
              weeks: plan.weeks,
              days: parsePlanDays(plan.days),
              isActive: plan.isActive,
            }}
          />
        </div>
      </div>
    </div>
  )
}
