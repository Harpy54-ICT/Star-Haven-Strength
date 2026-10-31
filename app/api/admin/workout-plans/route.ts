import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { requireAdmin } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'
import { workoutPlanInputSchema } from '@/lib/workout-plans/types'

export const dynamic = 'force-dynamic'

/** GET /api/admin/workout-plans — list all plans across clients (admin only). */
export const GET = withAuth(async () => {
  await requireAdmin()

  const plans = await db.workoutPlan.findMany({
    orderBy: [{ isActive: 'desc' }, { assignedAt: 'desc' }],
    select: {
      id: true,
      title: true,
      weeks: true,
      isActive: true,
      assignedAt: true,
      updatedAt: true,
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  })

  return NextResponse.json({ plans })
})

/**
 * POST /api/admin/workout-plans — create a plan and assign it to a client.
 * When `isActive` is true, any other active plan for the same client is
 * deactivated in the same transaction so a client has at most one active plan.
 */
export const POST = withAuth(async (req: Request) => {
  await requireAdmin()

  const parsed = workoutPlanInputSchema.safeParse(
    await req.json().catch(() => null)
  )
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid data' },
      { status: 400 }
    )
  }
  const { userId, title, description, weeks, days, isActive } = parsed.data

  // Confirm the target user exists and is a client/member.
  const target = await db.user.findUnique({
    where: { id: userId },
    select: { id: true },
  })
  if (!target) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  const plan = await db.$transaction(async (tx) => {
    if (isActive) {
      await tx.workoutPlan.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false },
      })
    }
    return tx.workoutPlan.create({
      data: {
        userId,
        title,
        description: description || null,
        weeks,
        days,
        isActive,
      },
    })
  })

  // Notify the member when a plan is activated for them.
  if (isActive) {
    await db.clientNotification
      .create({
        data: {
          userId,
          title: 'New workout plan assigned',
          message: `Your coach assigned you a new plan: "${title}". View it under Workout Plan.`,
          type: 'general',
        },
      })
      .catch(() => null)
  }

  return NextResponse.json({ plan }, { status: 201 })
})
