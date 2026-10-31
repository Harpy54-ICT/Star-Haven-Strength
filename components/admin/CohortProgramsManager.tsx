'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, Plus, Users, X } from 'lucide-react'

interface CohortRow {
  id: string
  name: string
  description: string | null
  durationWeeks: number
  priceCents: number
  maxClients: number | null
  startDate: string | null
  status: string
  _count: { enrollments: number }
}

interface Enrollee {
  id: string
  status: string
  enrolledAt: string
  user: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
  }
}

const STATUSES = ['draft', 'open', 'active', 'completed', 'cancelled'] as const

interface FormState {
  id?: string
  name: string
  description: string
  durationWeeks: string
  priceCents: string
  maxClients: string
  startDate: string
  status: string
}

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  durationWeeks: '8',
  priceCents: '0',
  maxClients: '',
  startDate: '',
  status: 'draft',
}

export default function CohortProgramsManager() {
  const [cohorts, setCohorts] = useState<CohortRow[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<FormState | null>(null)
  const [saving, setSaving] = useState(false)
  const [enrolleesFor, setEnrolleesFor] = useState<string | null>(null)
  const [enrollees, setEnrollees] = useState<Enrollee[]>([])

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/cohorts')
    if (res.ok) {
      const data = await res.json()
      setCohorts(data.cohorts ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function startCreate() {
    setForm({ ...EMPTY_FORM })
  }

  function startEdit(c: CohortRow) {
    setForm({
      id: c.id,
      name: c.name,
      description: c.description ?? '',
      durationWeeks: String(c.durationWeeks),
      priceCents: String(c.priceCents),
      maxClients: c.maxClients != null ? String(c.maxClients) : '',
      startDate: c.startDate ? c.startDate.slice(0, 10) : '',
      status: c.status,
    })
  }

  async function save() {
    if (!form) return
    setSaving(true)
    try {
      const body = {
        name: form.name,
        description: form.description || null,
        durationWeeks: Number(form.durationWeeks),
        priceCents: Number(form.priceCents),
        maxClients: form.maxClients ? Number(form.maxClients) : null,
        startDate: form.startDate || null,
        status: form.status,
      }
      const res = form.id
        ? await fetch(`/api/admin/cohorts/${form.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
        : await fetch('/api/admin/cohorts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
      if (res.ok) {
        setForm(null)
        await load()
      }
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this cohort program? This cannot be undone.')) return
    const res = await fetch(`/api/admin/cohorts/${id}`, { method: 'DELETE' })
    if (res.ok) await load()
  }

  async function viewEnrollees(id: string) {
    setEnrolleesFor(id)
    setEnrollees([])
    const res = await fetch(`/api/admin/cohorts/${id}`)
    if (res.ok) {
      const data = await res.json()
      setEnrollees(data.cohort?.enrollments ?? [])
    }
  }

  const field =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => (f ? { ...f, [key]: e.target.value } : f))

  const inputClass =
    'w-full rounded-lg border border-grey-mid px-3 py-2 font-body text-sm text-charcoal focus:border-green focus:outline-none'

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-green">
          Cohort Programs
        </h1>
        <button
          onClick={startCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-green px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-gold hover:bg-green-light"
        >
          <Plus size={16} /> New Program
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 font-body text-grey-dark">
          <Loader2 className="animate-spin" size={18} /> Loading…
        </div>
      ) : cohorts.length === 0 ? (
        <p className="rounded-xl border border-grey-mid bg-white p-6 font-body text-sm text-grey-dark">
          No cohort programs yet. Create your first one.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-grey-mid bg-white">
          <table className="w-full text-left">
            <thead className="border-b border-grey-mid bg-grey-light">
              <tr className="font-display text-xs uppercase tracking-wide text-grey-dark">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Weeks</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Enrolled</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-grey-mid font-body text-sm text-charcoal">
              {cohorts.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-semibold">{c.name}</td>
                  <td className="px-4 py-3 capitalize">{c.status}</td>
                  <td className="px-4 py-3 font-mono">{c.durationWeeks}</td>
                  <td className="px-4 py-3 font-mono">
                    ${(c.priceCents / 100).toFixed(0)}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {c._count.enrollments}
                    {c.maxClients != null ? `/${c.maxClients}` : ''}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => viewEnrollees(c.id)}
                        className="inline-flex items-center gap-1 rounded-md border border-grey-mid px-2.5 py-1.5 text-xs font-semibold text-grey-dark hover:bg-grey-light"
                      >
                        <Users size={13} /> Enrollees
                      </button>
                      <button
                        onClick={() => startEdit(c)}
                        className="rounded-md border border-grey-mid px-2.5 py-1.5 text-xs font-semibold text-green hover:bg-grey-light"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(c.id)}
                        className="rounded-md border border-grey-mid px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-grey-light"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / edit modal */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-green">
                {form.id ? 'Edit Program' : 'New Program'}
              </h2>
              <button onClick={() => setForm(null)} aria-label="Close">
                <X size={20} className="text-grey-dark" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="font-body text-xs text-grey-dark">Name</label>
                <input className={inputClass} value={form.name} onChange={field('name')} />
              </div>
              <div>
                <label className="font-body text-xs text-grey-dark">
                  Description
                </label>
                <textarea
                  className={inputClass}
                  rows={3}
                  value={form.description}
                  onChange={field('description')}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-body text-xs text-grey-dark">
                    Duration (weeks)
                  </label>
                  <input
                    type="number"
                    className={inputClass}
                    value={form.durationWeeks}
                    onChange={field('durationWeeks')}
                  />
                </div>
                <div>
                  <label className="font-body text-xs text-grey-dark">
                    Price (cents)
                  </label>
                  <input
                    type="number"
                    className={inputClass}
                    value={form.priceCents}
                    onChange={field('priceCents')}
                  />
                </div>
                <div>
                  <label className="font-body text-xs text-grey-dark">
                    Capacity (blank = unlimited)
                  </label>
                  <input
                    type="number"
                    className={inputClass}
                    value={form.maxClients}
                    onChange={field('maxClients')}
                  />
                </div>
                <div>
                  <label className="font-body text-xs text-grey-dark">
                    Start date
                  </label>
                  <input
                    type="date"
                    className={inputClass}
                    value={form.startDate}
                    onChange={field('startDate')}
                  />
                </div>
              </div>
              <div>
                <label className="font-body text-xs text-grey-dark">Status</label>
                <select
                  className={inputClass}
                  value={form.status}
                  onChange={field('status')}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setForm(null)}
                className="rounded-lg border border-grey-mid px-4 py-2 font-body text-sm font-semibold text-charcoal hover:bg-grey-light"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving || !form.name.trim()}
                className="rounded-lg bg-green px-4 py-2 font-body text-sm font-semibold text-gold hover:bg-green-light disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enrollees modal */}
      {enrolleesFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-green">
                Enrollees
              </h2>
              <button onClick={() => setEnrolleesFor(null)} aria-label="Close">
                <X size={20} className="text-grey-dark" />
              </button>
            </div>
            {enrollees.length === 0 ? (
              <p className="font-body text-sm text-grey-dark">
                No one is enrolled yet.
              </p>
            ) : (
              <ul className="divide-y divide-grey-mid">
                {enrollees.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between py-2.5"
                  >
                    <div>
                      <p className="font-body text-sm font-semibold text-charcoal">
                        {[e.user.firstName, e.user.lastName]
                          .filter(Boolean)
                          .join(' ') || 'Unnamed'}
                      </p>
                      <p className="font-mono text-xs text-grey-dark">
                        {e.user.email}
                      </p>
                    </div>
                    <span className="rounded-full bg-green/10 px-2 py-0.5 font-display text-[10px] font-bold uppercase text-green">
                      {e.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
