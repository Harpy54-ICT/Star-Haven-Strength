'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'

interface Injury {
  id: string
  bodyPart: string
  severity: 'mild' | 'moderate' | 'severe'
  description: string | null
  exerciseModifications: string | null
  status: 'active' | 'recovering' | 'resolved'
  occurredAt: string
  resolvedAt: string | null
}

const SEVERITY_STYLES: Record<string, string> = {
  mild: 'bg-amber-100 text-amber-800',
  moderate: 'bg-orange-100 text-orange-800',
  severe: 'bg-red-100 text-red-800',
}

export default function InjuriesPage() {
  const [injuries, setInjuries] = useState<Injury[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    bodyPart: '',
    severity: 'mild' as Injury['severity'],
    description: '',
    exerciseModifications: '',
    occurredAt: new Date().toISOString().slice(0, 10),
  })

  const load = () =>
    fetch('/api/logs/injury')
      .then((r) => (r.ok ? r.json() : { injuries: [] }))
      .then((d) => setInjuries(d.injuries ?? []))

  useEffect(() => {
    void load()
  }, [])

  const submit = async () => {
    if (!form.bodyPart.trim()) return
    await fetch('/api/logs/injury', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        occurredAt: new Date(`${form.occurredAt}T12:00:00Z`).toISOString(),
      }),
    })
    setShowForm(false)
    setForm({
      bodyPart: '',
      severity: 'mild',
      description: '',
      exerciseModifications: '',
      occurredAt: new Date().toISOString().slice(0, 10),
    })
    await load()
  }

  const updateStatus = async (id: string, status: Injury['status']) => {
    await fetch('/api/logs/injury', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    await load()
  }

  const active = injuries.filter((i) => i.status !== 'resolved')
  const resolved = injuries.filter((i) => i.status === 'resolved')

  const Card = ({ i }: { i: Injury }) => (
    <div className="rounded-xl border border-grey-mid bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="font-body text-sm font-semibold text-charcoal">
          {i.bodyPart}
        </p>
        <span
          className={`rounded-full px-2 py-0.5 font-display text-[10px] font-bold uppercase ${SEVERITY_STYLES[i.severity]}`}
        >
          {i.severity}
        </span>
      </div>
      <p className="mt-1 font-mono text-xs text-grey-dark">
        Since {new Date(i.occurredAt).toLocaleDateString()} · {i.status}
      </p>
      {i.description && (
        <p className="mt-2 font-body text-sm text-charcoal">{i.description}</p>
      )}
      {i.exerciseModifications && (
        <p className="mt-1 font-body text-xs text-grey-dark">
          Modifications: {i.exerciseModifications}
        </p>
      )}
      {i.status !== 'resolved' && (
        <div className="mt-3 flex gap-2">
          {i.status === 'active' && (
            <button
              onClick={() => updateStatus(i.id, 'recovering')}
              className="rounded-lg border border-grey-mid px-3 py-1.5 font-display text-xs font-bold uppercase text-grey-dark hover:bg-grey-light"
            >
              Mark Recovering
            </button>
          )}
          <button
            onClick={() => updateStatus(i.id, 'resolved')}
            className="rounded-lg bg-green px-3 py-1.5 font-display text-xs font-bold uppercase text-gold"
          >
            Mark Resolved
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-green">
            Injury Log
          </h1>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-1 rounded-lg bg-green px-4 py-2 font-display text-xs font-bold uppercase tracking-wide text-gold"
          >
            <Plus size={14} /> Log Injury
          </button>
        </div>

        {showForm && (
          <div className="mt-6 space-y-3 rounded-xl border border-grey-mid bg-white p-5">
            <input
              className="w-full rounded-lg border border-grey-mid px-3 py-2 font-body text-sm"
              placeholder="Body part (e.g. Left shoulder)"
              value={form.bodyPart}
              onChange={(e) => setForm({ ...form, bodyPart: e.target.value })}
            />
            <div className="flex gap-2">
              <select
                value={form.severity}
                onChange={(e) =>
                  setForm({ ...form, severity: e.target.value as Injury['severity'] })
                }
                className="rounded-lg border border-grey-mid px-3 py-2 font-body text-sm"
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
              <input
                type="date"
                value={form.occurredAt}
                onChange={(e) => setForm({ ...form, occurredAt: e.target.value })}
                className="rounded-lg border border-grey-mid px-3 py-2 font-body text-sm"
              />
            </div>
            <textarea
              className="w-full rounded-lg border border-grey-mid px-3 py-2 font-body text-sm"
              placeholder="Description"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <textarea
              className="w-full rounded-lg border border-grey-mid px-3 py-2 font-body text-sm"
              placeholder="Exercise modifications"
              rows={2}
              value={form.exerciseModifications}
              onChange={(e) =>
                setForm({ ...form, exerciseModifications: e.target.value })
              }
            />
            <button
              onClick={submit}
              className="rounded-lg bg-gold px-4 py-2 font-display text-xs font-bold uppercase tracking-wide text-green"
            >
              Save
            </button>
          </div>
        )}

        <h2 className="mt-8 font-display text-xl font-bold text-charcoal">
          Active &amp; Recovering
        </h2>
        <div className="mt-3 space-y-3">
          {active.length === 0 ? (
            <p className="font-body text-sm text-grey-dark">No active injuries. 💪</p>
          ) : (
            active.map((i) => <Card key={i.id} i={i} />)
          )}
        </div>

        {resolved.length > 0 && (
          <>
            <h2 className="mt-8 font-display text-xl font-bold text-charcoal">
              Resolved
            </h2>
            <div className="mt-3 space-y-3">
              {resolved.map((i) => (
                <Card key={i.id} i={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
