import { NextResponse } from 'next/server'
import { z } from 'zod'
import { startOfWeek } from 'date-fns'
import { db } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'
import { awardXP, XP_AWARDS } from '@/lib/gamification/xp'

/** Weekly check-in API. weekStart is the most recent Monday (UTC). */

const bodySchema = z.object({
  mood: z.number().int().min(1).max(5).optional().nullable(),
  energy: z.number().int().min(1).max(5).optional().nullable(),
  sleepHours: z.number().min(0).max(24).optional().nullable(),
  sleepQuality: z.number().int().min(1).max(5).optional().nullable(),
  stress: z.number().int().min(1).max(5).optional().nullable(),
  soreness: z.number().int().min(1).max(5).optional().nullable(),
  wentWell: z.string().max(2000).optional().nullable(),
  challenging: z.string().max(2000).optional().nullable(),
  nextWeekFocus: z.string().max(2000).optional().nullable(),
})

/** Most recent Monday at UTC midnight. */
function currentWeekStart(): Date {
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 })
  const d = new Date(
    Date.UTC(monday.getFullYear(), monday.getMonth(), monday.getDate())
  )
  return d
}

export const POST = withAuth(async (req: Request) => {
  const session = await requireAuth()
  const userId = session.user.id

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid check-in data', details: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const weekStart = currentWeekStart()

  const existing = await db.checkIn.findUnique({
    where: { userId_weekStart: { userId, weekStart } },
    select: { id: true },
  })

  const record = await db.checkIn.upsert({
    where: { userId_weekStart: { userId, weekStart } },
    create: { userId, weekStart, ...parsed.data },
    update: { ...parsed.data },
    select: { id: true },
  })

  // Only award XP on the first submission for the week.
  if (!existing) {
    await awardXP(userId, 'CHECK_IN_SUBMITTED', XP_AWARDS.CHECK_IN_SUBMITTED, {
      checkInId: record.id,
    })
  }

  return NextResponse.json({ id: record.id })
})

export const GET = withAuth(async () => {
  const session = await requireAuth()
  const userId = session.user.id

  const checkIns = await db.checkIn.findMany({
    where: { userId },
    orderBy: { weekStart: 'desc' },
  })

  return NextResponse.json({
    checkIns,
    currentWeekStart: currentWeekStart().toISOString(),
  })
})
