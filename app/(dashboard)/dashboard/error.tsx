'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/15">
        <AlertTriangle className="text-gold-dark" size={28} />
      </span>
      <h1 className="mt-5 font-display text-2xl font-bold uppercase tracking-wide text-charcoal">
        Something Went Wrong
      </h1>
      <p className="mx-auto mt-2 max-w-md font-body text-sm text-grey-dark">
        We couldn&rsquo;t load this part of your dashboard. Try again, or return
        to the overview.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="rounded-lg bg-green px-5 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-gold transition-colors hover:bg-green-light"
        >
          Try Again
        </button>
        <Link
          href="/dashboard"
          className="rounded-lg border border-grey-mid px-5 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-charcoal transition-colors hover:bg-grey-light"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
