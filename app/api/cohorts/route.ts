import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

/** Member: browse open/active cohorts with capacity + my enrollment status. */
export const GET = withAuth(async () => {
  const session = await requireAuth()
  const userId = session.user.id

  const cohorts = await db.cohortProgram.findMany({
    where: { status: { in: ['open', 'active'] } },
    orderBy: [{ status: 'asc' }, { startDate: 'asc' }],
    include: {
      _count: { select: { enrollments: true } },
      enrollments: {
        where: { userId },
        select: { status: true },
      },
    },
  })

  const result = cohorts.map((c) => {
    const activeCount = c._count.enrollments
    const myStatus = c.enrollments[0]?.status ?? null
    const isFull =
      c.maxClients != null && activeCount >= c.maxClients
    return {
      id: c.id,
      name: c.name,
      description: c.description,
      durationWeeks: c.durationWeeks,
      priceCents: c.priceCents,
      maxClients: c.maxClients,
      startDate: c.startDate,
      status: c.status,
      enrolledCount: activeCount,
      isFull,
      myStatus,
    }
  })

  return NextResponse.json({ cohorts: result })
})
