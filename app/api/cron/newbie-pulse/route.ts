import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import {
  expireElapsedDesignations,
  remainingDiscountMonths,
} from '@/lib/newbie/discount'

export const dynamic = 'force-dynamic'

/**
 * Weekly "newbie pulse" cron (scheduled in vercel.json: Mondays 09:00 UTC).
 *
 * Protected by CRON_SECRET — Vercel Cron sends it as a Bearer token.
 *
 * Each run:
 *  1. Expires any newbie designations whose discount window has elapsed.
 *  2. Sends a weekly check-in ClientNotification to every still-active newbie.
 *  3. Returns a JSON summary.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  // 1. Expire designations past their discount window.
  const expired = await expireElapsedDesignations(now)

  // 2. Weekly check-in for remaining active newbies.
  const activeNewbies = await db.newbieDesignation.findMany({
    where: { discountActive: true },
    select: { userId: true, startedAt: true },
  })

  let notified = 0
  for (const n of activeNewbies) {
    const monthsLeft = remainingDiscountMonths({ startedAt: n.startedAt }, now)
    await db.clientNotification.create({
      data: {
        userId: n.userId,
        title: 'Your weekly newbie check-in',
        message:
          monthsLeft > 0
            ? `You have ${monthsLeft} month${
                monthsLeft === 1 ? '' : 's'
              } left on your newbie discount. Keep the momentum going — log a workout this week!`
            : 'This is your final week on the newbie discount. Make it count!',
        type: 'general',
      },
    })
    notified += 1
  }

  return NextResponse.json({
    ok: true,
    ran: 'newbie-pulse',
    ranAt: now.toISOString(),
    expiredCount: expired.length,
    notifiedCount: notified,
  })
}
