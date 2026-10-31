import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

/** Member: cohort detail + my enrollment status + current count. */
export const GET = withAuth(
  async (_req: Request, ctx: { params: { cohortId: string } }) => {
    const session = await requireAuth()
    const userId = session.user.id

    const cohort = await db.cohortProgram.findUnique({
      where: { id: ctx.params.cohortId },
      include: {
        _count: { select: { enrollments: true } },
        enrollments: { where: { userId }, select: { status: true } },
      },
    })
    if (!cohort) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const enrolledCount = cohort._count.enrollments
    return NextResponse.json({
      cohort: {
        id: cohort.id,
        name: cohort.name,
        description: cohort.description,
        durationWeeks: cohort.durationWeeks,
        priceCents: cohort.priceCents,
        maxClients: cohort.maxClients,
        startDate: cohort.startDate,
        status: cohort.status,
        enrolledCount,
        isFull: cohort.maxClients != null && enrolledCount >= cohort.maxClients,
        myStatus: cohort.enrollments[0]?.status ?? null,
      },
    })
  }
)
