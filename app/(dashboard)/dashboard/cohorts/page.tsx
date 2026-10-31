'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, Loader2 } from 'lucide-react'

interface Cohort {
  id: string
  name: string
  description: string | null
  durationWeeks: number
  priceCents: number
  maxClients: number | null
  startDate: string | null
  status: string
  enrolledCount: number
  isFull: boolean
  myStatus: string | null
}

function money(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

export default function CohortsBrowsePage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/cohorts')
      if (!res.ok) throw new Error('Failed to load cohorts')
      const data = await res.json()
      setCohorts(data.cohorts ?? [])
      setError(null)
    } catch {
      setError('Could not load cohorts. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function enroll(id: string) {
    setBusyId(id)
    try {
      await fetch(`/api/cohorts/${id}/enroll`, { method: 'POST' })
      await load()
    } finally {
      setBusyId(null)
    }
  }

  async function leave(id: string) {
    setBusyId(id)
    try {
      await fetch(`/api/cohorts/${id}/enroll`, { method: 'DELETE' })
      await load()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-3">
        <Users className="text-gold" size={28} />
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal">
          Cohort Programs
        </h1>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 font-body text-grey-dark">
          <Loader2 className="animate-spin" size={18} /> Loading…
        </div>
      ) : error ? (
        <p className="font-body text-sm text-red-600">{error}</p>
      ) : cohorts.length === 0 ? (
        <p className="font-body text-grey-dark">
          No open cohorts right now. Check back soon!
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {cohorts.map((c) => {
            const enrolled =
              c.myStatus === 'active' || c.myStatus === 'assigned'
            const waitlisted = c.myStatus === 'waitlisted'
            return (
              <div
                key={c.id}
                className="flex flex-col rounded-xl border border-grey-mid bg-white p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-lg font-bold text-charcoal">
                    {c.name}
                  </h2>
                  <span className="shrink-0 rounded-full bg-green/10 px-2 py-0.5 font-display text-[10px] font-bold uppercase text-green">
                    {c.status}
                  </span>
                </div>
                {c.description && (
                  <p className="mt-2 flex-1 font-body text-sm text-grey-dark">
                    {c.description}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-grey-dark">
                  <span>{c.durationWeeks} wks</span>
                  <span>{money(c.priceCents)}</span>
                  <span>
                    {c.enrolledCount}
                    {c.maxClients != null ? `/${c.maxClients}` : ''} enrolled
                  </span>
                  {c.startDate && (
                    <span>
                      Starts {new Date(c.startDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="mt-5 flex items-center gap-3">
                  {enrolled ? (
                    <button
                      onClick={() => leave(c.id)}
                      disabled={busyId === c.id}
                      className="rounded-lg border border-grey-mid px-4 py-2 font-body text-sm font-semibold text-charcoal transition-colors hover:bg-grey-light disabled:opacity-50"
                    >
                      {busyId === c.id ? 'Leaving…' : 'Leave'}
                    </button>
                  ) : waitlisted ? (
                    <button
                      onClick={() => leave(c.id)}
                      disabled={busyId === c.id}
                      className="rounded-lg border border-gold px-4 py-2 font-body text-sm font-semibold text-gold-dark transition-colors hover:bg-gold/10 disabled:opacity-50"
                    >
                      {busyId === c.id ? 'Leaving…' : 'On waitlist — Leave'}
                    </button>
                  ) : (
                    <button
                      onClick={() => enroll(c.id)}
                      disabled={busyId === c.id}
                      className="rounded-lg bg-green px-4 py-2 font-body text-sm font-semibold text-white transition-colors hover:bg-green-light disabled:opacity-50"
                    >
                      {busyId === c.id
                        ? 'Joining…'
                        : c.isFull
                          ? 'Join waitlist'
                          : 'Enroll'}
                    </button>
                  )}
                  {(enrolled || waitlisted) && (
                    <Link
                      href={`/dashboard/cohorts/${c.id}`}
                      className="font-body text-sm font-semibold text-green hover:text-green-light"
                    >
                      View &amp; discuss →
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
