'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from 'recharts'
import { Droplet } from 'lucide-react'
import MacroBar from '@/components/nutrition/MacroBar'
import MealSection, { type FoodEntry } from '@/components/nutrition/MealSection'

const GOALS = { calories: 2200, protein: 165, carbs: 220, fat: 70 }
const MEALS = ['breakfast', 'lunch', 'dinner', 'snacks'] as const
type MealType = (typeof MEALS)[number]

interface NutritionLog {
  id: string
  mealName: string
  mealType: string | null
  calories: number | null
  proteinG: number | null
  carbsG: number | null
  fatG: number | null
  waterOz: number | null
  loggedAt: string
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function NutritionPage() {
  const [tab, setTab] = useState<'today' | 'history'>('today')
  const [date, setDate] = useState(todayStr())
  const [logs, setLogs] = useState<NutritionLog[]>([])
  const [water, setWater] = useState(0)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<FoodEntry[]>([])
  const [history, setHistory] = useState<{ date: string; calories: number }[]>([])
  const [loading, setLoading] = useState(false)

  const loadToday = useCallback(async () => {
    const res = await fetch(`/api/logs/nutrition?date=${date}`)
    if (res.ok) {
      const data = await res.json()
      setLogs(data.logs ?? [])
      setWater(
        (data.logs ?? []).reduce(
          (s: number, l: NutritionLog) => s + (l.waterOz ?? 0),
          0
        )
      )
    }
  }, [date])

  useEffect(() => {
    if (tab === 'today') void loadToday()
  }, [tab, loadToday])

  useEffect(() => {
    if (tab !== 'history') return
    const end = new Date()
    const start = new Date(Date.now() - 30 * 86400000)
    fetch(
      `/api/logs/nutrition?startDate=${start.toISOString().slice(0, 10)}&endDate=${end
        .toISOString()
        .slice(0, 10)}`
    )
      .then((r) => (r.ok ? r.json() : { byDate: {} }))
      .then((data) => {
        const rows = Object.entries(
          data.byDate as Record<string, NutritionLog[]>
        ).map(([d, items]) => ({
          date: d.slice(5),
          calories: items.reduce((s, i) => s + (i.calories ?? 0), 0),
        }))
        rows.sort((a, b) => (a.date < b.date ? -1 : 1))
        setHistory(rows)
      })
  }, [tab])

  const totals = useMemo(() => {
    return logs.reduce(
      (acc, l) => ({
        calories: acc.calories + (l.calories ?? 0),
        protein: acc.protein + (l.proteinG ?? 0),
        carbs: acc.carbs + (l.carbsG ?? 0),
        fat: acc.fat + (l.fatG ?? 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
  }, [logs])

  const byMeal = (m: MealType): FoodEntry[] =>
    logs
      .filter((l) => (l.mealType ?? 'snacks') === m)
      .map((l) => ({
        id: l.id,
        mealName: l.mealName,
        calories: l.calories,
        proteinG: l.proteinG,
        carbsG: l.carbsG,
        fatG: l.fatG,
      }))

  const addFood = async (meal: MealType, entry: FoodEntry) => {
    setLoading(true)
    await fetch('/api/logs/nutrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mealName: entry.mealName,
        mealType: meal,
        calories: entry.calories,
        proteinG: entry.proteinG,
        carbsG: entry.carbsG,
        fatG: entry.fatG,
        loggedAt: new Date(`${date}T12:00:00Z`).toISOString(),
      }),
    })
    setLoading(false)
    await loadToday()
  }

  const addWater = async (oz: number) => {
    await fetch('/api/logs/nutrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mealName: `Water (${oz}oz)`,
        mealType: 'snacks',
        waterOz: oz,
        loggedAt: new Date(`${date}T12:00:00Z`).toISOString(),
      }),
    })
    await loadToday()
  }

  const doSearch = async () => {
    if (!search.trim()) return
    const res = await fetch('/api/nutrition/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: search }),
    })
    if (res.ok) {
      const data = await res.json()
      setResults(
        (data.foods ?? []).map(
          (f: {
            name: string
            calories: number
            protein: number
            carbs: number
            fat: number
          }) => ({
            mealName: f.name,
            calories: f.calories,
            proteinG: f.protein,
            carbsG: f.carbs,
            fatG: f.fat,
          })
        )
      )
    }
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-green">
          Nutrition
        </h1>

        <div className="mt-6 flex gap-2">
          {(['today', 'history'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-2 font-display text-sm font-bold uppercase tracking-wide ${
                tab === t
                  ? 'bg-green text-gold'
                  : 'border border-grey-mid text-grey-dark'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'today' ? (
          <div className="mt-6 space-y-5">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-grey-mid px-3 py-2 font-body text-sm"
            />

            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-grey-mid bg-white p-5 sm:grid-cols-4">
              <MacroBar label="Calories" current={totals.calories} goal={GOALS.calories} unit="" />
              <MacroBar label="Protein" current={totals.protein} goal={GOALS.protein} />
              <MacroBar label="Carbs" current={totals.carbs} goal={GOALS.carbs} />
              <MacroBar label="Fat" current={totals.fat} goal={GOALS.fat} />
            </div>

            {/* Water */}
            <div className="rounded-xl border border-grey-mid bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-green">
                  <Droplet size={16} /> Water
                </span>
                <span className="font-mono text-lg font-bold text-charcoal">
                  {water} oz
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => addWater(8)}
                  className="rounded-lg border border-grey-mid px-4 py-2 font-display text-xs font-bold uppercase text-grey-dark hover:bg-grey-light"
                >
                  +8 oz
                </button>
                <button
                  onClick={() => addWater(16)}
                  className="rounded-lg border border-grey-mid px-4 py-2 font-display text-xs font-bold uppercase text-grey-dark hover:bg-grey-light"
                >
                  +16 oz
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="rounded-xl border border-grey-mid bg-white p-5">
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-lg border border-grey-mid px-3 py-2 font-body text-sm"
                  placeholder="Search food…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && doSearch()}
                />
                <button
                  onClick={doSearch}
                  className="rounded-lg bg-gold px-4 py-2 font-display text-xs font-bold uppercase tracking-wide text-green"
                >
                  Search
                </button>
              </div>
              {results.length > 0 && (
                <ul className="mt-3 divide-y divide-grey-mid">
                  {results.map((r, i) => (
                    <li key={i} className="flex items-center justify-between py-2">
                      <span className="font-body text-sm text-charcoal">
                        {r.mealName}{' '}
                        <span className="font-mono text-xs text-grey-dark">
                          ({r.calories} kcal)
                        </span>
                      </span>
                      <button
                        onClick={() => addFood('snacks', r)}
                        className="font-display text-xs font-bold uppercase text-green hover:underline"
                      >
                        + Add
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Meals */}
            <div className="space-y-3">
              {MEALS.map((m) => (
                <MealSection
                  key={m}
                  title={m}
                  entries={byMeal(m)}
                  onAdd={(e) => addFood(m, e)}
                />
              ))}
            </div>

            {loading && (
              <p className="font-body text-xs text-grey-dark">Saving…</p>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <div className="rounded-xl border border-grey-mid bg-white p-5">
              <h2 className="font-display text-lg font-bold text-charcoal">
                Calories — Past 30 Days
              </h2>
              <div className="mt-4 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <ReferenceLine
                      y={GOALS.calories}
                      stroke="#C9A84C"
                      strokeDasharray="4 4"
                      label="Goal"
                    />
                    <Line
                      type="monotone"
                      dataKey="calories"
                      stroke="#1B4332"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
