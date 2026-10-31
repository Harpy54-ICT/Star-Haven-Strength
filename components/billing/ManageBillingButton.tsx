'use client'

import { useState } from 'react'
import { CreditCard, Loader2 } from 'lucide-react'

export default function ManageBillingButton({
  className,
  label = 'Manage Billing',
}: {
  className?: string
  label?: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function openPortal() {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.url) {
        setError(data.error || 'Could not open billing portal.')
        setLoading(false)
        return
      }
      window.location.href = data.url
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={openPortal}
        disabled={loading}
        className={
          className ??
          'inline-flex items-center gap-2 rounded-lg bg-green px-5 py-3 font-display font-semibold uppercase tracking-wide text-gold transition-colors hover:bg-green-light disabled:opacity-70'
        }
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            Opening…
          </>
        ) : (
          <>
            <CreditCard size={18} />
            {label}
          </>
        )}
      </button>
      {error && (
        <p className="mt-2 font-body text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
