import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

export const dynamic = 'force-dynamic'

/** GET /api/workout-plan — the current member's active workout plan (or null). */
export const GET = withAuth(async () => {
  const session = await requireAuth()
  const plan = await db.workoutPlan.findFirst({
    where: { userId: session.user.id, isActive: true },
    orderBy: { assignedAt: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      weeks: true,
      days: true,
      assignedAt: true,
      updatedAt: true,
    },
  })
  return NextResponse.json({ plan })
})
