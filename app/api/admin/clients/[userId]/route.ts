import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { requireAdmin } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

/**
 * GET /api/admin/clients/[userId] — admin only.
 * Full profile for a single client (never exposes passwordHash).
 */
export const GET = withAuth(
  async (_req: Request, ctx: { params: { userId: string } }) => {
    await requireAdmin()
    const { userId } = ctx.params

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        image: true,
        role: true,
        accountType: true,
        militaryBranch: true,
        militaryVerified: true,
        bio: true,
        preferredUnits: true,
        totalXP: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    if (!user) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const [
      workoutLogs,
      latestMetric,
      latestCheckIn,
      subscription,
      militaryVerification,
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
          totalVolumeLbs: true,
          exercises: true,
          loggedAt: true,
        },
      }),
      db.bodyMetric.findFirst({
        where: { userId },
        orderBy: { measuredAt: 'desc' },
        select: {
          weightKg: true,
          bodyFatPercentage: true,
          measuredAt: true,
        },
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
          sleepHours: true,
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
          currentPeriodStart: true,
          currentPeriodEnd: true,
          cancelAtPeriodEnd: true,
        },
      }),
      db.militaryVerification.findFirst({
        where: { userId },
        orderBy: { submittedAt: 'desc' },
        select: {
          status: true,
          submittedAt: true,
          reviewedAt: true,
          documentUrl: true,
          notes: true,
        },
      }),
      db.newbieDesignation.findUnique({
        where: { userId },
        select: {
          currentWeek: true,
          currentPhase: true,
          discountActive: true,
          graduatedAt: true,
        },
      }),
      db.booking.count({ where: { userId } }),
      db.referralCode.findUnique({
        where: { userId },
        select: { code: true },
      }),
      db.referral.count({ where: { referrerId: userId } }),
    ])

    return NextResponse.json({
      user,
      workoutLogs,
      latestMetric,
      checkIns: latestCheckIn,
      subscription,
      militaryVerification,
      newbieDesignation,
      sessionCount,
      referral: {
        code: referralCode?.code ?? null,
        referralsMade,
      },
    })
  }
)
