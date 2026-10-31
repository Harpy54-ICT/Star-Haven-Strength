import { db } from '@/lib/db/client'
import { checkAndAwardBadges } from '@/lib/gamification/badges'

/**
 * XP award amounts for every gamified event in Star Haven Strength.
 *
 * Use these constants rather than magic numbers so the economy stays balanced
 * and auditable. `eventType` strings passed to `awardXP` should match these
 * keys (lower-cased by convention is not required — we store the raw key).
 */
export const XP_AWARDS = {
  WORKOUT_LOGGED: 50,
  CARDIO_LOGGED: 30,
  NUTRITION_LOGGED: 20,
  CHECK_IN_SUBMITTED: 40,
  PR_ACHIEVED: 100,
  INTAKE_COMPLETED: 25,
  HABIT_STREAK_7: 75,
  HABIT_STREAK_30: 200,
  PROGRESS_PHOTO_UPLOADED: 15,
  FIRST_WORKOUT: 100,
  WORKOUTS_10: 150,
  WORKOUTS_50: 500,
  BADGE_EARNED: 50,
} as const

export type XPEventType = keyof typeof XP_AWARDS | (string & {})

/**
 * Award XP to a user.
 *
 * - Records an `XPEvent` row (the audit trail / activity feed source).
 * - Increments `user.totalXP`.
 * - Re-evaluates badge conditions via `checkAndAwardBadges` (unless suppressed,
 *   to avoid infinite recursion when the badge award itself grants XP).
 *
 * This function never throws to its caller: gamification is a side effect and
 * must not break the core action (logging a workout, etc.). Failures are logged.
 *
 * @param userId     The user to award XP to.
 * @param eventType  A stable string identifying the event (see XP_AWARDS keys).
 * @param xpAmount   Amount of XP to grant (can be 0 to just record an event).
 * @param metadata   Optional JSON metadata stored on the XPEvent.
 * @param options    `skipBadgeCheck` prevents re-entrancy from badge awards.
 */
export async function awardXP(
  userId: string,
  eventType: XPEventType,
  xpAmount: number,
  metadata?: Record<string, unknown>,
  options?: { skipBadgeCheck?: boolean }
): Promise<void> {
  try {
    await db.$transaction([
      db.xPEvent.create({
        data: {
          userId,
          eventType: String(eventType),
          xpAmount,
          metadata: metadata ? (metadata as object) : undefined,
        },
      }),
      db.user.update({
        where: { id: userId },
        data: { totalXP: { increment: xpAmount } },
      }),
    ])

    // Real-time leaderboard update stub — a websocket/pusher broadcast would go
    // here in a future iteration.
    console.log(
      `[xp] user=${userId} event=${String(eventType)} +${xpAmount}XP`
    )

    if (!options?.skipBadgeCheck) {
      await checkAndAwardBadges(userId)
    }
  } catch (error) {
    console.error(
      `[xp] Failed to award XP (user=${userId}, event=${String(eventType)}):`,
      error
    )
  }
}
