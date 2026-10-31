'use client'

import { useCallback, useEffect, useState } from 'react'
import { Sparkles, CheckCircle2, Target, Brain, Loader2 } from 'lucide-react'

interface WeekContent {
  week: number
  theme: string
  tips: string[]
  workout_focus: string
  mindset_note: string
}

interface CurrentResponse {
  active: boolean
  reason?: 'not_enrolled' | 'graduated'
  week?: number
  totalWeeks?: number
  content?: WeekContent
  completedWeeks?: number[]
}

export default function NewbieProgramPage() {
  const [data, setData] = useState<CurrentResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/newbie-program/current')
      const json = (await res.json()) as CurrentResponse
      setData(json)
    } catch {
      setData({ active: false, reason: 'not_enrolled' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const markComplete = async () => {
    setMarking(true)
    try {
      await fetch('/api/newbie-program/current', { method: 'POST' })
      await load()
    } finally {
      setMarking(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="animate-spin text-green" size={28} />
      </div>
    )
  }

  if (!data || !data.active) {
    const graduated = data?.reason === 'graduated'
    return (
      <div className="px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-xl border border-grey-mid bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-light">
              <Sparkles className="text-gold" size={26} />
            </div>
            <h1 className="mt-5 font-display text-2xl font-bold uppercase tracking-wide text-green">
              {graduated ? "You've Graduated!" : 'Not Enrolled Yet'}
            </h1>
            <p className="mt-3 font-body text-sm text-grey-dark">
              {graduated
                ? 'Congratulations on completing your 13-week New Member Program. Your foundation is set — keep the momentum going with your ongoing training.'
                : 'The New Member Program is for members with an active newbie designation. Once you join, your personalized 13-week onboarding journey will appear here.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const week = data.week ?? 1
  const totalWeeks = data.totalWeeks ?? 13
  const content = data.content
  const completedWeeks = data.completedWeeks ?? []
  const isComplete = completedWeeks.includes(week)
  const progressPct = Math.round((week / totalWeeks) * 100)

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-2">
          <Sparkles className="text-gold" size={22} />
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-green">
            New Member Program
          </h1>
        </div>
        <p className="mt-1 font-body text-sm text-grey-dark">
          Your 13-week onboarding journey.
        </p>

        {/* Progress bar */}
        <div className="mt-6 rounded-xl border border-grey-mid bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-display text-sm font-bold uppercase tracking-wide text-charcoal">
              Week {week} of {totalWeeks}
            </span>
            <span className="font-mono text-sm text-grey-dark">
              {progressPct}%
            </span>
          </div>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-grey-light">
            <div
              className="h-full rounded-full bg-gold transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Week content */}
        {content && (
          <div className="mt-6 rounded-xl border border-grey-mid border-t-4 border-t-green bg-white p-6 shadow-sm">
            <p className="font-display text-xs font-bold uppercase tracking-widest text-gold-dark">
              Week {content.week} Theme
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold text-charcoal">
              {content.theme}
            </h2>

            <div className="mt-6">
              <div className="flex items-center gap-2">
                <Target className="text-green" size={18} />
                <h3 className="font-display text-sm font-bold uppercase tracking-wide text-green">
                  Workout Focus
                </h3>
              </div>
              <p className="mt-2 font-body text-sm text-charcoal">
                {content.workout_focus}
              </p>
            </div>

            <div className="mt-6">
              <h3 className="font-display text-sm font-bold uppercase tracking-wide text-green">
                This Week&apos;s Tips
              </h3>
              <ul className="mt-2 space-y-2">
                {content.tips.map((tip, i) => (
                  <li key={i} className="flex gap-2 font-body text-sm text-charcoal">
                    <CheckCircle2
                      className="mt-0.5 shrink-0 text-gold"
                      size={16}
                    />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 rounded-lg bg-green-light p-4">
              <div className="flex items-center gap-2">
                <Brain className="text-green" size={18} />
                <h3 className="font-display text-sm font-bold uppercase tracking-wide text-green">
                  Mindset Note
                </h3>
              </div>
              <p className="mt-2 font-body text-sm italic text-charcoal">
                {content.mindset_note}
              </p>
            </div>
          </div>
        )}

        {/* Mark complete */}
        <div className="mt-6">
          {isComplete ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-green/30 bg-green-light px-5 py-4">
              <CheckCircle2 className="text-green" size={20} />
              <span className="font-display text-sm font-bold uppercase tracking-wide text-green">
                Week {week} Complete
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={markComplete}
              disabled={marking}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-green px-5 py-4 font-display text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-green/90 disabled:opacity-60"
            >
              {marking ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <CheckCircle2 size={18} />
              )}
              Mark This Week Complete (+50 XP)
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
