'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable'

interface Entry {
  firstName: string
  lastInitial: string
  totalXP: number
  level: string
  weeklyXP?: number
}

const CHALLENGES = [
  {
    title: '30-Day Strength Challenge',
    desc: 'Log a strength workout every day for 30 days. Build the habit, earn the Iron Habit badge, and climb the leaderboard.',
  },
  {
    title: 'Mile Time Trial',
    desc: 'Set your fastest mile and beat it. Track your time trial PRs and compete with the community.',
  },
]

export default function ChallengesPage() {
  const [tab, setTab] = useState<'weekly' | 'allTime'>('weekly')
  const [weekly, setWeekly] = useState<Entry[]>([])
  const [allTime, setAllTime] = useState<Entry[]>([])

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((r) => (r.ok ? r.json() : { weekly: [], allTime: [] }))
      .then((d) => {
        setWeekly(d.weekly ?? [])
        setAllTime(d.allTime ?? [])
      })
  }, [])

  return (
    <div className="min-h-screen bg-grey-light">
      {/* Header */}
      <header className="border-b border-grey-mid bg-green">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-5">
          <Link
            href="/"
            className="font-display text-lg font-bold uppercase tracking-wide text-gold"
          >
            Star Haven Strength
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg bg-gold px-4 py-2 font-display text-xs font-bold uppercase tracking-wide text-green"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-green">
          Challenges &amp; Leaderboard
        </h1>
        <p className="mt-2 font-body text-grey-dark">
          Compete with the Star Haven community. No login required to view.
        </p>

        {/* Challenge cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {CHALLENGES.map((c) => (
            <div
              key={c.title}
              className="rounded-xl border border-grey-mid bg-white p-5"
            >
              <h2 className="font-display text-lg font-bold uppercase tracking-wide text-green">
                {c.title}
              </h2>
              <p className="mt-2 font-body text-sm text-grey-dark">{c.desc}</p>
              <Link
                href="/dashboard"
                className="mt-4 inline-block rounded-lg bg-gold px-4 py-2 font-display text-xs font-bold uppercase tracking-wide text-green hover:brightness-95"
              >
                Join
              </Link>
            </div>
          ))}
        </div>

        {/* Leaderboard */}
        <div className="mt-10">
          <div className="flex gap-2">
            {(['weekly', 'allTime'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-lg px-4 py-2 font-display text-sm font-bold uppercase tracking-wide ${
                  tab === t
                    ? 'bg-green text-gold'
                    : 'border border-grey-mid text-grey-dark'
                }`}
              >
                {t === 'weekly' ? 'This Week' : 'All Time'}
              </button>
            ))}
          </div>
          <div className="mt-4">
            {tab === 'weekly' ? (
              <LeaderboardTable entries={weekly} metric="weekly" />
            ) : (
              <LeaderboardTable entries={allTime} metric="total" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
