import { format } from 'date-fns'
import { Sparkles } from 'lucide-react'
import { requireAuth } from '@/lib/auth/guards'
import { db } from '@/lib/db/client'
import { getLevelInfo } from '@/lib/gamification/levels'
import XPBar from '@/components/gamification/XPBar'
import BadgeGrid from '@/components/gamification/BadgeGrid'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Achievements | Star Haven Strength',
}

/** Human-friendly labels for XP event types. */
const EVENT_LABELS: Record<string, string> = {
  WORKOUT_LOGGED: 'Workout logged',
  CARDIO_LOGGED: 'Cardio logged',
  NUTRITION_LOGGED: 'Nutrition logged',
  CHECK_IN_SUBMITTED: 'Weekly check-in',
  PR_ACHIEVED: 'New personal record',
  INTAKE_COMPLETED: 'Intake completed',
  HABIT_STREAK_7: '7-day habit streak',
  HABIT_STREAK_30: '30-day habit streak',
  PROGRESS_PHOTO_UPLOADED: 'Progress photo',
  FIRST_WORKOUT: 'First workout',
  WORKOUTS_10: '10 workouts milestone',
  WORKOUTS_50: '50 workouts milestone',
  BADGE_EARNED: 'Badge earned',
}

function labelFor(eventType: string): string {
  return EVENT_LABELS[eventType] ?? eventType.replace(/_/g, ' ').toLowerCase()
}

export default async function AchievementsPage() {
  const session = await requireAuth()
  const userId = session.user.id

  const [user, earnedBadges, recentEvents] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { totalXP: true } }),
    db.userBadge.findMany({
      where: { userId },
      select: { badgeId: true, earnedAt: true },
    }),
    db.xPEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, eventType: true, xpAmount: true, createdAt: true },
    }),
  ])

  const totalXP = user?.totalXP ?? 0
  const level = getLevelInfo(totalXP)

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-green">
          Achievements
        </h1>
        <p className="mt-1 font-body text-grey-dark">
          Earn XP, level up, and collect badges as you train.
        </p>

        {/* XP + Level hero */}
        <div className="mt-6 rounded-2xl border border-grey-mid bg-white p-6 shadow-sm">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="font-body text-sm uppercase tracking-wide text-grey-dark">
                Total XP
              </p>
              <p className="font-mono text-4xl font-bold text-charcoal">
                {totalXP.toLocaleString()}
              </p>
            </div>
            <span
              className={`rounded-full px-4 py-2 font-display text-sm font-bold uppercase tracking-wide ${level.tier.bgClass}`}
            >
              {level.tier.name} Tier
            </span>
          </div>
          <div className="mt-5">
            <XPBar totalXP={totalXP} />
          </div>
        </div>

        {/* Badges */}
        <div className="mt-8">
          <h2 className="font-display text-xl font-bold text-charcoal">Badges</h2>
          <div className="mt-4">
            <BadgeGrid
              earned={earnedBadges.map((b) => ({
                badgeId: b.badgeId,
                earnedAt: b.earnedAt,
              }))}
            />
          </div>
        </div>

        {/* Recent XP feed */}
        <div className="mt-8">
          <h2 className="font-display text-xl font-bold text-charcoal">
            Recent Activity
          </h2>
          <div className="mt-4 rounded-xl border border-grey-mid bg-white">
            {recentEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <Sparkles className="mb-3 text-grey-dark" size={28} />
                <p className="font-body text-sm text-grey-dark">
                  No XP earned yet. Log a workout to get started!
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-grey-mid">
                {recentEvents.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15">
                        <Sparkles size={15} className="text-gold-dark" />
                      </span>
                      <div>
                        <p className="font-body text-sm font-medium capitalize text-charcoal">
                          {labelFor(e.eventType)}
                        </p>
                        <p className="font-body text-xs text-grey-dark">
                          {format(e.createdAt, 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-sm font-bold text-green">
                      +{e.xpAmount}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
