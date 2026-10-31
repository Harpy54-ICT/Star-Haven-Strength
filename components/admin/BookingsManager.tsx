'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, Video } from 'lucide-react'

interface Booking {
  id: string
  startTime: string
  endTime: string
  status: string
  googleMeetLink: string | null
  coachNotes: string | null
  user: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
  }
}

const STATUS_ACTIONS: { label: string; status: string }[] = [
  { label: 'Confirm', status: 'confirmed' },
  { label: 'Complete', status: 'completed' },
  { label: 'Cancel', status: 'cancelled' },
]

function fullName(u: Booking['user']): string {
  return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email
}

function statusClass(status: string): string {
  switch (status) {
    case 'confirmed':
    case 'scheduled':
      return 'bg-green/10 text-green'
    case 'completed':
      return 'bg-gold/20 text-gold-dark'
    case 'cancelled':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-grey-light text-grey-dark'
  }
}

function BookingRow({
  b,
  onChange,
  busy,
}: {
  b: Booking
  onChange: (id: string, status: string) => void
  busy: boolean
}) {
  return (
    <div className="rounded-xl border border-grey-mid bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-display text-sm font-bold uppercase tracking-wide text-green">
            {fullName(b.user)}
          </p>
          <p className="font-mono text-xs text-grey-dark">
            {new Date(b.startTime).toLocaleString()} –{' '}
            {new Date(b.endTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 font-display text-[10px] font-bold uppercase tracking-wide ${statusClass(
            b.status
          )}`}
        >
          {b.status}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        {b.googleMeetLink && (
          <a
            href={b.googleMeetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-body text-xs font-semibold text-green hover:underline"
          >
            <Video size={14} /> Meeting link
          </a>
        )}
        {b.coachNotes && (
          <span className="font-body text-xs text-grey-dark">
            Notes: {b.coachNotes}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {STATUS_ACTIONS.map((a) => (
          <button
            key={a.status}
            onClick={() => onChange(b.id, a.status)}
            disabled={busy || b.status === a.status}
            className="rounded-md border border-grey-mid px-3 py-1.5 font-body text-xs font-semibold text-charcoal transition-colors hover:bg-grey-light disabled:opacity-40"
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function BookingsManager() {
  const [upcoming, setUpcoming] = useState<Booking[]>([])
  const [past, setPast] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/bookings')
      if (res.ok) {
        const data = await res.json()
        setUpcoming(data.upcoming ?? [])
        setPast(data.past ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function changeStatus(id: string, status: string) {
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) await load()
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 font-body text-grey-dark">
        <Loader2 className="animate-spin" size={18} /> Loading…
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-green">
          Upcoming ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <p className="rounded-xl border border-grey-mid bg-white p-6 font-body text-sm text-grey-dark">
            No upcoming sessions.
          </p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((b) => (
              <BookingRow
                key={b.id}
                b={b}
                onChange={changeStatus}
                busy={busyId === b.id}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-grey-dark">
          Past ({past.length})
        </h2>
        {past.length === 0 ? (
          <p className="rounded-xl border border-grey-mid bg-white p-6 font-body text-sm text-grey-dark">
            No past sessions.
          </p>
        ) : (
          <div className="space-y-3">
            {past.map((b) => (
              <BookingRow
                key={b.id}
                b={b}
                onChange={changeStatus}
                busy={busyId === b.id}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
