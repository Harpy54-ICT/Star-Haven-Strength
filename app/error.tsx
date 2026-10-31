'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-charcoal px-4 text-center">
      <span className="font-display text-sm font-bold uppercase tracking-[0.3em] text-gold">
        Star Haven Strength
      </span>
      <h1 className="mt-6 font-display text-3xl font-extrabold uppercase tracking-wide text-white">
        Something Went Wrong
      </h1>
      <p className="mx-auto mt-3 max-w-md font-body text-sm text-white/70">
        An unexpected error occurred. You can try again, or head back home.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => reset()}
          className="rounded-lg bg-gold px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-charcoal transition-colors hover:bg-gold/90"
        >
          Try Again
        </button>
        <Link
          href="/home"
          className="rounded-lg border border-white/30 px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-white/10"
        >
          Go Home
        </Link>
      </div>
    </main>
  )
}
