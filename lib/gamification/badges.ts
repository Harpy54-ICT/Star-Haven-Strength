import { db } from '@/lib/db/client'
import { awardXP, XP_AWARDS } from '@/lib/gamification/xp'

/**
 * Badge catalogue.
 *
 * Each badge has a stable `id` (stored in `UserBadge.badgeId`), display copy,
 * and a `requirement` string shown on locked badges. The actual earning logic
 * lives in `checkAndAwardBadges` so conditions can query across many models.
 */
export interface BadgeDef {
  id: string
  name: string
  description: string
  requirement: string
  icon: string
}

export const BADGES: BadgeDef[] = [
  {
    id: 'first_workout',
    name: 'First Workout',
    description: 'Logged your very first workout.',
    requirement: 'Log your first workout',
    icon: '🏋️',
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Reached a 7-day habit streak.',
    requirement: 'Hit a 7-day habit streak',
    icon: '🔥',
  },
  {
    id: 'streak_30',
    name: 'Iron Habit',
    description: 'Reached a 30-day habit streak.',
    requirement: 'Hit a 30-day habit streak',
    icon: '⚙️',
  },
  {
    id: 'pr_first',
    name: 'New Record',
    description: 'Set your first personal record.',
    requirement: 'Achieve your first PR',
    icon: '⭐',
  },
  {
    id: 'workouts_10',
    name: 'Getting Warmed Up',
    description: 'Logged 10 workouts.',
    requirement: 'Log 10 workouts',
    icon: '💪',
  },
  {
    id: 'workouts_50',
    name: 'Dedicated Athlete',
    description: 'Logged 50 workouts.',
    requirement: 'Log 50 workouts',
    icon: '🏆',
  },
  {
    id: 'intake_complete',
    name: 'Ready to Train',
    description: 'Completed your intake questionnaire.',
    requirement: 'Complete the intake form',
    icon: '📋',
  },
  {
    id: 'check_in_4',
    name: 'Check-In Regular',
    description: 'Submitted 4 consecutive weekly check-ins.',
    requirement: 'Submit 4 weekly check-ins in a row',
    icon: '✅',
  },
  {
    id: 'nutrition_7',
    name: 'Fueled Up',
    description: 'Logged nutrition 7 days in a row.',
    requirement: 'Log nutrition 7 days in a row',
    icon: '🍎',
  },
]

/** Fast lookup by id. */
export const BADGE_MAP: Record<string, BadgeDef> = Object.fromEntries(
  BADGES.map((b) => [b.id, b])
)

/** Count distinct YYYY-MM-DD day keys from a list of dates. */
function distinctDayKeys(dates: Date[]): string[] {
  return Array.from(
    new Set(
      dates.map((d) => {
        const dt = new Date(d)
        return `${dt.getUTCFullYear()}-${dt.getUTCMonth()}-${dt.getUTCDate()}`
      })
    )
  )
}

/** Longest run of consecutive calendar days present in the given date list. */
function longestConsecutiveDays(dates: Date[]): number {
  const keys = Array.from(
    new Set(
      dates.map((d) => {
        const dt = new Date(d)
        dt.setUTCHours(0, 0, 0, 0)
        return dt.getTime()
      })
    )
  ).sort((a, b) => a - b)
  if (keys.length === 0) return 0
  const DAY = 86_400_000
  let best = 1
  let run = 1
  for (let i = 1; i < keys.length; i++) {
    if (keys[i] - keys[i - 1] === DAY) {
      run += 1
      best = Math.max(best, run)
    } else {
      run = 1
    }
  }
  return best
}

/** Longest run of consecutive ISO weeks among the given week-start dates. */
function longestConsecutiveWeeks(weekStarts: Date[]): number {
  const keys = Array.from(
    new Set(
      weekStarts.map((d) => {
        const dt = new Date(d)
        dt.setUTCHours(0, 0, 0, 0)
        return dt.getTime()
      })
    )
  ).sort((a, b) => a - b)
  if (keys.length === 0) return 0
  const WEEK = 7 * 86_400_000
  let best = 1
  let run = 1
  for (let i = 1; i < keys.length; i++) {
    if (keys[i] - keys[i - 1] === WEEK) {
      run += 1
      best = Math.max(best, run)
    } else {
      run = 1
    }
  }
  return best
}

/**
 * Evaluate every badge condition for a user and award any newly-earned badges.
 *
 * Idempotent: badges are upserted by (userId, badgeId), so re-running never
 * duplicates. Each newly-granted badge also awards BADGE_EARNED XP (with the
 * badge check suppressed to prevent infinite recursion).
 */
export async function checkAndAwardBadges(userId: string): Promise<void> {
  try {
    const [
      workoutCount,
      firstWorkout,
      prCount,
      intake,
      habits,
      checkIns,
      nutritionLogs,
      existingBadges,
    ] = await Promise.all([
      db.workoutLog.count({ where: { userId } }),
      db.workoutLog.findFirst({ where: { userId }, select: { id: true } }),
      db.pRLog.count({ where: { userId } }),
      db.clientIntake.findFirst({
        where: { userId, completedAt: { not: null } },
        select: { id: true },
      }),
      db.habit.findMany({
        where: { userId },
        select: { longestStreak: true, currentStreak: true },
      }),
      db.checkIn.findMany({
        where: { userId },
        orderBy: { weekStart: 'desc' },
        select: { weekStart: true },
      }),
      db.nutritionLog.findMany({
        where: { userId },
        select: { loggedAt: true },
      }),
      db.userBadge.findMany({
        where: { userId },
        select: { badgeId: true },
      }),
    ])

    const earned = new Set(existingBadges.map((b) => b.badgeId))
    const bestHabitStreak = habits.reduce(
      (m, h) => Math.max(m, h.longestStreak, h.currentStreak),
      0
    )
    const consecutiveCheckIns = longestConsecutiveWeeks(
      checkIns.map((c) => c.weekStart)
    )
    const bestNutritionStreak = longestConsecutiveDays(
      nutritionLogs.map((n) => n.loggedAt)
    )
    // (distinctDayKeys retained for potential future per-day badges)
    void distinctDayKeys

    const toAward: string[] = []
    const consider = (id: string, condition: boolean) => {
      if (condition && !earned.has(id)) toAward.push(id)
    }

    consider('first_workout', !!firstWorkout)
    consider('workouts_10', workoutCount >= 10)
    consider('workouts_50', workoutCount >= 50)
    consider('pr_first', prCount >= 1)
    consider('intake_complete', !!intake)
    consider('streak_7', bestHabitStreak >= 7)
    consider('streak_30', bestHabitStreak >= 30)
    consider('check_in_4', consecutiveCheckIns >= 4)
    consider('nutrition_7', bestNutritionStreak >= 7)

    for (const badgeId of toAward) {
      await db.userBadge.upsert({
        where: { userId_badgeId: { userId, badgeId } },
        create: { userId, badgeId },
        update: {},
      })
      // Grant XP for the achievement, suppressing the badge re-check to avoid
      // recursion back into this function.
      await awardXP(
        userId,
        'BADGE_EARNED',
        XP_AWARDS.BADGE_EARNED,
        { badgeId },
        { skipBadgeCheck: true }
      )
    }
  } catch (error) {
    console.error(`[badges] Failed to check/award badges (user=${userId}):`, error)
  }
}
