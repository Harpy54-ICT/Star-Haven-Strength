import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { requireAdmin } from '@/lib/auth/guards'
import { db } from '@/lib/db/client'
import ClientProfileTabs, {
  type ClientProfileData,
} from '@/components/admin/ClientProfileTabs'

export const dynamic = 'force-dynamic'

function countExercises(exercises: unknown): number {
  return Array.isArray(exercises) ? exercises.length : 0
}

export default async function AdminClientProfilePage({
  params,
}: {
  params: { userId: string }
}) {
  await requireAdmin()
  const { userId } = params

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      image: true,
      accountType: true,
      militaryBranch: true,
      militaryVerified: true,
      totalXP: true,
      createdAt: true,
    },
  })
  if (!user) notFound()

  const [
    workoutLogs,
    latestMetric,
    checkIns,
    subscription,
    newbieDesignation,
    sessionCount,
    referralCode,
    referralsMade,
  ] = await Promise.all([
    db.workoutLog.findMany({
      where: { userId },
      orderBy: { loggedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        durationMinutes: true,
        totalSets: true,
        exercises: true,
        loggedAt: true,
      },
    }),
    db.bodyMetric.findFirst({
      where: { userId },
      orderBy: { measuredAt: 'desc' },
      select: { weightKg: true, bodyFatPercentage: true, measuredAt: true },
    }),
    db.checkIn.findMany({
      where: { userId },
      orderBy: { weekStart: 'desc' },
      take: 3,
      select: {
        id: true,
        weekStart: true,
        mood: true,
        energy: true,
        stress: true,
        wentWell: true,
        challenging: true,
      },
    }),
    db.subscription.findFirst({
      where: { userId, status: { in: ['active', 'trialing', 'past_due'] } },
      orderBy: { createdAt: 'desc' },
      select: {
        tier: true,
        status: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
      },
    }),
    db.newbieDesignation.findUnique({
      where: { userId },
      select: { currentWeek: true, currentPhase: true, discountActive: true },
    }),
    db.booking.count({ where: { userId } }),
    db.referralCode.findUnique({
      where: { userId },
      select: { code: true },
    }),
    db.referral.count({ where: { referrerId: userId } }),
  ])

  const data: ClientProfileData = {
    user: {
      ...user,
      createdAt: user.createdAt.toISOString(),
    },
    workoutLogs: workoutLogs.map((w) => ({
      id: w.id,
      name: w.name,
      durationMinutes: w.durationMinutes,
      totalSets: w.totalSets,
      exerciseCount: countExercises(w.exercises),
      loggedAt: w.loggedAt.toISOString(),
    })),
    latestMetric: latestMetric
      ? {
          weightKg: latestMetric.weightKg,
          bodyFatPercentage: latestMetric.bodyFatPercentage,
          measuredAt: latestMetric.measuredAt.toISOString(),
        }
      : null,
    checkIns: checkIns.map((c) => ({
      id: c.id,
      weekStart: c.weekStart.toISOString(),
      mood: c.mood,
      energy: c.energy,
      stress: c.stress,
      wentWell: c.wentWell,
      challenging: c.challenging,
    })),
    subscription: subscription
      ? {
          tier: subscription.tier,
          status: subscription.status,
          currentPeriodEnd:
            subscription.currentPeriodEnd?.toISOString() ?? null,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        }
      : null,
    newbieDesignation,
    sessionCount,
    referral: { code: referralCode?.code ?? null, referralsMade },
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard/admin/clients"
          className="mb-4 inline-flex items-center gap-1 font-body text-sm text-grey-dark hover:text-green"
        >
          <ArrowLeft size={16} /> Back to clients
        </Link>
        <ClientProfileTabs data={data} />
      </div>
    </div>
  )
}
