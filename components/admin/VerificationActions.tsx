'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X } from 'lucide-react'

interface VerificationActionsProps {
  userId: string
}

/**
 * Approve / reject controls for a pending military verification. Reject opens a
 * small inline modal to capture an optional reason.
 */
export default function VerificationActions({ userId }: VerificationActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [showReject, setShowReject] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function approve() {
    setLoading('approve')
    setError(null)
    try {
      const res = await fetch('/api/military-verify/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Failed to approve')
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(null)
    }
  }

  async function reject() {
    setLoading('reject')
    setError(null)
    try {
      const res = await fetch('/api/military-verify/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reason: reason.trim() || undefined }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Failed to reject')
      }
      setShowReject(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={approve}
          disabled={loading !== null}
          className="inline-flex items-center gap-1.5 rounded-lg bg-green px-3 py-2 font-body text-sm font-semibold text-white transition-colors hover:bg-green-dark disabled:opacity-50"
        >
          <Check size={16} />
          {loading === 'approve' ? 'Approving…' : 'Approve'}
        </button>
        <button
          type="button"
          onClick={() => setShowReject(true)}
          disabled={loading !== null}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-2 font-body text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
        >
          <X size={16} />
          Reject
        </button>
      </div>
      {error && <p className="font-body text-xs text-red-600">{error}</p>}

      {showReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-charcoal/60"
            onClick={() => !loading && setShowReject(false)}
          />
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="font-display text-lg font-bold text-charcoal">
              Reject Verification
            </h3>
            <p className="mt-1 font-body text-sm text-grey-dark">
              Optionally let the member know why their verification was not
              approved.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="Reason (optional)"
              className="mt-3 w-full rounded-lg border border-grey-mid px-3 py-2 font-body text-sm text-charcoal focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReject(false)}
                disabled={loading !== null}
                className="rounded-lg border border-grey-mid px-4 py-2 font-body text-sm font-medium text-grey-dark hover:bg-grey-light disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={reject}
                disabled={loading !== null}
                className="rounded-lg bg-red-600 px-4 py-2 font-body text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading === 'reject' ? 'Rejecting…' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
