'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Scale,
  Ruler,
  Save,
  Loader2,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  Camera,
  CheckCircle2,
} from 'lucide-react'
import { displayWeight, displayLength } from '@/lib/units'

type Tab = 'log' | 'history'

interface BodyMetric {
  id: string
  weightKg: number | null
  bodyFatPercentage: number | null
  muscleMassKg: number | null
  waistCm: number | null
  chestCm: number | null
  hipsCm: number | null
  leftArmCm: number | null
  rightArmCm: number | null
  leftThighCm: number | null
  rightThighCm: number | null
  neckCm: number | null
  shouldersCm: number | null
  leftCalfCm: number | null
  rightCalfCm: number | null
  notes: string | null
  measuredAt: string
}

// field key on the form, label, and whether it is a length (cm) measurement
const LENGTH_FIELDS: { key: string; label: string }[] = [
  { key: 'chest', label: 'Chest' },
  { key: 'waist', label: 'Waist' },
  { key: 'hips', label: 'Hips' },
  { key: 'shoulders', label: 'Shoulders' },
  { key: 'neck', label: 'Neck' },
  { key: 'leftArm', label: 'Left Arm' },
  { key: 'rightArm', label: 'Right Arm' },
  { key: 'leftThigh', label: 'Left Thigh' },
  { key: 'rightThigh', label: 'Right Thigh' },
  { key: 'leftCalf', label: 'Left Calf' },
  { key: 'rightCalf', label: 'Right Calf' },
]

