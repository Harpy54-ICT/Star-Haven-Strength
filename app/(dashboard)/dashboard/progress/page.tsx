'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Trophy, Flame, Dumbbell } from 'lucide-react'

const GREEN = '#1B4332'
const GOLD = '#C9A84C'

interface PR {
  id: string
  exerciseName: string
  prType: string
  weightKg: number | null
  reps: number | null
  achievedAt: string
  isNewPR: boolean
}
interface Stats {
  workoutFrequency: { week: string; count: number }[]
  currentStreak: number
  longestStreak: number
  totalWorkouts: number
}
interface BodyMetric {
  id: string
  weightKg: number | null
  waistCm: number | null
  hipsCm: number | null
  measuredAt: string
}
interface WorkoutLog {
  id: string
  totalVolumeLbs: number | null
  loggedAt: string
}

const TABS = ['Weight', 'Measurements', 'Volume', 'PRs', 'Frequency'] as const

const KG_TO_LBS = 2.20462
const CM_TO_IN = 1 / 2.54

function fmtDay(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

/** Monday-based week key for bucketing workout volume. */
function weekKey(iso: string): string {
  const d = new Date(iso)
  const day = (d.getDay() + 6) % 7 // 0 = Monday
  d.setDate(d.getDate() - day)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export default function ProgressPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Weight')
  const [prs, setPrs] = useState<PR[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetric[]>([])
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([])

  useEffect(() => {
    fetch('/api/logs/pr')
      .then((r) => (r.ok ? r.json() : { prs: [] }))
      .then((d) => setPrs(d.prs ?? []))
      .catch(() => setPrs([]))
    fetch('/api/progress/stats')
      .then((r) => (r.ok ? r.json() : null))
      .then(setStats)
      .catch(() => setStats(null))
    fetch('/api/progress')
      .then((r) => (r.ok ? r.json() : { bodyMetrics: [], workoutLogs: [] }))
      .then((d) => {
        setBodyMetrics(d.bodyMetrics ?? [])
        setWorkoutLogs(d.workoutLogs ?? [])
      })
      .catch(() => {
        setBodyMetrics([])
        setWorkoutLogs([])
      })
  }, [])

  const weightData = useMemo(
    () =>
      bodyMetrics
        .filter((m) => m.weightKg != null)
        .map((m) => ({
          date: fmtDay(m.measuredAt),
          lbs: Math.round((m.weightKg as number) * KG_TO_LBS * 10) / 10,
        })),
    [bodyMetrics]
  )

  const measureData = useMemo(
    () =>
      bodyMetrics
        .filter((m) => m.waistCm != null || m.hipsCm != null)
        .map((m) => ({
          date: fmtDay(m.measuredAt),
          waist:
            m.waistCm != null
              ? Math.round(m.waistCm * CM_TO_IN * 10) / 10
              : null,
          hips:
            m.hipsCm != null ? Math.round(m.hipsCm * CM_TO_IN * 10) / 10 : null,
        })),
    [bodyMetrics]
  )

  const volumeData = useMemo(() => {
    const buckets = new Map<string, number>()
    for (const log of workoutLogs) {
      const key = weekKey(log.loggedAt)
      buckets.set(key, (buckets.get(key) ?? 0) + (log.totalVolumeLbs ?? 0))
    }
    return Array.from(buckets.entries()).map(([week, volume]) => ({
      week,
      volume: Math.round(volume),
    }))
  }, [workoutLogs])

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-green">
          My Progress
        </h1>

        {/* Stat cards */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-grey-mid bg-white p-4">
            <Flame className="text-gold" size={20} />
            <p className="mt-2 font-mono text-2xl font-bold text-charcoal">
              {stats?.currentStreak ?? 0}
            </p>
            <p className="font-body text-xs text-grey-dark">Current streak</p>
          </div>
          <div className="rounded-xl border border-grey-mid bg-white p-4">
            <Trophy className="text-gold" size={20} />
            <p className="mt-2 font-mono text-2xl font-bold text-charcoal">
              {stats?.longestStreak ?? 0}
            </p>
            <p className="font-body text-xs text-grey-dark">Longest streak</p>
          </div>
          <div className="rounded-xl border border-grey-mid bg-white p-4">
            <Dumbbell className="text-gold" size={20} />
            <p className="mt-2 font-mono text-2xl font-bold text-charcoal">
              {stats?.totalWorkouts ?? 0}
            </p>
            <p className="font-body text-xs text-grey-dark">Total workouts</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-2 font-display text-sm font-bold uppercase tracking-wide ${
                tab === t
                  ? 'bg-green text-gold'
                  : 'border border-grey-mid text-grey-dark'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === 'Weight' && (
            <div className="rounded-xl border border-grey-mid bg-white p-5">
              <h2 className="font-display text-lg font-bold text-charcoal">
                Weight (lbs) · last 90 days
              </h2>
              {weightData.length === 0 ? (
                <p className="mt-4 font-body text-sm text-grey-dark">
                  No weight entries yet. Log body metrics to see your trend.
                </p>
              ) : (
                <div className="mt-4 h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" fontSize={10} />
                      <YAxis fontSize={11} domain={['auto', 'auto']} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="lbs"
                        name="Weight (lbs)"
                        stroke={GREEN}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {tab === 'Measurements' && (
            <div className="rounded-xl border border-grey-mid bg-white p-5">
              <h2 className="font-display text-lg font-bold text-charcoal">
                Waist &amp; Hips (in) · last 90 days
              </h2>
              {measureData.length === 0 ? (
                <p className="mt-4 font-body text-sm text-grey-dark">
                  No waist/hip measurements yet. Log body metrics to see your
                  trend.
                </p>
              ) : (
                <div className="mt-4 h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={measureData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" fontSize={10} />
                      <YAxis fontSize={11} domain={['auto', 'auto']} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="waist"
                        name="Waist (in)"
                        stroke={GREEN}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        connectNulls
                      />
                      <Line
                        type="monotone"
                        dataKey="hips"
                        name="Hips (in)"
                        stroke={GOLD}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        connectNulls
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {tab === 'Volume' && (
            <div className="rounded-xl border border-grey-mid bg-white p-5">
              <h2 className="font-display text-lg font-bold text-charcoal">
                Workout Volume (lbs) · last 12 weeks
              </h2>
              {volumeData.length === 0 ? (
                <p className="mt-4 font-body text-sm text-grey-dark">
                  No workout volume logged in the last 12 weeks.
                </p>
              ) : (
                <div className="mt-4 h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={volumeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="week" fontSize={10} />
                      <YAxis fontSize={11} />
                      <Tooltip />
                      <Bar
                        dataKey="volume"
                        name="Volume (lbs)"
                        fill={GREEN}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {tab === 'PRs' && (
            <div className="space-y-2">
              {prs.length === 0 ? (
                <p className="rounded-xl border border-grey-mid bg-white p-6 text-center font-body text-sm text-grey-dark">
                  No personal records yet. Log a workout to start tracking PRs.
                </p>
              ) : (
                prs.map((pr) => (
                  <div
                    key={pr.id}
                    className="flex items-center justify-between rounded-xl border border-grey-mid bg-white px-4 py-3"
                  >
                    <div>
                      <p className="font-body text-sm font-semibold text-charcoal">
                        {pr.exerciseName}
                        {pr.isNewPR && (
                          <span className="ml-2 rounded-full bg-gold/20 px-2 py-0.5 font-display text-[10px] font-bold uppercase text-gold-dark">
                            PR
                          </span>
                        )}
                      </p>
                      <p className="font-mono text-xs text-grey-dark">
                        {new Date(pr.achievedAt).toLocaleDateString()} ·{' '}
                        {pr.prType}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-bold text-charcoal">
                      {pr.weightKg != null
                        ? `${Math.round(pr.weightKg * KG_TO_LBS)} lbs`
                        : '—'}
                      {pr.reps ? ` × ${pr.reps}` : ''}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'Frequency' && (
            <div className="rounded-xl border border-grey-mid bg-white p-5">
              <h2 className="font-display text-lg font-bold text-charcoal">
                Workouts per Week
              </h2>
              <div className="mt-4 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats?.workoutFrequency ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="week"
                      fontSize={10}
                      tickFormatter={(v) => String(v).slice(5)}
                    />
                    <YAxis fontSize={11} allowDecimals={false} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke={GOLD}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
