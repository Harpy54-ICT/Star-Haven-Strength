import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { requireOwnership } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'
import { awardXP, XP_AWARDS } from '@/lib/gamification/xp'

/**
 * POST /api/habits/:habitId/log
 * Toggle today's completion and recompute current/longest streak.
 */

const DAY = 86_400_000

function todayDate(): Date {
  const d = new Date()
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

/** Current streak ending today, from a set of completed day-timestamps. */
function currentStreak(days: number[]): number {
  if (days.length === 0) return 0
  const set = new Set(days)
  let streak = 0
  let cursor = todayDate().getTime()
  while (set.has(cursor)) {
    streak += 1
    cursor -= DAY
  }
  return streak
}

export const POST = withAuth(
  async (_req: Request, ctx: { params: { habitId: string } }) => {
    const { habitId } = ctx.params
    const habit = await db.habit.findUnique({
      where: { id: habitId },
      select: { userId: true, longestStreak: true },
    })
    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
    }
    await requireOwnership(habit.userId)

    const today = todayDate()
    const existing = await db.habitLog.findUnique({
      where: { habitId_loggedDate: { habitId, loggedDate: today } },
    })

    let completed: boolean
    if (existing) {
      completed = !existing.completed
      await db.habitLog.update({
        where: { id: existing.id },
        data: { completed },
      })
    } else {
      completed = true
      await db.habitLog.create({
        data: { habitId, userId: habit.userId, loggedDate: today, completed },
      })
    }

    // Recompute streaks from completed logs.
    const completedLogs = await db.habitLog.findMany({
      where: { habitId, completed: true },
      select: { loggedDate: true },
    })
    const days = completedLogs.map((l) => {
      const d = new Date(l.loggedDate)
      return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
    })
    const current = currentStreak(days)
    const longest = Math.max(habit.longestStreak, current)

    await db.habit.update({
      where: { id: habitId },
      data: { currentStreak: current, longestStreak: longest },
    })

    // Streak milestone XP (awarded as the streak first reaches the threshold).
    if (completed && current === 7) {
      await awardXP(habit.userId, 'HABIT_STREAK_7', XP_AWARDS.HABIT_STREAK_7, {
        habitId,
      })
    } else if (completed && current === 30) {
      await awardXP(habit.userId, 'HABIT_STREAK_30', XP_AWARDS.HABIT_STREAK_30, {
        habitId,
      })
    }

    return NextResponse.json({ completed, currentStreak: current })
  }
)
