import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { requireAdmin } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'
import { workoutPlanUpdateSchema } from '@/lib/workout-plans/types'

export const dynamic = 'force-dynamic'

/** GET /api/admin/workout-plans/[id] — a single plan with client info. */
export const GET = withAuth(
  async (_req: Request, ctx: { params: { id: string } }) => {
    await requireAdmin()
    const plan = await db.workoutPlan.findUnique({
      where: { id: ctx.params.id },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    })
    if (!plan) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ plan })
  }
)

/**
 * PUT /api/admin/workout-plans/[id] — update a plan. Activating this plan
 * deactivates any other active plan for the same client.
 */
export const PUT = withAuth(
  async (req: Request, ctx: { params: { id: string } }) => {
    await requireAdmin()

    const existing = await db.workoutPlan.findUnique({
      where: { id: ctx.params.id },
      select: { id: true, userId: true, isActive: true, title: true },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const parsed = workoutPlanUpdateSchema.safeParse(
      await req.json().catch(() => null)
    )
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid data' },
        { status: 400 }
      )
    }
    const data = parsed.data
    const willActivate = data.isActive === true && !existing.isActive

    const plan = await db.$transaction(async (tx) => {
      if (data.isActive === true) {
        await tx.workoutPlan.updateMany({
          where: {
            userId: existing.userId,
            isActive: true,
            NOT: { id: existing.id },
          },
          data: { isActive: false },
        })
      }
      return tx.workoutPlan.update({
        where: { id: existing.id },
        data: {
          ...(data.title !== undefined ? { title: data.title } : {}),
          ...(data.description !== undefined
            ? { description: data.description || null }
            : {}),
          ...(data.weeks !== undefined ? { weeks: data.weeks } : {}),
          ...(data.days !== undefined ? { days: data.days } : {}),
          ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        },
      })
    })

    if (willActivate) {
      await db.clientNotification
        .create({
          data: {
            userId: existing.userId,
            title: 'Workout plan activated',
            message: `Your coach activated your plan: "${plan.title}". View it under Workout Plan.`,
            type: 'general',
          },
        })
        .catch(() => null)
    }

    return NextResponse.json({ plan })
  }
)

/** DELETE /api/admin/workout-plans/[id]. */
export const DELETE = withAuth(
  async (_req: Request, ctx: { params: { id: string } }) => {
    await requireAdmin()
    const existing = await db.workoutPlan.findUnique({
      where: { id: ctx.params.id },
      select: { id: true },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    await db.workoutPlan.delete({ where: { id: existing.id } })
    return NextResponse.json({ ok: true })
  }
)
