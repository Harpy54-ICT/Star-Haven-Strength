import Link from 'next/link'
import { Plus, ClipboardList } from 'lucide-react'
import { requireAdmin } from '@/lib/auth/guards'
import { db } from '@/lib/db/client'

export const dynamic = 'force-dynamic'

function clientName(u: {
  firstName: string | null
  lastName: string | null
  email: string
}): string {
  return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email
}

export default async function AdminWorkoutPlansPage() {
  await requireAdmin()

  const plans = await db.workoutPlan.findMany({
    orderBy: [{ isActive: 'desc' }, { assignedAt: 'desc' }],
    select: {
      id: true,
      title: true,
      weeks: true,
      isActive: true,
      assignedAt: true,
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  })

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="text-green" size={24} />
            <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-green">
              Workout Plans
            </h1>
          </div>
          <Link
            href="/dashboard/admin/workout-plans/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-4 py-2 font-display text-sm font-bold uppercase tracking-wide text-charcoal hover:bg-gold-dark"
          >
            <Plus size={16} /> Create New Plan
          </Link>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-grey-mid bg-white">
          {plans.length === 0 ? (
            <p className="p-8 text-center font-body text-sm text-grey-dark">
              No workout plans yet. Create one to assign it to a client.
            </p>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-grey-mid bg-grey-light">
                <tr>
                  <th className="px-4 py-3 font-display text-xs font-bold uppercase tracking-wide text-grey-dark">
                    Client
                  </th>
                  <th className="px-4 py-3 font-display text-xs font-bold uppercase tracking-wide text-grey-dark">
                    Plan
                  </th>
                  <th className="px-4 py-3 font-display text-xs font-bold uppercase tracking-wide text-grey-dark">
                    Weeks
                  </th>
                  <th className="px-4 py-3 font-display text-xs font-bold uppercase tracking-wide text-grey-dark">
                    Status
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-grey-mid/60 last:border-0 hover:bg-grey-light/50"
                  >
                    <td className="px-4 py-3 font-body text-sm text-charcoal">
                      {clientName(p.user)}
                    </td>
                    <td className="px-4 py-3 font-body text-sm font-semibold text-charcoal">
                      {p.title}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-grey-dark">
                      {p.weeks}
                    </td>
                    <td className="px-4 py-3">
                      {p.isActive ? (
                        <span className="rounded-full bg-green/10 px-2.5 py-0.5 font-display text-[10px] font-bold uppercase tracking-wide text-green">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-grey-mid/30 px-2.5 py-0.5 font-display text-[10px] font-bold uppercase tracking-wide text-grey-dark">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/admin/workout-plans/${p.id}`}
                        className="font-display text-xs font-bold uppercase tracking-wide text-gold-dark hover:underline"
                      >
                        View / Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
