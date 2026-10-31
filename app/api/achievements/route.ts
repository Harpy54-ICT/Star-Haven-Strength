import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'
import { getLevelInfo } from '@/lib/gamification/levels'
import { BADGES } from '@/lib/gamification/badges'

/**
 * GET /api/achievements
 *
 * Returns the authenticated user's lifetime XP, resolved level info, the full
 * badge catalogue annotated with earned status, and the 10 most recent XP
 * events (the activity feed).
 */
export const GET = withAuth(async () => {
  const session = await requireAuth()
  const userId = session.user.id

  const [user, userBadges, recentEvents] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { totalXP: true },
    }),
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
  const earnedMap = new Map(userBadges.map((b) => [b.badgeId, b.earnedAt]))

  const badges = BADGES.map((b) => ({
    ...b,
    earned: earnedMap.has(b.id),
    earnedAt: earnedMap.get(b.id) ?? null,
  }))

  return NextResponse.json({
    totalXP,
    level: {
      name: level.tier.name,
      progress: level.progress,
      xpToNext: level.xpToNext,
      nextTierName: level.nextTierName,
      nextThreshold: level.nextThreshold,
    },
    badges,
    earnedBadges: userBadges,
    recentEvents,
  })
})
