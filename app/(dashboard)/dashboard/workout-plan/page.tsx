'use client'

import { useEffect, useState } from 'react'
import { ClipboardList, ChevronDown, ChevronRight } from 'lucide-react'
import type { PlanDay } from '@/lib/workout-plans/types'

interface ActivePlan {
  id: string
  title: string
  description: string | null
  weeks: number
  days: PlanDay[]
  assignedAt: string
}

export default function WorkoutPlanPage() {
  const [plan, setPlan] = useState<ActivePlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [openDay, setOpenDay] = useState<number>(0)

  useEffect(() => {
    fetch('/api/workout-plan')
      .then((r) => (r.ok ? r.json() : { plan: null }))
      .then((d) => setPlan(d.plan ?? null))
      .catch(() => setPlan(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-2">
          <ClipboardList className="text-green" size={24} />
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-green">
            Workout Plan
          </h1>
        </div>

        {loading ? (
          <p className="mt-6 font-body text-sm text-grey-dark">Loading…</p>
        ) : !plan ? (
          <div className="mt-6 rounded-xl border border-grey-mid bg-white p-8 text-center">
            <p className="font-display text-lg font-bold text-charcoal">
              No plan assigned yet
            </p>
            <p className="mt-2 font-body text-sm text-grey-dark">
              Your coach hasn&apos;t assigned a plan yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-grey-mid bg-white p-5">
              <h2 className="font-display text-xl font-bold text-charcoal">
                {plan.title}
              </h2>
              <p className="mt-1 font-mono text-xs uppercase tracking-wide text-gold-dark">
                {plan.weeks} week{plan.weeks === 1 ? '' : 's'} ·{' '}
                {plan.days.length} day{plan.days.length === 1 ? '' : 's'} / week
              </p>
              {plan.description && (
                <p className="mt-3 whitespace-pre-wrap font-body text-sm text-grey-dark">
                  {plan.description}
                </p>
              )}
            </div>

            {plan.days.map((day, di) => {
              const open = openDay === di
              return (
                <div
                  key={di}
                  className="overflow-hidden rounded-xl border border-grey-mid bg-white"
                >
                  <button
                    type="button"
                    onClick={() => setOpenDay(open ? -1 : di)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-grey-light/50"
                  >
                    <span className="font-display text-base font-bold uppercase tracking-wide text-green">
                      {day.dayLabel}
                    </span>
                    {open ? (
                      <ChevronDown size={18} className="text-grey-dark" />
                    ) : (
                      <ChevronRight size={18} className="text-grey-dark" />
                    )}
                  </button>

                  {open && (
                    <div className="border-t border-grey-mid">
                      {day.exercises.length === 0 ? (
                        <p className="px-5 py-4 font-body text-sm text-grey-dark">
                          No exercises listed for this day.
                        </p>
                      ) : (
                        <ul className="divide-y divide-grey-mid/60">
                          {day.exercises.map((ex, ei) => (
                            <li key={ei} className="px-5 py-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-body text-sm font-semibold text-charcoal">
                                  {ex.name}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm text-grey-dark">
                                    {ex.sets} × {ex.reps || '—'}
                                  </span>
                                  {ex.rpe != null && (
                                    <span className="rounded-full bg-gold/20 px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-wide text-gold-dark">
                                      RPE {ex.rpe}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {ex.notes && (
                                <p className="mt-1 font-body text-xs italic text-grey-dark">
                                  {ex.notes}
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
