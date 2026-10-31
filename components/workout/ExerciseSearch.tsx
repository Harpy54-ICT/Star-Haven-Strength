'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, Plus, Loader2 } from 'lucide-react'

export interface ExerciseResult {
  id: string
  name: string
  bodyPart: string | null
  targetMuscle: string | null
  equipment: string | null
}

interface ExerciseSearchProps {
  onSelect: (exercise: { id: string | null; name: string }) => void
}

export function ExerciseSearch({ onSelect }: ExerciseSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ExerciseResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/exercises/search?q=${encodeURIComponent(q)}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data.exercises || [])
          setOpen(true)
        }
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  const addCustom = () => {
    const name = query.trim()
    if (!name) return
    onSelect({ id: null, name })
    setQuery('')
    setResults([])
    setOpen(false)
  }

  const pick = (ex: ExerciseResult) => {
    onSelect({ id: ex.id, name: ex.name })
    setQuery('')
    setResults([])
    setOpen(false)
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grey-mid" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search exercises (e.g. bench press)…"
          className="w-full rounded-lg border border-grey-light bg-white py-2.5 pl-10 pr-10 text-sm text-charcoal focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-grey-mid" />
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-grey-light bg-white shadow-lg">
          <ul className="max-h-64 overflow-y-auto">
            {results.map((ex) => (
              <li key={ex.id}>
                <button
                  type="button"
                  onClick={() => pick(ex)}
                  className="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-grey-light/40"
                >
                  <Plus className="mt-0.5 h-4 w-4 shrink-0 text-green" />
                  <span>
                    <span className="block text-sm font-medium text-charcoal">{ex.name}</span>
                    {(ex.targetMuscle || ex.bodyPart) && (
                      <span className="block text-xs text-grey-mid">
                        {[ex.targetMuscle, ex.equipment].filter(Boolean).join(' · ')}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={addCustom}
            className="flex w-full items-center gap-2 border-t border-grey-light px-4 py-2.5 text-left text-sm font-medium text-green hover:bg-grey-light/40"
          >
            <Plus className="h-4 w-4" />
            Add &ldquo;{query.trim()}&rdquo; as custom exercise
          </button>
        </div>
      )}
    </div>
  )
}
