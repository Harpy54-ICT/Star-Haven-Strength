'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

/** Small client delete button for a Coach's Office post. */
export default function DeletePostButton({
  id,
  title,
}: {
  id: string
  title: string
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function onDelete() {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/coach-posts/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Failed to delete.')
      }
      router.refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete.')
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={busy}
      className="inline-flex items-center gap-1 font-body text-xs font-medium text-red-600 transition-colors hover:text-red-800 disabled:opacity-50"
    >
      <Trash2 size={14} />
      {busy ? 'Deleting…' : 'Delete'}
    </button>
  )
}
