import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { requireAdmin } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/bookings — all bookings across clients, split into upcoming
 * (end time in the future) and past, each newest-first-appropriate. Admin only.
 */
export const GET = withAuth(async () => {
  await requireAdmin()

  const now = new Date()
  const bookings = await db.booking.findMany({
    orderBy: { startTime: 'desc' },
    take: 300,
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  })

  const upcoming = bookings
    .filter((b) => b.endTime >= now)
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
  const past = bookings.filter((b) => b.endTime < now)

  return NextResponse.json({ upcoming, past })
})
