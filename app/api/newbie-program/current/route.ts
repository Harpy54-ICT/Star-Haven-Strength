import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'
import { awardXP } from '@/lib/gamification/xp'
import { isDesignationExpired } from '@/lib/newbie/discount'
import {
  NEWBIE_PROGRAM_TOTAL_WEEKS,
  currentProgramWeek,
  getNewbieProgramWeek,
} from '@/lib/newbie/program'

export const dynamic = 'force-dynamic'

/** XP granted for marking a newbie program week complete. */
const NEWBIE_WEEK_COMPLETE_XP = 50

/**
 * GET — current newbie program week for the authenticated member.
 * Returns { active: false } (with a reason) when the member has no active
 * NewbieDesignation, so the page can show a friendly message instead of 404.
 */
export const GET = withAuth(async () => {
  const session = await requireAuth()
  const designation = await db.newbieDesignation.findUnique({
    where: { userId: session.user.id },
  })

  if (!designation) {
    return NextResponse.json({ active: false, reason: 'not_enrolled' })
  }

  const expired =
    !designation.discountActive || isDesignationExpired(designation)
  const week = currentProgramWeek(designation.startedAt)

  if (expired) {
    return NextResponse.json({
      active: false,
      reason: 'graduated',
      totalWeeks: NEWBIE_PROGRAM_TOTAL_WEEKS,
    })
  }

  // Which weeks has the member already marked complete?
  const completed = await db.xPEvent.findMany({
    where: { userId: session.user.id, eventType: 'NEWBIE_WEEK_COMPLETE' },
    select: { metadata: true },
  })
  const completedWeeks = completed
    .map((e) => {
      const m = e.metadata as { week?: number } | null
      return m?.week
    })
    .filter((w): w is number => typeof w === 'number')

  return NextResponse.json({
    active: true,
    week,
    totalWeeks: NEWBIE_PROGRAM_TOTAL_WEEKS,
    content: getNewbieProgramWeek(week),
    completedWeeks,
  })
})

/**
 * POST — mark the current week complete (awards XP once per week).
 */
export const POST = withAuth(async () => {
  const session = await requireAuth()
  const designation = await db.newbieDesignation.findUnique({
    where: { userId: session.user.id },
  })
  if (!designation) {
    return NextResponse.json(
      { error: 'No active newbie program' },
      { status: 400 }
    )
  }

  const week = currentProgramWeek(designation.startedAt)

  // Idempotent: don't award twice for the same week.
  const existing = await db.xPEvent.findFirst({
    where: {
      userId: session.user.id,
      eventType: 'NEWBIE_WEEK_COMPLETE',
      metadata: { path: ['week'], equals: week },
    },
    select: { id: true },
  })
  if (existing) {
    return NextResponse.json({ ok: true, alreadyComplete: true, week })
  }

  await awardXP(
    session.user.id,
    'NEWBIE_WEEK_COMPLETE',
    NEWBIE_WEEK_COMPLETE_XP,
    { week }
  )

  return NextResponse.json({ ok: true, week, xp: NEWBIE_WEEK_COMPLETE_XP })
})
