import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

/** Habits API: list habits (with today's completion) and create new ones. */

const createSchema = z.object({
  habitName: z.string().min(1).max(200),
  frequency: z.enum(['daily', 'weekly']).default('daily'),
  category: z
    .enum(['fitness', 'nutrition', 'recovery', 'mindset', 'other'])
    .optional()
    .nullable(),
})

function todayDate(): Date {
  const d = new Date()
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

export const GET = withAuth(async () => {
  const session = await requireAuth()
  const userId = session.user.id
  const today = todayDate()

  const habits = await db.habit.findMany({
    where: { userId },
    orderBy: [{ isActive: 'desc' }, { createdAt: 'asc' }],
    include: {
      logs: { where: { loggedDate: today }, select: { completed: true } },
    },
  })

  const result = habits.map((h) => ({
    id: h.id,
    habitName: h.habitName,
    frequency: h.frequency,
    category: h.category,
    currentStreak: h.currentStreak,
    longestStreak: h.longestStreak,
    isActive: h.isActive,
    completedToday: h.logs[0]?.completed ?? false,
  }))

  return NextResponse.json({ habits: result })
})

export const POST = withAuth(async (req: Request) => {
  const session = await requireAuth()
  const userId = session.user.id
  const parsed = createSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid habit data', details: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const created = await db.habit.create({
    data: {
      userId,
      habitName: parsed.data.habitName,
      frequency: parsed.data.frequency,
      category: parsed.data.category ?? null,
    },
    select: { id: true },
  })
  return NextResponse.json({ id: created.id })
})
