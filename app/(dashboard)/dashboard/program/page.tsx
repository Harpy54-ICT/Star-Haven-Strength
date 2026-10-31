import Link from 'next/link'
import { requireAuth } from '@/lib/auth/guards'
import { db } from '@/lib/db/client'
import { ClipboardList, Calendar, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

function statusLabel(status: string): string {
  if (status === 'assigned') return 'Assigned by coach'
  if (status === 'active') return 'Active'
  if (status === 'waitlisted') return 'Waitlisted'
  return status
}

export default async function MyProgramPage() {
  const session = await requireAuth()

  const enrollments = await db.cohortEnrollment.findMany({
    where: {
      userId: session.user.id,
      status: { in: ['assigned', 'active'] },
    },
    orderBy: { enrolledAt: 'desc' },
    include: {
      cohort: {
        select: {
          id: true,
          name: true,
          description: true,
          durationWeeks: true,
          startDate: true,
          status: true,
        },
      },
    },
  })

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-3">
        <ClipboardList className="text-gold" size={28} />
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal">
          My Program
        </h1>
      </div>

      {enrollments.length === 0 ? (
        <>
          <p className="max-w-2xl font-body text-grey-dark">
            Your coach hasn&apos;t assigned a program yet. Once you&apos;ve had
            your first session, your personalized program will appear here. In
            the meantime, you can browse open cohort programs and join one.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard/cohorts"
              className="inline-flex items-center gap-2 rounded-lg bg-green px-5 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-green-light"
            >
              <Users size={18} />
              Browse Cohorts
            </Link>
            <Link
              href="/dashboard/schedule"
              className="inline-flex items-center gap-2 rounded-lg border border-grey-mid px-5 py-3 font-body text-sm font-semibold text-charcoal transition-colors hover:bg-grey-light"
            >
              <Calendar size={18} />
              Book Your First Session
            </Link>
          </div>
        </>
      ) : (
        <div className="grid max-w-3xl gap-5">
          {enrollments.map((e) => (
            <div
              key={e.id}
              className="rounded-xl border-2 border-gold bg-white p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-display text-lg font-bold text-charcoal">
                  {e.cohort.name}
                </h2>
                <span className="shrink-0 rounded-full bg-green/10 px-3 py-1 font-display text-[10px] font-bold uppercase tracking-wide text-green">
                  {statusLabel(e.status)}
                </span>
              </div>
              {e.cohort.description && (
                <p className="mt-2 font-body text-sm text-grey-dark">
                  {e.cohort.description}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-4 font-mono text-xs text-grey-dark">
                <span>{e.cohort.durationWeeks} weeks</span>
                {e.cohort.startDate && (
                  <span>
                    Starts{' '}
                    {new Date(e.cohort.startDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="mt-5">
                <Link
                  href={`/dashboard/cohorts/${e.cohort.id}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-green px-4 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-green-light"
                >
                  Open Program &amp; Discussion
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
