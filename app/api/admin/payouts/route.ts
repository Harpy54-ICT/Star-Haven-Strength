import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { requireAdmin } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

export const dynamic = 'force-dynamic'

/** Admin: list all payout requests with member info. */
export const GET = withAuth(async () => {
  await requireAdmin()
  const payouts = await db.payoutRequest.findMany({
    orderBy: { requestedAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  })
  return NextResponse.json({ payouts })
})
