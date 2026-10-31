'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Power, Trash2 } from 'lucide-react'

export default function WorkoutPlanActions({
  planId,
  isActive,
}: {
  planId: string
  isActive: boolean
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function toggleActive() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/workout-plans/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Could not update the plan.')
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        'Delete this workout plan? This cannot be undone.'
      )
    )
      return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/workout-plans/${planId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Could not delete the plan.')
      }
      router.push('/dashboard/admin/workout-plans')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={toggleActive}
          disabled={busy}
          className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 font-display text-sm font-bold uppercase tracking-wide disabled:opacity-60 ${
            isActive
              ? 'border border-grey-mid text-grey-dark hover:bg-grey-light'
              : 'bg-green text-gold hover:bg-green-light'
          }`}
        >
          <Power size={16} />
          {isActive ? 'Deactivate' : 'Activate'}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-4 py-2 font-display text-sm font-bold uppercase tracking-wide text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          <Trash2 size={16} /> Delete
        </button>
      </div>
      {error && (
        <p className="font-body text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}
