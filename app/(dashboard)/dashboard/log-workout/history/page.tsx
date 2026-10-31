'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Dumbbell,
  ChevronDown,
  ChevronRight,
  Calendar,
  Clock,
  Layers,
  TrendingUp,
  Plus,
  Loader2,
  CheckCircle2,
} from 'lucide-react'

interface LoggedSet {
  weight: number
  reps: number
  completed: boolean
}
interface LoggedExercise {
  name: string
  exerciseId?: string | null
  sets: LoggedSet[]
}
interface WorkoutLog {
  id: string
  name: string
  durationMinutes: number | null
  notes: string | null
  exercises: LoggedExercise[]
  totalSets: number | null
  totalVolumeLbs: number | null
  loggedAt: string
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function HistoryInner() {
  const params = useSearchParams()
  const justSaved = params.get('saved') === '1'
  const savedPRs = parseInt(params.get('prs') || '0', 10)

  const [logs, setLogs] = useState<WorkoutLog[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const qs = new URLSearchParams()
    if (startDate) qs.set('startDate', startDate)
    if (endDate) qs.set('endDate', endDate)
    try {
      const res = await fetch(`/api/logs/workout?${qs.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs || [])
      }
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    load()
  }, [load])

  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }))

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal">Workout History</h1>
          <p className="text-sm text-grey-mid">Review and track your past sessions.</p>
        </div>
        <Link
          href="/dashboard/log-workout"
          className="flex items-center gap-1.5 rounded-lg bg-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-dark"
        >
          <Plus className="h-4 w-4" /> Log Workout
        </Link>
      </div>

      {justSaved && (
        <div className="mb-5 flex items-center gap-2 rounded-lg bg-green/10 px-4 py-3 text-sm font-medium text-green-dark">
          <CheckCircle2 className="h-5 w-5" />
          Workout saved!
          {savedPRs > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-2.5 py-0.5 text-xs font-bold text-gold-dark">
              <TrendingUp className="h-3 w-3" /> {savedPRs} new PR{savedPRs > 1 ? 's' : ''}!
            </span>
          )}
        </div>
      )}

      {/* Date filter */}
      <div className="mb-5 flex flex-wrap items-end gap-3 rounded-xl border border-grey-light bg-white p-4 shadow-sm">
        <div>
          <label className="mb-1 block text-xs font-medium text-grey-mid">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-md border border-grey-light px-2.5 py-1.5 text-sm text-charcoal focus:border-green focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-grey-mid">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-md border border-grey-light px-2.5 py-1.5 text-sm text-charcoal focus:border-green focus:outline-none"
          />
        </div>
        {(startDate || endDate) && (
          <button
            type="button"
            onClick={() => {
              setStartDate('')
              setEndDate('')
            }}
            className="text-sm font-medium text-grey-mid hover:text-green"
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-green" />
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-grey-light bg-grey-light/20 p-12 text-center">
          <Dumbbell className="mx-auto mb-3 h-10 w-10 text-grey-mid" />
          <h3 className="font-display text-lg font-semibold text-charcoal">No workouts yet</h3>
          <p className="mt-1 text-sm text-grey-mid">
            Your logged sessions will appear here once you save your first workout.
          </p>
          <Link
            href="/dashboard/log-workout"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-dark"
          >
            <Plus className="h-4 w-4" /> Log Your First Workout
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const isOpen = !!expanded[log.id]
            return (
              <div key={log.id} className="overflow-hidden rounded-xl border border-grey-light bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => toggle(log.id)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-grey-light/30"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green/10">
                    <Dumbbell className="h-5 w-5 text-green" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-display text-base font-semibold text-charcoal">
                      {log.name}
                    </h3>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-grey-mid">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {formatDate(log.loggedAt)}
                      </span>
                      {log.durationMinutes != null && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {log.durationMinutes} min
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Layers className="h-3 w-3" /> {log.totalSets ?? 0} sets
                      </span>
                      <span className="inline-flex items-center gap-1 font-mono">
                        {(log.totalVolumeLbs ?? 0).toLocaleString()} lbs
                      </span>
                    </div>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="h-5 w-5 shrink-0 text-grey-mid" />
                  ) : (
                    <ChevronRight className="h-5 w-5 shrink-0 text-grey-mid" />
                  )}
                </button>

                {isOpen && (
                  <div className="border-t border-grey-light px-4 py-3">
                    <div className="space-y-3">
                      {log.exercises.map((ex, i) => (
                        <div key={i}>
                          <h4 className="mb-1 text-sm font-semibold text-charcoal">{ex.name}</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {ex.sets.map((s, si) => (
                              <span
                                key={si}
                                className={`rounded-md px-2 py-1 font-mono text-xs ${
                                  s.completed
                                    ? 'bg-green/10 text-green-dark'
                                    : 'bg-grey-light/60 text-grey-mid line-through'
                                }`}
                              >
                                {s.weight}×{s.reps}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    {log.notes && (
                      <p className="mt-3 whitespace-pre-line rounded-lg bg-grey-light/40 px-3 py-2 text-xs text-grey-dark">
                        {log.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function WorkoutHistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-green" />
        </div>
      }
    >
      <HistoryInner />
    </Suspense>
  )
}
