'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Dumbbell,
  Plus,
  Timer,
  Trash2,
  ChevronUp,
  ChevronDown,
  Save,
  X,
  Trophy,
  History,
  Loader2,
} from 'lucide-react'
import { ExerciseSearch } from '@/components/workout/ExerciseSearch'
import { SetRow, type WorkoutSet } from '@/components/workout/SetRow'

interface LoggedExercise {
  key: string
  id: string | null
  name: string
  sets: WorkoutSet[]
}

function formatClock(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

export default function LogWorkoutPage() {
  const router = useRouter()
  const [name, setName] = useState('Workout')
  const [unit, setUnit] = useState<'lbs' | 'kg'>('lbs')
  const [notes, setNotes] = useState('')
  const [rpe, setRpe] = useState(7)
  const [exercises, setExercises] = useState<LoggedExercise[]>([])
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const startRef = useRef<number>(Date.now())

  // Session duration timer.
  useEffect(() => {
    if (!running) return
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [running])

  const totalVolume = useMemo(() => {
    let v = 0
    for (const ex of exercises) {
      for (const s of ex.sets) {
        if (s.completed) v += s.weight * s.reps
      }
    }
    return Math.round(v * 10) / 10
  }, [exercises])

  const totalSets = useMemo(
    () => exercises.reduce((n, ex) => n + ex.sets.filter((s) => s.completed).length, 0),
    [exercises]
  )

  const addExercise = (ex: { id: string | null; name: string }) => {
    setExercises((prev) => [
      ...prev,
      {
        key: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        id: ex.id,
        name: ex.name,
        sets: [{ weight: 0, reps: 0, completed: true }],
      },
    ])
  }

  const updateExercise = (key: string, patch: Partial<LoggedExercise>) => {
    setExercises((prev) => prev.map((ex) => (ex.key === key ? { ...ex, ...patch } : ex)))
  }

  const removeExercise = (key: string) => {
    setExercises((prev) => prev.filter((ex) => ex.key !== key))
  }

  const moveExercise = (index: number, dir: -1 | 1) => {
    setExercises((prev) => {
      const next = [...prev]
      const target = index + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const addSet = (key: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.key !== key) return ex
        const last = ex.sets[ex.sets.length - 1]
        return {
          ...ex,
          sets: [...ex.sets, { weight: last?.weight ?? 0, reps: last?.reps ?? 0, completed: true }],
        }
      })
    )
  }

  const discard = () => {
    if (exercises.length > 0 && !confirm('Discard this workout? Your logged sets will be lost.')) {
      return
    }
    router.push('/dashboard')
  }

  const save = async () => {
    setError(null)
    const valid = exercises.filter((ex) => ex.sets.some((s) => s.reps > 0))
    if (valid.length === 0) {
      setError('Add at least one exercise with a completed set before saving.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/logs/workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || 'Workout',
          durationMinutes: Math.round(elapsed / 60),
          notes: notes.trim() ? `${notes.trim()}\n(RPE ${rpe}/10)` : `RPE ${rpe}/10`,
          unit,
          exercises: valid.map((ex) => ({
            name: ex.name,
            exerciseId: ex.id,
            sets: ex.sets.map((s) => ({ weight: s.weight, reps: s.reps, completed: s.completed })),
          })),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save workout')
      }
      const data = await res.json()
      const prCount = data.newPRs?.length ?? 0
      router.push(`/dashboard/log-workout/history?saved=1&prs=${prCount}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl pb-28">
      {/* Session header */}
      <div className="sticky top-0 z-10 -mx-4 mb-6 border-b border-grey-light bg-white/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green/10">
              <Dumbbell className="h-5 w-5 text-green" />
            </div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full max-w-[180px] border-b border-transparent bg-transparent font-display text-lg font-semibold text-charcoal focus:border-green focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="flex items-center gap-2 rounded-lg bg-grey-light/60 px-3 py-1.5 font-mono text-sm font-semibold text-charcoal"
          >
            <Timer className={`h-4 w-4 ${running ? 'text-green' : 'text-grey-mid'}`} />
            {formatClock(elapsed)}
          </button>
        </div>

        <div className="mt-3 flex items-center gap-4 text-sm">
          <span className="text-grey-mid">
            <strong className="font-mono text-charcoal">{totalSets}</strong> sets
          </span>
          <span className="text-grey-mid">
            <strong className="font-mono text-charcoal">{totalVolume.toLocaleString()}</strong> {unit} volume
          </span>
          <div className="ml-auto inline-flex overflow-hidden rounded-md border border-grey-light">
            {(['lbs', 'kg'] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUnit(u)}
                className={`px-2.5 py-1 text-xs font-semibold ${
                  unit === u ? 'bg-green text-white' : 'bg-white text-grey-mid'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Exercise search */}
      <div className="mb-6">
        <ExerciseSearch onSelect={addExercise} />
      </div>

      {/* Exercise cards */}
      {exercises.length === 0 ? (
        <div className="rounded-xl border border-dashed border-grey-light bg-grey-light/20 p-10 text-center">
          <Dumbbell className="mx-auto mb-3 h-8 w-8 text-grey-mid" />
          <p className="text-sm text-grey-mid">
            Search for an exercise above to start building your session.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {exercises.map((ex, i) => (
            <div key={ex.key} className="rounded-xl border border-grey-light bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="font-display text-base font-semibold text-charcoal">{ex.name}</h3>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveExercise(i, -1)}
                    disabled={i === 0}
                    aria-label="Move up"
                    className="flex h-7 w-7 items-center justify-center rounded text-grey-mid hover:bg-grey-light disabled:opacity-30"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveExercise(i, 1)}
                    disabled={i === exercises.length - 1}
                    aria-label="Move down"
                    className="flex h-7 w-7 items-center justify-center rounded text-grey-mid hover:bg-grey-light disabled:opacity-30"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeExercise(ex.key)}
                    aria-label="Remove exercise"
                    className="flex h-7 w-7 items-center justify-center rounded text-grey-mid hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 px-1 pb-1 text-xs font-semibold uppercase tracking-wide text-grey-mid">
                <span className="w-6 text-center">#</span>
                <span className="flex-1">Weight ({unit})</span>
                <span className="w-4" />
                <span className="flex-1">Reps</span>
                <span className="w-8" />
                <span className="w-8" />
              </div>

              {ex.sets.map((s, si) => (
                <SetRow
                  key={si}
                  index={si}
                  set={s}
                  unit={unit}
                  onChange={(updated) =>
                    updateExercise(ex.key, {
                      sets: ex.sets.map((os, oi) => (oi === si ? updated : os)),
                    })
                  }
                  onRemove={() =>
                    updateExercise(ex.key, { sets: ex.sets.filter((_, oi) => oi !== si) })
                  }
                />
              ))}

              <button
                type="button"
                onClick={() => addSet(ex.key)}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-grey-light py-2 text-sm font-medium text-green hover:bg-green/5"
              >
                <Plus className="h-4 w-4" /> Add set
              </button>
            </div>
          ))}
        </div>
      )}

      {/* RPE + notes */}
      {exercises.length > 0 && (
        <div className="mt-6 space-y-5 rounded-xl border border-grey-light bg-white p-4 shadow-sm">
          <div>
            <label className="mb-2 flex items-center justify-between text-sm font-medium text-charcoal">
              Session RPE (effort)
              <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-0.5 font-mono text-xs font-bold text-gold-dark">
                <Trophy className="h-3 w-3" /> {rpe}/10
              </span>
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={rpe}
              onChange={(e) => setRpe(parseInt(e.target.value, 10))}
              className="w-full accent-green"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="How did it feel? Any tweaks for next time?"
              className="w-full rounded-lg border border-grey-light px-3 py-2 text-sm text-charcoal focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
            />
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
      )}

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-grey-light bg-white/95 px-4 py-3 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <Link
            href="/dashboard/log-workout/history"
            className="hidden items-center gap-1.5 text-sm font-medium text-grey-mid hover:text-green sm:flex"
          >
            <History className="h-4 w-4" /> History
          </Link>
          <button
            type="button"
            onClick={discard}
            className="ml-auto flex items-center gap-1.5 rounded-lg border border-grey-light px-4 py-2.5 text-sm font-medium text-charcoal hover:bg-grey-light/50"
          >
            <X className="h-4 w-4" /> Discard
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-dark disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Workout
          </button>
        </div>
      </div>
    </div>
  )
}
