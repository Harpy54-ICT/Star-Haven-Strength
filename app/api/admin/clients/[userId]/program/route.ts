import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { requireAdmin } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

/**
 * Admin program assignment for a specific client.
 *
 * The schema has no dedicated ClientProgram/WorkoutPlan model, so an assigned
 * program is modelled as a CohortEnrollment into a CohortProgram (the schema's
 * "program" entity). Assigning = enrolling the client (status "assigned", which
 * bypasses the capacity/waitlist rules of self-service enrollment) and sending
 * them a ClientNotification.
 */

const assignSchema = z.object({
  cohortId: z.string().min(1),
})

export const GET = withAuth(
  async (_req: Request, ctx: { params: { userId: string } }) => {
    await requireAdmin()
    const { userId } = ctx.params
    const [assignments, programs] = await Promise.all([
      db.cohortEnrollment.findMany({
        where: { userId },
        orderBy: { enrolledAt: 'desc' },
        include: {
          cohort: {
            select: { id: true, name: true, durationWeeks: true, status: true },
          },
        },
      }),
      db.cohortProgram.findMany({
        where: { status: { in: ['draft', 'open', 'active'] } },
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, status: true },
      }),
    ])
    return NextResponse.json({ assignments, programs })
  }
)

export const POST = withAuth(
  async (req: Request, ctx: { params: { userId: string } }) => {
    await requireAdmin()
    const { userId } = ctx.params
    const parsed = assignSchema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }
    const { cohortId } = parsed.data

    const [user, cohort] = await Promise.all([
      db.user.findUnique({ where: { id: userId }, select: { id: true } }),
      db.cohortProgram.findUnique({
        where: { id: cohortId },
        select: { id: true, name: true },
      }),
    ])
    if (!user || !cohort) {
      return NextResponse.json(
        { error: 'User or program not found' },
        { status: 404 }
      )
    }

    await db.cohortEnrollment.upsert({
      where: { cohortId_userId: { cohortId, userId } },
      create: { cohortId, userId, status: 'assigned' },
      update: { status: 'assigned' },
    })

    await db.clientNotification.create({
      data: {
        userId,
        title: 'New program assigned',
        message: `Your coach assigned you to "${cohort.name}". Open My Program to get started.`,
        type: 'general',
      },
    })

    return NextResponse.json({ ok: true })
  }
)

export const DELETE = withAuth(
  async (req: Request, ctx: { params: { userId: string } }) => {
    await requireAdmin()
    const { userId } = ctx.params
    const { searchParams } = new URL(req.url)
    const cohortId = searchParams.get('cohortId')
    if (!cohortId) {
      return NextResponse.json({ error: 'cohortId required' }, { status: 400 })
    }
    await db.cohortEnrollment
      .delete({ where: { cohortId_userId: { cohortId, userId } } })
      .catch(() => null)
    return NextResponse.json({ ok: true })
  }
)
