import Link from 'next/link'
import {
  Flame,
  CalendarDays,
  Award,
  UserCircle,
  Dumbbell,
  Apple,
  CalendarPlus,
  ClipboardCheck,
  Activity,
} from 'lucide-react'
import {
  format,
  startOfWeek,
  differenceInCalendarDays,
} from 'date-fns'
import { requireAuth } from '@/lib/auth/guards'
import { db } from '@/lib/db/client'
import { formatTierName } from '@/lib/stripe/billing'
import StatCard from '@/components/dashboard/StatCard'
import QuickAction from '@/components/dashboard/QuickAction'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Dashboard | Star Haven Strength',
}

function greeting(d: Date): string {
  const h = d.getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

/** Consecutive-day workout streak ending today or yesterday. */
function computeStreak(dates: Date[]): number {
  if (dates.length === 0) return 0
  const dayKeys = Array.from(
    new Set(dates.map((d) => format(d, 'yyyy-MM-dd')))
  ).sort((a, b) => (a < b ? 1 : -1)) // desc
  const today = new Date()
  let streak = 0
  let cursor = today
  const mostRecent = dayKeys[0]
  const gapFromToday = differenceInCalendarDays(
    today,
    new Date(`${mostRecent}T00:00:00`)
  )
  if (gapFromToday > 1) return 0 // streak broken
  for (const key of dayKeys) {
    const d = new Date(`${key}T00:00:00`)
    const gap = differenceInCalendarDays(cursor, d)
    if (gap <= 1) {
      streak += 1
      cursor = d
    } else {
      break
    }
  }
  return streak
}

export default async function DashboardOverview() {
  const session = await requireAuth()
  const userId = session.user.id
  const now = new Date()

  const [user, recentWorkouts, streakRows, weekCount, activeSub, nextBooking, newbie] =
    await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: { firstName: true, createdAt: true },
      }),
      db.workoutLog.findMany({
        where: { userId },
        orderBy: { loggedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          durationMinutes: true,
          totalVolumeLbs: true,
          totalSets: true,
          loggedAt: true,
        },
      }),
      db.workoutLog.findMany({
        where: { userId },
        orderBy: { loggedAt: 'desc' },
        take: 90,
        select: { loggedAt: true },
      }),
      db.workoutLog.count({
        where: {
          userId,
          loggedAt: { gte: startOfWeek(now, { weekStartsOn: 1 }) },
        },
      }),
      db.subscription.findFirst({
        where: { userId, status: { in: ['active', 'trialing'] } },
        orderBy: { createdAt: 'desc' },
        select: { tier: true },
      }),
      db.booking.findFirst({
        where: { userId, startTime: { gte: now }, status: 'scheduled' },
        orderBy: { startTime: 'asc' },
        select: { id: true, startTime: true, googleMeetLink: true },
      }),
      db.newbieDesignation.findUnique({
        where: { userId },
        select: { discountActive: true, currentPhase: true, currentWeek: true },
      }),
    ])

  const streak = computeStreak(streakRows.map((r) => r.loggedAt))
  const tierLabel = activeSub ? formatTierName(activeSub.tier) : 'Free'
  const memberSince = user?.createdAt
    ? format(user.createdAt, 'MMM yyyy')
    : '—'

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        {/* Greeting */}
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-green">
            {greeting(now)}
            {user?.firstName ? `, ${user.firstName}` : ''}
          </h1>
          <p className="mt-1 font-body text-grey-dark">
            {format(now, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        {/* Newbie banner */}
        {newbie?.discountActive && (
          <div className="mt-6 rounded-xl border border-gold/40 bg-gold/10 px-5 py-4">
            <p className="font-display text-sm font-bold uppercase tracking-wide text-gold-dark">
              Newbie Discount Active
            </p>
            <p className="mt-0.5 font-body text-sm text-charcoal">
              You&apos;re in week {newbie.currentWeek} ({newbie.currentPhase}).
              Enjoy elevated coach availability and introductory pricing while it
              lasts.
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={Flame}
            label="Current Streak"
            value={`${streak} ${streak === 1 ? 'day' : 'days'}`}
          />
          <StatCard
            icon={CalendarDays}
            label="Workouts This Week"
            value={weekCount}
          />
          <StatCard icon={Award} label="Current Tier" value={tierLabel} />
          <StatCard
            icon={UserCircle}
            label="Member Since"
            value={memberSince}
          />
        </div>

        {/* Quick actions */}
        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-charcoal">
            Quick Actions
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <QuickAction
              icon={Dumbbell}
              label="Log Workout"
              href="/dashboard/log-workout"
              variant="green"
            />
            <QuickAction
              icon={Apple}
              label="Log Nutrition"
              href="/dashboard/nutrition"
              variant="outline"
            />
            <QuickAction
              icon={CalendarPlus}
              label="Book Session"
              href="/dashboard/schedule"
              variant="outline"
            />
            <QuickAction
              icon={ClipboardCheck}
              label="Weekly Check-In"
              href="/dashboard/check-ins"
              variant="gold"
            />
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {/* Recent activity */}
          <div className="lg:col-span-2">
            <h2 className="font-display text-xl font-bold text-charcoal">
              Recent Activity
            </h2>
            <div className="mt-4 rounded-xl border border-grey-mid bg-white">
              {recentWorkouts.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                  <Activity className="mb-3 text-grey-dark" size={32} />
                  <p className="font-body text-sm text-grey-dark">
                    No workouts logged yet. Your sessions will appear here.
                  </p>
                  <Link
                    href="/dashboard/log-workout"
                    className="mt-4 rounded-lg bg-green px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-gold hover:bg-green-light"
                  >
                    Log your first workout
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-grey-mid">
                  {recentWorkouts.map((w) => (
                    <li
                      key={w.id}
                      className="flex items-center justify-between px-5 py-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green/10">
                          <Dumbbell size={18} className="text-green" />
                        </span>
                        <div>
                          <p className="font-body text-sm font-semibold text-charcoal">
                            {w.name}
                          </p>
                          <p className="font-body text-xs text-grey-dark">
                            {format(w.loggedAt, 'MMM d')} ·{' '}
                            {w.totalSets ?? 0} sets
                            {w.durationMinutes
                              ? ` · ${w.durationMinutes} min`
                              : ''}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-sm font-semibold text-charcoal">
                        {w.totalVolumeLbs
                          ? `${Math.round(w.totalVolumeLbs).toLocaleString()} lbs`
                          : '—'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Upcoming session */}
          <div>
            <h2 className="font-display text-xl font-bold text-charcoal">
              Upcoming Session
            </h2>
            <div className="mt-4 rounded-xl border border-grey-mid bg-white p-5">
              {nextBooking ? (
                <div>
                  <p className="font-display text-sm font-bold uppercase tracking-wide text-green">
                    {format(nextBooking.startTime, 'EEEE, MMM d')}
                  </p>
                  <p className="mt-1 font-mono text-2xl font-bold text-charcoal">
                    {format(nextBooking.startTime, 'h:mm a')}
                  </p>
                  {nextBooking.googleMeetLink && (
                    <a
                      href={nextBooking.googleMeetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block rounded-lg bg-green px-4 py-2 font-display text-sm font-semibold uppercase tracking-wide text-gold hover:bg-green-light"
                    >
                      Join Meet
                    </a>
                  )}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <CalendarPlus
                    className="mx-auto mb-3 text-grey-dark"
                    size={28}
                  />
                  <p className="font-body text-sm text-grey-dark">
                    No upcoming sessions.
                  </p>
                  <Link
                    href="/dashboard/schedule"
                    className="mt-3 inline-block font-body text-sm font-semibold text-green hover:underline"
                  >
                    Book a session →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
