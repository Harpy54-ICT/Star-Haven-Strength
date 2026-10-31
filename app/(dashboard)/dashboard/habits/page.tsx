'use client'

import { useCallback, useEffect, useState } from 'react'
import { Flame, Plus, Check, Trash2 } from 'lucide-react'

interface Habit {
  id: string
  habitName: string
  frequency: string
  category: string | null
  currentStreak: number
  longestStreak: number
  isActive: boolean
  completedToday: boolean
}

export default function HabitsPage() {
  const [view, setView] = useState<'today' | 'manage'>('today')
  const [habits, setHabits] = useState<Habit[]>([])
  const [name, setName] = useState('')

  const load = useCallback(async () => {
    const res = await fetch('/api/habits')
    if (res.ok) setHabits((await res.json()).habits ?? [])
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const active = habits.filter((h) => h.isActive)
  const doneCount = active.filter((h) => h.completedToday).length
  const ringPct = active.length > 0 ? (doneCount / active.length) * 100 : 0

  const toggle = async (id: string) => {
    await fetch(`/api/habits/${id}/log`, { method: 'POST' })
    await load()
  }

  const create = async () => {
    if (!name.trim()) return
    await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ habitName: name.trim() }),
    })
    setName('')
    await load()
  }

  const remove = async (id: string) => {
    await fetch(`/api/habits/${id}`, { method: 'DELETE' })
    await load()
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-green">
          Habits
        </h1>

        <div className="mt-6 flex gap-2">
          {(['today', 'manage'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setView(t)}
              className={`rounded-lg px-4 py-2 font-display text-sm font-bold uppercase tracking-wide ${
                view === t ? 'bg-green text-gold' : 'border border-grey-mid text-grey-dark'
              }`}
            >
              {t === 'today' ? 'Today' : 'Manage'}
            </button>
          ))}
        </div>

        {view === 'today' ? (
          <div className="mt-6 space-y-4">
            {/* Progress ring */}
            <div className="flex items-center gap-4 rounded-xl border border-grey-mid bg-white p-5">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#C9A84C ${ringPct}%, #e5e7eb ${ringPct}%)`,
                }}
              >
                <div className="flex h-15 w-15 items-center justify-center rounded-full bg-white p-3">
                  <span className="font-mono text-sm font-bold text-charcoal">
                    {doneCount}/{active.length}
                  </span>
                </div>
              </div>
              <div>
                <p className="font-display text-lg font-bold text-green">
                  {doneCount} of {active.length} done today
                </p>
                <p className="font-body text-sm text-grey-dark">
                  {new Date().toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {active.length === 0 ? (
              <p className="rounded-xl border border-grey-mid bg-white p-6 text-center font-body text-sm text-grey-dark">
                No active habits. Add some in the Manage tab.
              </p>
            ) : (
              <ul className="space-y-2">
                {active.map((h) => (
                  <li
                    key={h.id}
                    className="flex items-center justify-between rounded-xl border border-grey-mid bg-white px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggle(h.id)}
                        className={`flex h-7 w-7 items-center justify-center rounded-md border-2 ${
                          h.completedToday
                            ? 'border-green bg-green text-gold'
                            : 'border-grey-mid text-transparent'
                        }`}
                        aria-label="Toggle habit"
                      >
                        <Check size={16} />
                      </button>
                      <span className="font-body text-sm font-medium text-charcoal">
                        {h.habitName}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 font-mono text-xs text-gold-dark">
                      <Flame size={14} /> {h.currentStreak} day
                      {h.currentStreak === 1 ? '' : 's'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg border border-grey-mid px-3 py-2 font-body text-sm"
                placeholder="New habit name…"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && create()}
              />
              <button
                onClick={create}
                className="flex items-center gap-1 rounded-lg bg-green px-4 py-2 font-display text-xs font-bold uppercase tracking-wide text-gold"
              >
                <Plus size={14} /> Add
              </button>
            </div>
            <ul className="space-y-2">
              {habits.map((h) => (
                <li
                  key={h.id}
                  className={`flex items-center justify-between rounded-xl border border-grey-mid px-4 py-3 ${
                    h.isActive ? 'bg-white' : 'bg-grey-light opacity-60'
                  }`}
                >
                  <div>
                    <p className="font-body text-sm font-medium text-charcoal">
                      {h.habitName}
                    </p>
                    <p className="font-mono text-xs text-grey-dark">
                      Best streak: {h.longestStreak} days
                    </p>
                  </div>
                  {h.isActive && (
                    <button
                      onClick={() => remove(h.id)}
                      className="text-grey-dark hover:text-red-600"
                      aria-label="Delete habit"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
