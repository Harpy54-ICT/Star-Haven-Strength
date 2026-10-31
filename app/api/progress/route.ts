import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

export const dynamic = 'force-dynamic'

/**
 * GET /api/progress — body metrics (last 90 days) + workout logs (last 12 weeks)
 * for the current member, used by the "My Progress" charts.
 */
export const GET = withAuth(async () => {
  const session = await requireAuth()
  const userId = session.user.id

  const now = Date.now()
  const since90 = new Date(now - 90 * 24 * 60 * 60 * 1000)
  const since12w = new Date(now - 12 * 7 * 24 * 60 * 60 * 1000)

  const [bodyMetrics, workoutLogs] = await Promise.all([
    db.bodyMetric.findMany({
      where: { userId, measuredAt: { gte: since90 } },
      orderBy: { measuredAt: 'asc' },
      select: {
        id: true,
        weightKg: true,
        waistCm: true,
        hipsCm: true,
        measuredAt: true,
      },
    }),
    db.workoutLog.findMany({
      where: { userId, loggedAt: { gte: since12w } },
      orderBy: { loggedAt: 'asc' },
      select: { id: true, totalVolumeLbs: true, loggedAt: true },
    }),
  ])

  return NextResponse.json({ bodyMetrics, workoutLogs })
})
