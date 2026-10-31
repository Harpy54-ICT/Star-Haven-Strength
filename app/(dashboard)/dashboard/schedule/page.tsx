'use client'

import { useEffect, useState } from 'react'
import { CalendarPlus, Video, X } from 'lucide-react'

interface Booking {
  id: string
  startTime: string
  endTime: string
  status: string
  googleMeetLink: string | null
  coachNotes: string | null
}

export default function SchedulePage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [showForm, setShowForm] = useState(false)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('09:00')
  const [duration, setDuration] = useState(60)
  const [notes, setNotes] = useState('')
  const [msg, setMsg] = useState('')

  const load = () =>
    fetch('/api/bookings')
      .then((r) => (r.ok ? r.json() : { bookings: [] }))
      .then((d) => setBookings(d.bookings ?? []))

  useEffect(() => {
    void load()
  }, [])

  const submit = async () => {
    setMsg('')
    if (!date) {
      setMsg('Pick a date.')
      return
    }
    const start = new Date(`${date}T${time}:00`)
    const end = new Date(start.getTime() + duration * 60000)
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        notes,
      }),
    })
    if (res.ok) {
      setShowForm(false)
      setNotes('')
      setMsg('Session requested!')
      await load()
    } else {
      setMsg('Could not create booking.')
    }
  }

  const cancel = async (id: string) => {
    await fetch(`/api/bookings/${id}`, { method: 'DELETE' })
    await load()
  }

  const now = Date.now()
  const upcoming = bookings.filter(
    (b) => new Date(b.startTime).getTime() >= now && b.status !== 'cancelled'
  )
  const past = bookings.filter(
    (b) => new Date(b.startTime).getTime() < now || b.status === 'cancelled'
  )

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-green">
            Schedule
          </h1>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-1 rounded-lg bg-green px-4 py-2 font-display text-xs font-bold uppercase tracking-wide text-gold"
          >
            <CalendarPlus size={14} /> Request Session
          </button>
        </div>

        {showForm && (
          <div className="mt-6 space-y-3 rounded-xl border border-grey-mid bg-white p-5">
            <div className="flex flex-wrap gap-2">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-lg border border-grey-mid px-3 py-2 font-body text-sm"
              />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="rounded-lg border border-grey-mid px-3 py-2 font-body text-sm"
              />
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="rounded-lg border border-grey-mid px-3 py-2 font-body text-sm"
              >
                <option value={30}>30 min</option>
                <option value={60}>60 min</option>
                <option value={90}>90 min</option>
              </select>
            </div>
            <textarea
              className="w-full rounded-lg border border-grey-mid px-3 py-2 font-body text-sm"
              placeholder="Notes for your coach (optional)"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <button
              onClick={submit}
              className="rounded-lg bg-gold px-4 py-2 font-display text-xs font-bold uppercase tracking-wide text-green"
            >
              Submit Request
            </button>
            {msg && <p className="font-body text-sm text-green">{msg}</p>}
          </div>
        )}

        <h2 className="mt-8 font-display text-xl font-bold text-charcoal">
          Upcoming
        </h2>
        <div className="mt-3 space-y-3">
          {upcoming.length === 0 ? (
            <p className="font-body text-sm text-grey-dark">
              No upcoming sessions.
            </p>
          ) : (
            upcoming.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-xl border border-grey-mid bg-white p-4"
              >
                <div>
                  <p className="font-display text-sm font-bold uppercase tracking-wide text-green">
                    {fmt(b.startTime)}
                  </p>
                  <p className="font-mono text-xs text-grey-dark">{b.status}</p>
                  {b.coachNotes && (
                    <p className="mt-1 font-body text-sm text-charcoal">
                      {b.coachNotes}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {b.googleMeetLink && (
                    <a
                      href={b.googleMeetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded-lg bg-green px-3 py-1.5 font-display text-xs font-bold uppercase text-gold"
                    >
                      <Video size={14} /> Join
                    </a>
                  )}
                  <button
                    onClick={() => cancel(b.id)}
                    className="text-grey-dark hover:text-red-600"
                    aria-label="Cancel"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {past.length > 0 && (
          <>
            <h2 className="mt-8 font-display text-xl font-bold text-charcoal">
              Past &amp; Cancelled
            </h2>
            <div className="mt-3 space-y-2">
              {past.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-xl border border-grey-mid bg-grey-light p-3 opacity-70"
                >
                  <p className="font-body text-sm text-charcoal">
                    {fmt(b.startTime)}
                  </p>
                  <span className="font-mono text-xs text-grey-dark">
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
