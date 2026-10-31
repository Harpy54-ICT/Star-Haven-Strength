import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'
import { awardXP } from '@/lib/gamification/xp'

/** XP granted for joining a cohort program. */
const COHORT_ENROLL_XP = 50

/**
 * Member enroll / leave for a cohort.
 *
 * POST: enroll. Respects capacity — if the cohort is full, the member is placed
 * on the waitlist (enrollment status "waitlisted") instead of "active". XP is
 * only awarded for an actual active enrollment.
 * DELETE: leave (removes the enrollment; if a waitlisted member exists, the
 * first in line is promoted to active).
 */

export const POST = withAuth(
  async (_req: Request, ctx: { params: { cohortId: string } }) => {
    const session = await requireAuth()
    const userId = session.user.id
    const cohortId = ctx.params.cohortId

    const cohort = await db.cohortProgram.findUnique({
      where: { id: cohortId },
      select: { id: true, status: true, maxClients: true },
    })
    if (!cohort) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (!['open', 'active'].includes(cohort.status)) {
      return NextResponse.json(
        { error: 'This cohort is not open for enrollment' },
        { status: 400 }
      )
    }

    const existing = await db.cohortEnrollment.findUnique({
      where: { cohortId_userId: { cohortId, userId } },
      select: { status: true },
    })
    if (existing) {
      return NextResponse.json({ status: existing.status, already: true })
    }

    const activeCount = await db.cohortEnrollment.count({
      where: { cohortId, status: 'active' },
    })
    const isFull =
      cohort.maxClients != null && activeCount >= cohort.maxClients
    const status = isFull ? 'waitlisted' : 'active'

    await db.cohortEnrollment.create({
      data: { cohortId, userId, status },
    })

    if (status === 'active') {
      await awardXP(userId, 'COHORT_ENROLLED', COHORT_ENROLL_XP, { cohortId })
    }

    return NextResponse.json({ status })
  }
)

export const DELETE = withAuth(
  async (_req: Request, ctx: { params: { cohortId: string } }) => {
    const session = await requireAuth()
    const userId = session.user.id
    const cohortId = ctx.params.cohortId

    const existing = await db.cohortEnrollment.findUnique({
      where: { cohortId_userId: { cohortId, userId } },
      select: { status: true },
    })
    if (!existing) {
      return NextResponse.json({ ok: true, notEnrolled: true })
    }

    await db.cohortEnrollment.delete({
      where: { cohortId_userId: { cohortId, userId } },
    })

    // Promote the longest-waiting waitlisted member, if any.
    if (existing.status === 'active') {
      const next = await db.cohortEnrollment.findFirst({
        where: { cohortId, status: 'waitlisted' },
        orderBy: { enrolledAt: 'asc' },
      })
      if (next) {
        await db.cohortEnrollment.update({
          where: { id: next.id },
          data: { status: 'active' },
        })
        await awardXP(next.userId, 'COHORT_ENROLLED', COHORT_ENROLL_XP, {
          cohortId,
          promotedFromWaitlist: true,
        })
        await db.clientNotification.create({
          data: {
            userId: next.userId,
            title: 'You\u2019re off the waitlist!',
            message: 'A spot opened up and you are now enrolled in the cohort.',
            type: 'general',
          },
        })
      }
    }

    return NextResponse.json({ ok: true })
  }
)
