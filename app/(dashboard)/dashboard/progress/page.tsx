'use client'

import { useEffect, useState } from 'react'
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
} from 'recharts'
import { Trophy, Flame, Dumbbell } from 'lucide-react'

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
  volumeByWeek: { week: string; volume: number }[]
  currentStreak: number
  longestStreak: number
  totalWorkouts: number
}

const TABS = ['PRs', 'Volume', 'Frequency'] as const

export default function ProgressPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('PRs')
  const [prs, setPrs] = useState<PR[]>([])
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/logs/pr')
      .then((r) => (r.ok ? r.json() : { prs: [] }))
      .then((d) => setPrs(d.prs ?? []))
    fetch('/api/progress/stats')
      .then((r) => (r.ok ? r.json() : null))
      .then(setStats)
  }, [])

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-green">
          Progress
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

        <div className="mt-6 flex gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-2 font-display text-sm font-bold uppercase tracking-wide ${
                tab === t ? 'bg-green text-gold' : 'border border-grey-mid text-grey-dark'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-6">
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
                        {new Date(pr.achievedAt).toLocaleDateString()} · {pr.prType}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-bold text-charcoal">
                      {pr.weightKg != null
                        ? `${Math.round(pr.weightKg * 2.2046)} lbs`
                        : '—'}
                      {pr.reps ? ` × ${pr.reps}` : ''}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'Volume' && (
            <div className="rounded-xl border border-grey-mid bg-white p-5">
              <h2 className="font-display text-lg font-bold text-charcoal">
                Volume by Week (lbs)
              </h2>
              <div className="mt-4 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.volumeByWeek ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="week" fontSize={10} tickFormatter={(v) => v.slice(5)} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="volume" fill="#1B4332" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
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
                    <XAxis dataKey="week" fontSize={10} tickFormatter={(v) => v.slice(5)} />
                    <YAxis fontSize={11} allowDecimals={false} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#C9A84C"
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