// map metric record cm column -> form key
const CM_COLUMN: Record<string, keyof BodyMetric> = {
  chest: 'chestCm',
  waist: 'waistCm',
  hips: 'hipsCm',
  shoulders: 'shouldersCm',
  neck: 'neckCm',
  leftArm: 'leftArmCm',
  rightArm: 'rightArmCm',
  leftThigh: 'leftThighCm',
  rightThigh: 'rightThighCm',
  leftCalf: 'leftCalfCm',
  rightCalf: 'rightCalfCm',
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function BodyMetricsPage() {
  const [tab, setTab] = useState<Tab>('log')
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('lbs')
  const [lengthUnit, setLengthUnit] = useState<'cm' | 'in'>('in')

  // form state
  const [measuredAt, setMeasuredAt] = useState(todayISO())
  const [weight, setWeight] = useState('')
  const [muscleMass, setMuscleMass] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [lengths, setLengths] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [metrics, setMetrics] = useState<BodyMetric[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/logs/body-metrics')
      if (res.ok) {
        const data = await res.json()
        setMetrics(data.metrics || [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const setLength = (key: string, val: string) =>
    setLengths((prev) => ({ ...prev, [key]: val }))

  const save = async () => {
    setError(null)
    setSaved(false)
    const numOrNull = (s: string) => (s.trim() === '' ? null : parseFloat(s))
    const payload: Record<string, unknown> = {
      measuredAt,
      weightUnit,
      lengthUnit,
      weight: numOrNull(weight),
      muscleMass: numOrNull(muscleMass),
      bodyFatPercentage: numOrNull(bodyFat),
      notes: notes.trim() || null,
    }
    for (const f of LENGTH_FIELDS) payload[f.key] = numOrNull(lengths[f.key] || '')

    const hasAny =
      payload.weight != null ||
      payload.muscleMass != null ||
      payload.bodyFatPercentage != null ||
      LENGTH_FIELDS.some((f) => payload[f.key] != null)
    if (!hasAny) {
      setError('Enter at least one measurement before saving.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/logs/body-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save measurements')
      }
      setSaved(true)
      await load()
      setTab('history')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  // History rows (oldest + newest for delta). metrics are desc by date.
  const { newest, oldest } = useMemo(() => {
    if (metrics.length === 0) return { newest: null, oldest: null }
    return { newest: metrics[0], oldest: metrics[metrics.length - 1] }
  }, [metrics])

  const fmtW = (kg: number | null) =>
    kg == null ? '—' : `${displayWeight(kg, weightUnit)}`
  const fmtL = (cm: number | null) =>
    cm == null ? '—' : `${displayLength(cm, lengthUnit)}`

  const delta = (col: keyof BodyMetric, kind: 'weight' | 'length' | 'pct') => {
    if (!newest || !oldest || newest.id === oldest.id) return null
    const a = oldest[col] as number | null
    const b = newest[col] as number | null
    if (a == null || b == null) return null
    let diff = b - a
    if (kind === 'weight') diff = displayWeight(b, weightUnit) - displayWeight(a, weightUnit)
    if (kind === 'length') diff = displayLength(b, lengthUnit) - displayLength(a, lengthUnit)
    return Math.round(diff * 10) / 10
  }

  const exportCSV = () => {
    if (metrics.length === 0) return
    const headers = [
      'Date',
      `Weight (${weightUnit})`,
      'Body Fat (%)',
      `Muscle Mass (${weightUnit})`,
      ...LENGTH_FIELDS.map((f) => `${f.label} (${lengthUnit})`),
      'Notes',
    ]
    const rows = metrics.map((m) => [
      m.measuredAt.slice(0, 10),
      m.weightKg == null ? '' : displayWeight(m.weightKg, weightUnit),
      m.bodyFatPercentage ?? '',
      m.muscleMassKg == null ? '' : displayWeight(m.muscleMassKg, weightUnit),
      ...LENGTH_FIELDS.map((f) => {
        const v = m[CM_COLUMN[f.key]] as number | null
        return v == null ? '' : displayLength(v, lengthUnit)
      }),
      (m.notes || '').replace(/"/g, '""').replace(/\n/g, ' '),
    ])
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${c}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `body-metrics-${todayISO()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const DeltaBadge = ({ value, lowerIsBetter }: { value: number | null; lowerIsBetter?: boolean }) => {
    if (value == null || value === 0) {
      return (
        <span className="inline-flex items-center gap-0.5 text-xs text-grey-mid">
          <Minus className="h-3 w-3" /> 0
        </span>
      )
    }
    const improved = lowerIsBetter ? value < 0 : value > 0
    const color = improved ? 'text-green' : 'text-red-600'
    const Icon = value > 0 ? TrendingUp : TrendingDown
    return (
      <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${color}`}>
        <Icon className="h-3 w-3" />
        {value > 0 ? '+' : ''}
        {value}
      </span>
    )
  }

  return (
    <div className="mx-auto max-w-5xl pb-20">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal">Body Metrics</h1>
          <p className="text-sm text-grey-mid">Track weight, composition and measurements.</p>
        </div>
        <Link
          href="/dashboard/body-metrics/photos"
          className="flex items-center gap-1.5 rounded-lg border border-grey-light px-4 py-2.5 text-sm font-semibold text-charcoal hover:bg-grey-light/50"
        >
          <Camera className="h-4 w-4" /> Progress Photos
        </Link>
      </div>

      {/* Tabs */}
      <div className="mb-6 inline-flex rounded-lg border border-grey-light bg-white p-1">
        {(['log', 'history'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-md px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${
              tab === t ? 'bg-green text-white' : 'text-grey-mid hover:text-charcoal'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Unit toggles */}
      <div className="mb-5 flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-grey-mid" />
          <div className="inline-flex overflow-hidden rounded-md border border-grey-light">
            {(['lbs', 'kg'] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setWeightUnit(u)}
                className={`px-3 py-1 text-xs font-semibold ${
                  weightUnit === u ? 'bg-green text-white' : 'bg-white text-grey-mid'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Ruler className="h-4 w-4 text-grey-mid" />
          <div className="inline-flex overflow-hidden rounded-md border border-grey-light">
            {(['in', 'cm'] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setLengthUnit(u)}
                className={`px-3 py-1 text-xs font-semibold ${
                  lengthUnit === u ? 'bg-green text-white' : 'bg-white text-grey-mid'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>

      {tab === 'log' ? (
        <div className="space-y-6 rounded-xl border border-grey-light bg-white p-5 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Date</label>
              <input
                type="date"
                value={measuredAt}
                max={todayISO()}
                onChange={(e) => setMeasuredAt(e.target.value)}
                className="w-full rounded-lg border border-grey-light px-3 py-2.5 text-sm text-charcoal focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">
                Weight ({weightUnit})
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="0.0"
                className="w-full rounded-lg border border-grey-light px-3 py-2.5 font-mono text-charcoal focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Body Fat (%)</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                placeholder="0.0"
                className="w-full rounded-lg border border-grey-light px-3 py-2.5 font-mono text-charcoal focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">
                Muscle Mass ({weightUnit})
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={muscleMass}
                onChange={(e) => setMuscleMass(e.target.value)}
                placeholder="0.0"
                className="w-full rounded-lg border border-grey-light px-3 py-2.5 font-mono text-charcoal focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
              />
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-grey-mid">
              Circumference ({lengthUnit})
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {LENGTH_FIELDS.map((f) => (
                <div key={f.key}>
                  <label className="mb-1.5 block text-sm font-medium text-charcoal">{f.label}</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    value={lengths[f.key] || ''}
                    onChange={(e) => setLength(f.key, e.target.value)}
                    placeholder="0.0"
                    className="w-full rounded-lg border border-grey-light px-3 py-2.5 font-mono text-charcoal focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Context for these measurements…"
              className="w-full rounded-lg border border-grey-light px-3 py-2 text-sm text-charcoal focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
            />
          </div>

          {error && <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}
          {saved && (
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-green">
              <CheckCircle2 className="h-4 w-4" /> Saved
            </p>
          )}

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-dark disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Measurements
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={exportCSV}
              disabled={metrics.length === 0}
              className="flex items-center gap-1.5 rounded-lg border border-grey-light px-4 py-2 text-sm font-semibold text-charcoal hover:bg-grey-light/50 disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-green" />
            </div>
          ) : metrics.length === 0 ? (
            <div className="rounded-xl border border-dashed border-grey-light bg-grey-light/20 p-12 text-center">
              <Scale className="mx-auto mb-3 h-10 w-10 text-grey-mid" />
              <h3 className="font-display text-lg font-semibold text-charcoal">No measurements yet</h3>
              <p className="mt-1 text-sm text-grey-mid">
                Log your first entry to start tracking your progress.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-grey-light bg-white shadow-sm">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-grey-light bg-grey-light/30 text-left text-xs uppercase tracking-wide text-grey-mid">
                    <th className="px-3 py-2.5 font-semibold">Date</th>
                    <th className="px-3 py-2.5 font-semibold">Wt ({weightUnit})</th>
                    <th className="px-3 py-2.5 font-semibold">BF %</th>
                    <th className="px-3 py-2.5 font-semibold">Muscle</th>
                    {LENGTH_FIELDS.map((f) => (
                      <th key={f.key} className="px-3 py-2.5 font-semibold">
                        {f.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {metrics.map((m) => (
                    <tr key={m.id} className="border-b border-grey-light/60 last:border-0">
                      <td className="whitespace-nowrap px-3 py-2.5 font-body text-charcoal">
                        {m.measuredAt.slice(0, 10)}
                      </td>
                      <td className="px-3 py-2.5 text-charcoal">{fmtW(m.weightKg)}</td>
                      <td className="px-3 py-2.5 text-charcoal">
                        {m.bodyFatPercentage ?? '—'}
                      </td>
                      <td className="px-3 py-2.5 text-charcoal">{fmtW(m.muscleMassKg)}</td>
                      {LENGTH_FIELDS.map((f) => (
                        <td key={f.key} className="px-3 py-2.5 text-charcoal">
                          {fmtL(m[CM_COLUMN[f.key]] as number | null)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {newest && oldest && newest.id !== oldest.id && (
                    <tr className="border-t-2 border-green/30 bg-green/5 font-body">
                      <td className="px-3 py-2.5 text-xs font-semibold uppercase text-grey-mid">
                        Change
                      </td>
                      <td className="px-3 py-2.5">
                        <DeltaBadge value={delta('weightKg', 'weight')} lowerIsBetter />
                      </td>
                      <td className="px-3 py-2.5">
                        <DeltaBadge value={delta('bodyFatPercentage', 'pct')} lowerIsBetter />
                      </td>
                      <td className="px-3 py-2.5">
                        <DeltaBadge value={delta('muscleMassKg', 'weight')} />
                      </td>
                      {LENGTH_FIELDS.map((f) => (
                        <td key={f.key} className="px-3 py-2.5">
                          <DeltaBadge value={delta(CM_COLUMN[f.key], 'length')} />
                        </td>
                      ))}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {newest && oldest && newest.id !== oldest.id && (
            <p className="mt-2 text-xs text-grey-mid">
              &ldquo;Change&rdquo; compares your most recent entry to your first recorded entry.
              Green = moving toward a leaner/stronger direction.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
