'use client'

import { Check, Trash2 } from 'lucide-react'

export interface WorkoutSet {
  weight: number
  reps: number
  completed: boolean
}

interface SetRowProps {
  index: number
  set: WorkoutSet
  unit: 'lbs' | 'kg'
  onChange: (set: WorkoutSet) => void
  onRemove: () => void
}

export function SetRow({ index, set, unit, onChange, onRemove }: SetRowProps) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      <span className="font-mono text-sm font-semibold text-grey-mid w-6 text-center">
        {index + 1}
      </span>

      <div className="flex-1">
        <input
          type="number"
          inputMode="decimal"
          min={0}
          value={set.weight === 0 ? '' : set.weight}
          onChange={(e) => onChange({ ...set, weight: parseFloat(e.target.value) || 0 })}
          placeholder={`Weight (${unit})`}
          className="w-full rounded-md border border-grey-light bg-white px-2.5 py-1.5 font-mono text-sm text-charcoal focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
        />
      </div>

      <span className="text-grey-mid text-sm">×</span>

      <div className="flex-1">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={set.reps === 0 ? '' : set.reps}
          onChange={(e) => onChange({ ...set, reps: parseInt(e.target.value, 10) || 0 })}
          placeholder="Reps"
          className="w-full rounded-md border border-grey-light bg-white px-2.5 py-1.5 font-mono text-sm text-charcoal focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
        />
      </div>

      <button
        type="button"
        onClick={() => onChange({ ...set, completed: !set.completed })}
        aria-label={set.completed ? 'Mark set incomplete' : 'Mark set complete'}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors ${
          set.completed
            ? 'border-green bg-green text-white'
            : 'border-grey-light bg-white text-grey-mid hover:border-green'
        }`}
      >
        <Check className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove set"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-grey-mid hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
