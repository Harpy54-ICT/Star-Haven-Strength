'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import type { PlanDay, PlanExercise } from '@/lib/workout-plans/types'

interface ClientOption {
  id: string
  name: string
  email: string
}

interface BuilderProps {
  mode: 'create' | 'edit'
  planId?: string
  clients?: ClientOption[]
  initial?: {
    userId: string
    title: string
    description: string
    weeks: number
    days: PlanDay[]
    isActive: boolean
  }
}

function emptyExercise(): PlanExercise {
  return { name: '', sets: 3, reps: '8-10', rpe: null, notes: null }
}

function emptyDay(index: number): PlanDay {
  return { dayLabel: `Day ${index + 1}`, exercises: [emptyExercise()] }
}

export default function WorkoutPlanBuilder({
  mode,
  planId,
  clients = [],
  initial,
}: BuilderProps) {
  const router = useRouter()

  const [userId, setUserId] = useState(initial?.userId ?? '')
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [weeks, setWeeks] = useState(initial?.weeks ?? 4)
  const [isActive, setIsActive] = useState(initial?.isActive ?? false)
  const [days, setDays] = useState<PlanDay[]>(
    initial?.days && initial.days.length > 0 ? initial.days : [emptyDay(0)]
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // --- day / exercise mutations ---
  function updateDayLabel(di: number, label: string) {
    setDays((prev) =>
      prev.map((d, i) => (i === di ? { ...d, dayLabel: label } : d))
    )
  }
  function addDay() {
    setDays((prev) => [...prev, emptyDay(prev.length)])
  }
  function removeDay(di: number) {
    setDays((prev) => prev.filter((_, i) => i !== di))
  }
  function addExercise(di: number) {
    setDays((prev) =>
      prev.map((d, i) =>
        i === di ? { ...d, exercises: [...d.exercises, emptyExercise()] } : d
      )
    )
  }
  function removeExercise(di: number, ei: number) {
    setDays((prev) =>
      prev.map((d, i) =>
        i === di
          ? { ...d, exercises: d.exercises.filter((_, j) => j !== ei) }
          : d
      )
    )
  }
  function updateExercise(
    di: number,
    ei: number,
    patch: Partial<PlanExercise>
  ) {
    setDays((prev) =>
      prev.map((d, i) =>
        i === di
          ? {
              ...d,
              exercises: d.exercises.map((ex, j) =>
                j === ei ? { ...ex, ...patch } : ex
              ),
            }
          : d
      )
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (mode === 'create' && !userId) {
      setError('Please select a client.')
      return
    }
    if (!title.trim()) {
      setError('Please enter a plan title.')
      return
    }
    // Normalize days: drop empty exercise rows, keep labeled days.
    const cleanedDays = days
      .map((d) => ({
        dayLabel: d.dayLabel.trim(),
        exercises: d.exercises
          .filter((ex) => ex.name.trim().length > 0)
          .map((ex) => ({
            name: ex.name.trim(),
            sets: Number(ex.sets) || 0,
            reps: (ex.reps ?? '').trim(),
            rpe: ex.rpe != null && ex.rpe !== ('' as unknown) ? Number(ex.rpe) : null,
            notes: ex.notes?.trim() || null,
          })),
      }))
      .filter((d) => d.dayLabel.length > 0)

    if (cleanedDays.length === 0) {
      setError('Add at least one day with a label.')
      return
    }

    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim() || null,
        weeks: Number(weeks) || 4,
        days: cleanedDays,
        isActive,
      }
      if (mode === 'create') payload.userId = userId

      const url =
        mode === 'create'
          ? '/api/admin/workout-plans'
          : `/api/admin/workout-plans/${planId}`
      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Could not save the plan.')
      }
      const d = await res.json()
      const id = d.plan?.id ?? planId
      router.push(`/dashboard/admin/workout-plans/${id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setSaving(false)
    }
  }

  const inputCls =
    'w-full rounded-lg border border-grey-mid bg-white px-3 py-2 font-body text-sm text-charcoal focus:border-green focus:outline-none focus:ring-1 focus:ring-green'
  const labelCls =
    'mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-grey-dark'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 font-body text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Plan meta */}
      <div className="rounded-xl border border-grey-mid bg-white p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {mode === 'create' && (
            <div className="sm:col-span-2">
              <label className={labelCls}>Client</label>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className={inputCls}
              >
                <option value="">Select a client…</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="sm:col-span-2">
            <label className={labelCls}>Plan Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 4-Week Strength Foundation"
              className={inputCls}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Goals, notes, how to progress…"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Number of Weeks</label>
            <input
              type="number"
              min={1}
              max={12}
              value={weeks}
              onChange={(e) => setWeeks(Number(e.target.value))}
              className={inputCls}
            />
          </div>

          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-2 font-body text-sm text-charcoal">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-grey-mid text-green focus:ring-green"
              />
              Activate this plan (deactivates any other active plan for this
              client)
            </label>
          </div>
        </div>
      </div>

      {/* Day builder */}
      <div className="space-y-4">
        {days.map((day, di) => (
          <div
            key={di}
            className="rounded-xl border border-grey-mid bg-white p-5"
          >
            <div className="mb-4 flex items-center gap-2">
              <GripVertical size={16} className="text-grey-dark" />
              <input
                type="text"
                value={day.dayLabel}
                onChange={(e) => updateDayLabel(di, e.target.value)}
                placeholder="Day label (e.g. Day 1 – Upper Body)"
                className={`${inputCls} font-display font-bold`}
              />
              <button
                type="button"
                onClick={() => removeDay(di)}
                className="rounded-lg border border-grey-mid p-2 text-grey-dark hover:border-red-300 hover:text-red-600"
                aria-label="Remove day"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Exercise rows */}
            <div className="space-y-3">
              {day.exercises.map((ex, ei) => (
                <div
                  key={ei}
                  className="grid grid-cols-1 gap-2 rounded-lg border border-grey-mid/60 bg-grey-light p-3 sm:grid-cols-12"
                >
                  <div className="sm:col-span-4">
                    <label className={labelCls}>Exercise</label>
                    <input
                      type="text"
                      value={ex.name}
                      onChange={(e) =>
                        updateExercise(di, ei, { name: e.target.value })
                      }
                      placeholder="Back Squat"
                      className={inputCls}
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className={labelCls}>Sets</label>
                    <input
                      type="number"
                      min={0}
                      value={ex.sets}
                      onChange={(e) =>
                        updateExercise(di, ei, {
                          sets: Number(e.target.value),
                        })
                      }
                      className={inputCls}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Reps</label>
                    <input
                      type="text"
                      value={ex.reps}
                      onChange={(e) =>
                        updateExercise(di, ei, { reps: e.target.value })
                      }
                      placeholder="8-10"
                      className={inputCls}
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className={labelCls}>RPE</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={ex.rpe ?? ''}
                      onChange={(e) =>
                        updateExercise(di, ei, {
                          rpe:
                            e.target.value === ''
                              ? null
                              : Number(e.target.value),
                        })
                      }
                      placeholder="—"
                      className={inputCls}
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className={labelCls}>Notes</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={ex.notes ?? ''}
                        onChange={(e) =>
                          updateExercise(di, ei, {
                            notes: e.target.value || null,
                          })
                        }
                        placeholder="Tempo, cues…"
                        className={inputCls}
                      />
                      <button
                        type="button"
                        onClick={() => removeExercise(di, ei)}
                        className="shrink-0 rounded-lg border border-grey-mid p-2 text-grey-dark hover:border-red-300 hover:text-red-600"
                        aria-label="Remove exercise"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addExercise(di)}
              className="mt-3 inline-flex items-center gap-1 rounded-lg border border-green px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wide text-green hover:bg-green hover:text-gold"
            >
              <Plus size={14} /> Add Exercise
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addDay}
          className="inline-flex items-center gap-1 rounded-lg bg-green px-4 py-2 font-display text-sm font-bold uppercase tracking-wide text-gold hover:bg-green-light"
        >
          <Plus size={16} /> Add Day
        </button>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-gold px-6 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-charcoal hover:bg-gold-dark disabled:opacity-60"
        >
          {saving
            ? 'Saving…'
            : mode === 'create'
              ? 'Create Plan'
              : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-grey-mid px-6 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-grey-dark hover:bg-grey-light"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
