'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const GREEN = '#1B4332'
const GOLD = '#C9A84C'
const KG_TO_LBS = 2.20462

interface BodyMetric {
  id: string
  weightKg: number | null
  measuredAt: string
}
interface CheckIn {
  id: string
  mood: number | null
  energy: number | null
  weekStart: string
}

function fmtDay(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export default function ClientProgressCharts({
  clientId,
}: {
  clientId: string
}) {
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetric[]>([])
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetch(`/api/admin/clients/${clientId}/progress`)
      .then((r) => (r.ok ? r.json() : { bodyMetrics: [], checkIns: [] }))
      .then((d) => {
        if (!active) return
        setBodyMetrics(d.bodyMetrics ?? [])
        setCheckIns(d.checkIns ?? [])
      })
      .catch(() => {
        if (!active) return
        setBodyMetrics([])
        setCheckIns([])
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [clientId])

  const weightData = useMemo(
    () =>
      bodyMetrics
        .filter((m) => m.weightKg != null)
        .map((m) => ({
          date: fmtDay(m.measuredAt),
          lbs: Math.round((m.weightKg as number) * KG_TO_LBS * 10) / 10,
        })),
    [bodyMetrics]
  )

  const moodData = useMemo(
    () =>
      checkIns
        .filter((c) => c.mood != null || c.energy != null)
        .map((c) => ({
          week: fmtDay(c.weekStart),
          mood: c.mood,
          energy: c.energy,
        })),
    [checkIns]
  )

  if (loading) {
    return (
      <p className="font-body text-sm text-grey-dark">Loading progress…</p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-grey-mid bg-white p-5">
        <h3 className="font-display text-base font-bold text-charcoal">
          Weight (lbs) · last 90 days
        </h3>
        {weightData.length === 0 ? (
          <p className="mt-4 font-body text-sm text-grey-dark">
            No weight entries in the last 90 days.
          </p>
        ) : (
          <div className="mt-4 h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" fontSize={10} />
                <YAxis fontSize={11} domain={['auto', 'auto']} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="lbs"
                  name="Weight (lbs)"
                  stroke={GREEN}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-grey-mid bg-white p-5">
        <h3 className="font-display text-base font-bold text-charcoal">
          Mood &amp; Energy (1–5) · last 12 weeks
        </h3>
        {moodData.length === 0 ? (
          <p className="mt-4 font-body text-sm text-grey-dark">
            No check-ins in the last 12 weeks.
          </p>
        ) : (
          <div className="mt-4 h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={moodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="week" fontSize={10} />
                <YAxis fontSize={11} domain={[0, 5]} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="mood"
                  name="Mood"
                  stroke={GREEN}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="energy"
                  name="Energy"
                  stroke={GOLD}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
