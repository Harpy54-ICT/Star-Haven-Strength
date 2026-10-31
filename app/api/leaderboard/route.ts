import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'
import { getLevelInfo } from '@/lib/gamification/levels'

/**
 * PUBLIC leaderboard API (no auth required to read).
 *
 * Never exposes full names or emails — only firstName + last initial. Users who
 * set `leaderboardOptOut` are excluded entirely.
 */

export interface LeaderboardEntry {
  firstName: string
  lastInitial: string
  totalXP: number
  level: string
  weeklyXP?: number
}

function maskUser(u: {
  firstName: string | null
  lastName: string | null
  totalXP: number
}): LeaderboardEntry {
  return {
    firstName: u.firstName || 'Member',
    lastInitial: u.lastName ? `${u.lastName.charAt(0).toUpperCase()}.` : '',
    totalXP: u.totalXP,
    level: getLevelInfo(u.totalXP).tier.name,
  }
}

export async function GET() {
  try {
    // All-time top 20.
    const allTimeUsers = await db.user.findMany({
      where: { leaderboardOptOut: false },
      orderBy: { totalXP: 'desc' },
      take: 20,
      select: { id: true, firstName: true, lastName: true, totalXP: true },
    })
    const allTime = allTimeUsers.map(maskUser)

    // Weekly: sum XP earned since Monday.
    const now = new Date()
    const weekStart = new Date(now)
    const day = (weekStart.getUTCDay() + 6) % 7 // Mon=0
    weekStart.setUTCDate(weekStart.getUTCDate() - day)
    weekStart.setUTCHours(0, 0, 0, 0)

    const grouped = await db.xPEvent.groupBy({
      by: ['userId'],
      where: { createdAt: { gte: weekStart } },
      _sum: { xpAmount: true },
      orderBy: { _sum: { xpAmount: 'desc' } },
      take: 30,
    })

    const userMap = new Map(
      (
        await db.user.findMany({
          where: {
            id: { in: grouped.map((g) => g.userId) },
            leaderboardOptOut: false,
          },
          select: { id: true, firstName: true, lastName: true, totalXP: true },
        })
      ).map((u) => [u.id, u])
    )

    const weekly: LeaderboardEntry[] = []
    for (const g of grouped) {
      const u = userMap.get(g.userId)
      if (!u) continue
      weekly.push({ ...maskUser(u), weeklyXP: g._sum.xpAmount ?? 0 })
      if (weekly.length >= 10) break
    }

    return NextResponse.json({ allTime, weekly })
  } catch (error) {
    console.error('[leaderboard] error:', error)
    return NextResponse.json({ allTime: [], weekly: [] })
  }
}

/** Toggle the current user's leaderboard opt-out. */
export const PATCH = withAuth(async (req: Request) => {
  const session = await requireAuth()
  const body = await req.json().catch(() => ({}))
  const optOut = Boolean(body?.leaderboardOptOut)
  await db.user.update({
    where: { id: session.user.id },
    data: { leaderboardOptOut: optOut },
  })
  return NextResponse.json({ leaderboardOptOut: optOut })
})
