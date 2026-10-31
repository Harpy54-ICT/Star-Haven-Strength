'use client'

import { useCallback, useEffect, useState } from 'react'
import { Search, Star, X } from 'lucide-react'

interface Exercise {
  id: string
  name: string
  bodyPart: string | null
  targetMuscle: string | null
  equipment: string | null
  secondaryMuscles: string[]
  instructions: string[]
  gifUrl: string | null
  isFavorite: boolean
}

const BODY_PARTS = ['', 'chest', 'back', 'shoulders', 'upper legs', 'arms', 'core']

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [q, setQ] = useState('')
  const [bodyPart, setBodyPart] = useState('')
  const [selected, setSelected] = useState<Exercise | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (bodyPart) params.set('bodyPart', bodyPart)
    const res = await fetch(`/api/exercises?${params.toString()}`)
    if (res.ok) setExercises((await res.json()).exercises ?? [])
    setLoading(false)
  }, [q, bodyPart])

  useEffect(() => {
    void load()
  }, [load])

  const toggleFav = async (ex: Exercise) => {
    await fetch(`/api/exercises/${ex.id}/favorite`, {
      method: ex.isFavorite ? 'DELETE' : 'POST',
    })
    setExercises((prev) =>
      prev.map((e) => (e.id === ex.id ? { ...e, isFavorite: !e.isFavorite } : e))
    )
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-green">
          Exercise Library
        </h1>

        {/* Filters */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-dark"
              size={16}
            />
            <input
              className="w-full rounded-lg border border-grey-mid py-2 pl-9 pr-3 font-body text-sm"
              placeholder="Search exercises…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select
            value={bodyPart}
            onChange={(e) => setBodyPart(e.target.value)}
            className="rounded-lg border border-grey-mid px-3 py-2 font-body text-sm"
          >
            {BODY_PARTS.map((b) => (
              <option key={b} value={b}>
                {b === '' ? 'All body parts' : b}
              </option>
            ))}
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <p className="mt-6 font-body text-sm text-grey-dark">Loading…</p>
        ) : exercises.length === 0 ? (
          <p className="mt-6 rounded-xl border border-grey-mid bg-white p-6 text-center font-body text-sm text-grey-dark">
            No exercises found. An admin can seed the library via POST
            /api/exercises/seed.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {exercises.map((ex) => (
              <div
                key={ex.id}
                className="group relative cursor-pointer rounded-xl border border-grey-mid bg-white p-4 hover:border-gold"
                onClick={() => setSelected(ex)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFav(ex)
                  }}
                  className="absolute right-3 top-3"
                  aria-label="Toggle favorite"
                >
                  <Star
                    size={18}
                    className={
                      ex.isFavorite
                        ? 'fill-gold text-gold'
                        : 'text-grey-mid'
                    }
                  />
                </button>
                <p className="pr-6 font-display text-sm font-bold text-charcoal">
                  {ex.name}
                </p>
                <p className="mt-1 font-body text-xs capitalize text-grey-dark">
                  {ex.bodyPart ?? '—'}
                </p>
                {ex.equipment && (
                  <span className="mt-2 inline-block rounded-full bg-green/10 px-2 py-0.5 font-display text-[10px] font-bold uppercase text-green">
                    {ex.equipment}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h2 className="font-display text-xl font-bold uppercase tracking-wide text-green">
                {selected.name}
              </h2>
              <button onClick={() => setSelected(null)} aria-label="Close">
                <X size={20} className="text-grey-dark" />
              </button>
            </div>
            {selected.gifUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={selected.gifUrl}
                alt={selected.name}
                className="mt-4 w-full rounded-lg"
              />
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {[selected.bodyPart, selected.targetMuscle, selected.equipment]
                .filter(Boolean)
                .map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-green/10 px-3 py-1 font-display text-xs font-bold uppercase text-green"
                  >
                    {t}
                  </span>
                ))}
            </div>
            {selected.instructions.length > 0 && (
              <ol className="mt-4 list-decimal space-y-1 pl-5 font-body text-sm text-charcoal">
                {selected.instructions.map((ins, i) => (
                  <li key={i}>{ins}</li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
