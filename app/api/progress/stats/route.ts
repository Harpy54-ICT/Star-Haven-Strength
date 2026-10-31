import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

/**
 * GET /api/progress/stats
 * Aggregated training stats: 12-week frequency & volume, streaks, totals.
 */

const DAY = 86_400_000
const WEEK = 7 * DAY

function weekKey(d: Date): string {
  // ISO-ish week start (Monday) key for grouping.
  const dt = new Date(d)
  dt.setUTCHours(0, 0, 0, 0)
  const day = (dt.getUTCDay() + 6) % 7 // Mon=0
  dt.setUTCDate(dt.getUTCDate() - day)
  return dt.toISOString().slice(0, 10)
}

function computeStreaks(dates: Date[]): { current: number; longest: number } {
  const keys = Array.from(
    new Set(
      dates.map((d) => {
        const dt = new Date(d)
        dt.setUTCHours(0, 0, 0, 0)
        return dt.getTime()
      })
    )
  ).sort((a, b) => a - b)
  if (keys.length === 0) return { current: 0, longest: 0 }

  let longest = 1
  let run = 1
  for (let i = 1; i < keys.length; i++) {
    if (keys[i] - keys[i - 1] === DAY) {
      run += 1
      longest = Math.max(longest, run)
    } else run = 1
  }

  // Current streak ending today or yesterday.
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const todayMs = today.getTime()
  const last = keys[keys.length - 1]
  let current = 0
  if (todayMs - last <= DAY) {
    current = 1
    for (let i = keys.length - 1; i > 0; i--) {
      if (keys[i] - keys[i - 1] === DAY) current += 1
      else break
    }
  }
  return { current, longest }
}

export const GET = withAuth(async () => {
  const session = await requireAuth()
  const userId = session.user.id

  const since = new Date(Date.now() - 12 * WEEK)
  const [recent, allDates, totalWorkouts] = await Promise.all([
    db.workoutLog.findMany({
      where: { userId, loggedAt: { gte: since } },
      select: { loggedAt: true, totalVolumeLbs: true },
    }),
    db.workoutLog.findMany({
      where: { userId },
      select: { loggedAt: true },
      orderBy: { loggedAt: 'asc' },
    }),
    db.workoutLog.count({ where: { userId } }),
  ])

  // Build 12 week buckets.
  const buckets: { week: string; count: number; volume: number }[] = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getTime() - i * WEEK)
    buckets.push({ week: weekKey(d), count: 0, volume: 0 })
  }
  const idx = new Map(buckets.map((b, i) => [b.week, i]))
  for (const w of recent) {
    const k = weekKey(w.loggedAt)
    const i = idx.get(k)
    if (i != null) {
      buckets[i].count += 1
      buckets[i].volume += w.totalVolumeLbs ?? 0
    }
  }

  const { current, longest } = computeStreaks(allDates.map((d) => d.loggedAt))

  return NextResponse.json({
    workoutFrequency: buckets.map((b) => ({ week: b.week, count: b.count })),
    volumeByWeek: buckets.map((b) => ({
      week: b.week,
      volume: Math.round(b.volume),
    })),
    currentStreak: current,
    longestStreak: longest,
    totalWorkouts,
  })
})
