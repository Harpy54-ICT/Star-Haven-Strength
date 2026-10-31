'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Heart,
  Flame,
  Activity,
  Save,
  X,
  Loader2,
  Footprints,
  Bike,
  Waves,
  Mountain,
  Dumbbell,
} from 'lucide-react'

const CARDIO_TYPES = [
  { value: 'Running', icon: Footprints },
  { value: 'Cycling', icon: Bike },
  { value: 'Swimming', icon: Waves },
  { value: 'Rowing', icon: Activity },
  { value: 'Walking', icon: Footprints },
  { value: 'Hiking', icon: Mountain },
  { value: 'Elliptical', icon: Activity },
  { value: 'Other', icon: Dumbbell },
]

export default function LogCardioPage() {
  const router = useRouter()
  const [cardioType, setCardioType] = useState('Running')
  const [minutes, setMinutes] = useState('')
  const [seconds, setSeconds] = useState('')
  const [distance, setDistance] = useState('')
  const [distanceUnit, setDistanceUnit] = useState<'mi' | 'km'>('mi')
  const [calories, setCalories] = useState('')
  const [heartRate, setHeartRate] = useState('')
  const [intensity, setIntensity] = useState(5)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = async () => {
    setError(null)
    const mins = parseInt(minutes, 10) || 0
    const secs = parseInt(seconds, 10) || 0
    const durationSeconds = mins * 60 + secs
    if (durationSeconds <= 0) {
      setError('Enter a duration greater than zero.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/logs/cardio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardioType,
          durationSeconds,
          distance: distance ? parseFloat(distance) : null,
          distanceUnit,
          calories: calories ? parseInt(calories, 10) : null,
          heartRateAvg: heartRate ? parseInt(heartRate, 10) : null,
          intensity,
          notes: notes.trim() || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save cardio session')
      }
      router.push('/dashboard?cardio=1')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl pb-28">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-charcoal">Log Cardio</h1>
        <p className="text-sm text-grey-mid">Track runs, rides, swims and more.</p>
      </div>

      <div className="space-y-6 rounded-xl border border-grey-light bg-white p-5 shadow-sm">
        {/* Type */}
        <div>
          <label className="mb-2 block text-sm font-medium text-charcoal">Activity</label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {CARDIO_TYPES.map(({ value, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setCardioType(value)}
                className={`flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-medium transition-colors ${
                  cardioType === value
                    ? 'border-green bg-green/10 text-green-dark'
                    : 'border-grey-light bg-white text-grey-mid hover:border-green'
                }`}
              >
                <Icon className="h-5 w-5" />
                {value}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="mb-2 block text-sm font-medium text-charcoal">Duration</label>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="00"
                className="w-full rounded-lg border border-grey-light px-3 py-2.5 text-center font-mono text-lg text-charcoal focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
              />
              <span className="mt-1 block text-center text-xs text-grey-mid">minutes</span>
            </div>
            <span className="pb-5 font-mono text-lg text-grey-mid">:</span>
            <div className="flex-1">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={59}
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
                placeholder="00"
                className="w-full rounded-lg border border-grey-light px-3 py-2.5 text-center font-mono text-lg text-charcoal focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
              />
              <span className="mt-1 block text-center text-xs text-grey-mid">seconds</span>
            </div>
          </div>
        </div>

        {/* Distance */}
        <div>
          <label className="mb-2 block text-sm font-medium text-charcoal">Distance (optional)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder="0.00"
              className="flex-1 rounded-lg border border-grey-light px-3 py-2.5 font-mono text-charcoal focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
            />
            <div className="inline-flex overflow-hidden rounded-lg border border-grey-light">
              {(['mi', 'km'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setDistanceUnit(u)}
                  className={`px-3 py-2.5 text-sm font-semibold ${
                    distanceUnit === u ? 'bg-green text-white' : 'bg-white text-grey-mid'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calories + HR */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-charcoal">
              <Flame className="h-4 w-4 text-gold" /> Calories
            </label>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="0"
              className="w-full rounded-lg border border-grey-light px-3 py-2.5 font-mono text-charcoal focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
            />
          </div>
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-charcoal">
              <Heart className="h-4 w-4 text-red-500" /> Avg HR
            </label>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={250}
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
              placeholder="bpm"
              className="w-full rounded-lg border border-grey-light px-3 py-2.5 font-mono text-charcoal focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
            />
          </div>
        </div>

        {/* Intensity */}
        <div>
          <label className="mb-2 flex items-center justify-between text-sm font-medium text-charcoal">
            Intensity
            <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-0.5 font-mono text-xs font-bold text-gold-dark">
              {intensity}/10
            </span>
          </label>
          <input
            type="range"
            min={1}
            max={10}
            value={intensity}
            onChange={(e) => setIntensity(parseInt(e.target.value, 10))}
            className="w-full accent-green"
          />
          <div className="mt-1 flex justify-between text-xs text-grey-mid">
            <span>Easy</span>
            <span>Max effort</span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Route, conditions, how it felt…"
            className="w-full rounded-lg border border-grey-light px-3 py-2 text-sm text-charcoal focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
      )}

      {/* Actions */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-grey-light bg-white/95 px-4 py-3 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Link
            href="/dashboard"
            className="ml-auto flex items-center gap-1.5 rounded-lg border border-grey-light px-4 py-2.5 text-sm font-medium text-charcoal hover:bg-grey-light/50"
          >
            <X className="h-4 w-4" /> Cancel
          </Link>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-dark disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Cardio
          </button>
        </div>
      </div>
    </div>
  )
}
