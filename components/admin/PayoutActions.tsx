'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PayoutActions({ payoutId }: { payoutId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function act(action: 'approve' | 'reject') {
    if (action === 'reject' && !confirm('Reject this payout request?')) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/payouts/${payoutId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex justify-end gap-2">
      <button
        onClick={() => act('approve')}
        disabled={busy}
        className="rounded-md bg-green px-3 py-1.5 text-xs font-semibold text-gold hover:bg-green-light disabled:opacity-50"
      >
        Approve
      </button>
      <button
        onClick={() => act('reject')}
        disabled={busy}
        className="rounded-md border border-grey-mid px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-grey-light disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  )
}
