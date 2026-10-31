'use client'

import { useEffect, useState } from 'react'

interface CheckIn {
  id: string
  weekStart: string
  mood: number | null
  energy: number | null
  sleepQuality: number | null
  stress: number | null
  soreness: number | null
  sleepHours: number | null
  wentWell: string | null
  challenging: string | null
  nextWeekFocus: string | null
}

const SCALES = [
  { key: 'mood', label: 'Mood' },
  { key: 'energy', label: 'Energy' },
  { key: 'sleepQuality', label: 'Sleep Quality' },
  { key: 'stress', label: 'Stress' },
  { key: 'soreness', label: 'Soreness' },
] as const

export default function CheckInsPage() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [form, setForm] = useState<Record<string, number>>({
    mood: 3,
    energy: 3,
    sleepQuality: 3,
    stress: 3,
    soreness: 3,
  })
  const [sleepHours, setSleepHours] = useState(7)
  const [wentWell, setWentWell] = useState('')
  const [challenging, setChallenging] = useState('')
  const [nextWeekFocus, setNextWeekFocus] = useState('')
  const [msg, setMsg] = useState('')

  const load = () =>
    fetch('/api/check-in')
      .then((r) => (r.ok ? r.json() : { checkIns: [] }))
      .then((d) => setCheckIns(d.checkIns ?? []))

  useEffect(() => {
    void load()
  }, [])

  const submit = async () => {
    setMsg('')
    const res = await fetch('/api/check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        sleepHours,
        wentWell,
        challenging,
        nextWeekFocus,
      }),
    })
    setMsg(res.ok ? 'Check-in saved!' : 'Something went wrong.')
    if (res.ok) await load()
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-green">
          Weekly Check-In
        </h1>

        <div className="mt-6 space-y-4 rounded-xl border border-grey-mid bg-white p-5">
          {SCALES.map((s) => (
            <div key={s.key}>
              <div className="mb-1 flex justify-between">
                <label className="font-display text-xs font-bold uppercase tracking-wide text-charcoal">
                  {s.label}
                </label>
                <span className="font-mono text-sm text-gold-dark">
                  {form[s.key]}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={form[s.key]}
                onChange={(e) =>
                  setForm({ ...form, [s.key]: Number(e.target.value) })
                }
                className="w-full accent-green"
              />
            </div>
          ))}

          <div>
            <label className="font-display text-xs font-bold uppercase tracking-wide text-charcoal">
              Sleep (hours/night)
            </label>
            <input
              type="number"
              step="0.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-grey-mid px-3 py-2 font-mono text-sm"
            />
          </div>

          {[
            { label: 'What went well?', v: wentWell, set: setWentWell },
            { label: 'What was challenging?', v: challenging, set: setChallenging },
            { label: 'Focus for next week', v: nextWeekFocus, set: setNextWeekFocus },
          ].map((f) => (
            <div key={f.label}>
              <label className="font-display text-xs font-bold uppercase tracking-wide text-charcoal">
                {f.label}
              </label>
              <textarea
                value={f.v}
                onChange={(e) => f.set(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-grey-mid px-3 py-2 font-body text-sm"
              />
            </div>
          ))}

          <button
            onClick={submit}
            className="w-full rounded-lg bg-green px-4 py-3 font-display text-sm font-bold uppercase tracking-wide text-gold hover:bg-green-light"
          >
            Submit Check-In
          </button>
          {msg && (
            <p className="text-center font-body text-sm text-green">{msg}</p>
          )}
        </div>

        {/* History */}
        <h2 className="mt-8 font-display text-xl font-bold text-charcoal">
          History
        </h2>
        <div className="mt-4 space-y-3">
          {checkIns.length === 0 ? (
            <p className="font-body text-sm text-grey-dark">
              No check-ins yet.
            </p>
          ) : (
            checkIns.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-grey-mid bg-white p-4"
              >
                <p className="font-display text-sm font-bold uppercase tracking-wide text-green">
                  Week of {new Date(c.weekStart).toLocaleDateString()}
                </p>
                <p className="mt-1 font-mono text-xs text-grey-dark">
                  Mood {c.mood ?? '—'} · Energy {c.energy ?? '—'} · Sleep{' '}
                  {c.sleepHours ?? '—'}h
                </p>
                {c.wentWell && (
                  <p className="mt-2 font-body text-sm text-charcoal">
                    <span className="font-semibold">Went well:</span> {c.wentWell}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
