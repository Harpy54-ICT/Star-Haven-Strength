import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { requireAdmin } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/clients/[userId]/progress — admin only.
 * Body metrics (last 90 days) + check-ins (last 12 weeks) for one client, used
 * by the Progress tab on the admin client profile.
 */
export const GET = withAuth(
  async (_req: Request, ctx: { params: { userId: string } }) => {
    await requireAdmin()
    const userId = ctx.params.userId

    const now = Date.now()
    const since90 = new Date(now - 90 * 24 * 60 * 60 * 1000)
    const since12w = new Date(now - 12 * 7 * 24 * 60 * 60 * 1000)

    const [bodyMetrics, checkIns] = await Promise.all([
      db.bodyMetric.findMany({
        where: { userId, measuredAt: { gte: since90 } },
        orderBy: { measuredAt: 'asc' },
        select: { id: true, weightKg: true, measuredAt: true },
      }),
      db.checkIn.findMany({
        where: { userId, weekStart: { gte: since12w } },
        orderBy: { weekStart: 'asc' },
        select: { id: true, mood: true, energy: true, weekStart: true },
      }),
    ])

    return NextResponse.json({ bodyMetrics, checkIns })
  }
)
