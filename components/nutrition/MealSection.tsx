'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react'

export interface FoodEntry {
  id?: string
  mealName: string
  calories?: number | null
  proteinG?: number | null
  carbsG?: number | null
  fatG?: number | null
}

/**
 * Collapsible meal section with food rows and an inline add-food form.
 */
export default function MealSection({
  title,
  entries,
  onAdd,
  onRemove,
}: {
  title: string
  entries: FoodEntry[]
  onAdd: (entry: FoodEntry) => void
  onRemove?: (index: number) => void
}) {
  const [open, setOpen] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FoodEntry>({
    mealName: '',
    calories: 0,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
  })

  const totalCals = entries.reduce((s, e) => s + (e.calories ?? 0), 0)

  const submit = () => {
    if (!form.mealName.trim()) return
    onAdd({
      mealName: form.mealName.trim(),
      calories: Number(form.calories) || 0,
      proteinG: Number(form.proteinG) || 0,
      carbsG: Number(form.carbsG) || 0,
      fatG: Number(form.fatG) || 0,
    })
    setForm({ mealName: '', calories: 0, proteinG: 0, carbsG: 0, fatG: 0 })
    setShowForm(false)
  }

  return (
    <div className="rounded-xl border border-grey-mid bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <span className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-green">
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          {title}
        </span>
        <span className="font-mono text-xs text-grey-dark">{totalCals} kcal</span>
      </button>

      {open && (
        <div className="border-t border-grey-mid px-4 py-3">
          {entries.length === 0 ? (
            <p className="py-2 font-body text-xs text-grey-dark">
              No food logged yet.
            </p>
          ) : (
            <ul className="divide-y divide-grey-mid">
              {entries.map((e, i) => (
                <li key={e.id ?? i} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-body text-sm font-medium text-charcoal">
                      {e.mealName}
                    </p>
                    <p className="font-mono text-xs text-grey-dark">
                      {e.calories ?? 0} kcal · P{e.proteinG ?? 0} C{e.carbsG ?? 0} F
                      {e.fatG ?? 0}
                    </p>
                  </div>
                  {onRemove && (
                    <button
                      type="button"
                      onClick={() => onRemove(i)}
                      className="text-grey-dark hover:text-red-600"
                      aria-label="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {showForm ? (
            <div className="mt-3 space-y-2 rounded-lg bg-grey-light p-3">
              <input
                className="w-full rounded-lg border border-grey-mid px-3 py-2 font-body text-sm"
                placeholder="Food name"
                value={form.mealName}
                onChange={(e) => setForm({ ...form, mealName: e.target.value })}
              />
              <div className="grid grid-cols-4 gap-2">
                {(['calories', 'proteinG', 'carbsG', 'fatG'] as const).map((k) => (
                  <input
                    key={k}
                    type="number"
                    className="w-full rounded-lg border border-grey-mid px-2 py-2 font-mono text-sm"
                    placeholder={k === 'calories' ? 'kcal' : k.replace('G', '')}
                    value={form[k] ?? ''}
                    onChange={(e) =>
                      setForm({ ...form, [k]: Number(e.target.value) })
                    }
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={submit}
                  className="rounded-lg bg-green px-4 py-2 font-display text-xs font-bold uppercase tracking-wide text-gold hover:bg-green-light"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-grey-mid px-4 py-2 font-display text-xs font-bold uppercase tracking-wide text-grey-dark"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-3 flex items-center gap-1 font-display text-xs font-bold uppercase tracking-wide text-green hover:text-green-light"
            >
              <Plus size={14} /> Add Food
            </button>
          )}
        </div>
      )}
    </div>
  )
}
