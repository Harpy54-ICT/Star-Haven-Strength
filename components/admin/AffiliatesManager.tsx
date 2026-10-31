'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, Plus, X, BarChart3 } from 'lucide-react'

interface Partner {
  id: string
  name: string
  websiteUrl: string | null
  commissionRate: number
  trackingParam: string | null
  category: string | null
  isActive: boolean
  totalClicks: number
  totalConversions: number
  totalEarnedCents: number
}

interface FormState {
  id?: string
  name: string
  websiteUrl: string
  commissionPct: string
  trackingParam: string
  category: string
  isActive: boolean
}

const EMPTY_FORM: FormState = {
  name: '',
  websiteUrl: '',
  commissionPct: '10',
  trackingParam: '',
  category: '',
  isActive: true,
}

export default function AffiliatesManager() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<FormState | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/affiliates')
    if (res.ok) {
      const data = await res.json()
      setPartners(data.partners ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function startCreate() {
    setForm({ ...EMPTY_FORM })
  }

  function startEdit(p: Partner) {
    setForm({
      id: p.id,
      name: p.name,
      websiteUrl: p.websiteUrl ?? '',
      commissionPct: String(Math.round(p.commissionRate * 10000) / 100),
      trackingParam: p.trackingParam ?? '',
      category: p.category ?? '',
      isActive: p.isActive,
    })
  }

  async function save() {
    if (!form) return
    setSaving(true)
    try {
      const body = {
        name: form.name,
        websiteUrl: form.websiteUrl || null,
        commissionRate: Number(form.commissionPct) / 100,
        trackingParam: form.trackingParam || null,
        category: form.category || null,
        isActive: form.isActive,
      }
      const res = form.id
        ? await fetch(`/api/admin/affiliates/${form.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
        : await fetch('/api/admin/affiliates', {
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

  async function toggleActive(p: Partner) {
    await fetch(`/api/admin/affiliates/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !p.isActive }),
    })
    await load()
  }

  async function remove(id: string) {
    if (!confirm('Delete this affiliate partner? This cannot be undone.')) return
    const res = await fetch(`/api/admin/affiliates/${id}`, { method: 'DELETE' })
    if (res.ok) await load()
  }

  const inputClass =
    'w-full rounded-lg border border-grey-mid px-3 py-2 font-body text-sm text-charcoal focus:border-green focus:outline-none'

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-green">
          Affiliate Partners
        </h1>
        <button
          onClick={startCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-green px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-gold hover:bg-green-light"
        >
          <Plus size={16} /> New Partner
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 font-body text-grey-dark">
          <Loader2 className="animate-spin" size={18} /> Loading…
        </div>
      ) : partners.length === 0 ? (
        <p className="rounded-xl border border-grey-mid bg-white p-6 font-body text-sm text-grey-dark">
          No affiliate partners yet. Add your first one.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-grey-mid bg-white">
          <table className="w-full min-w-[760px] text-left">
            <thead className="border-b border-grey-mid bg-grey-light">
              <tr className="font-display text-xs uppercase tracking-wide text-grey-dark">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Rate</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Clicks</th>
                <th className="px-4 py-3">Conv.</th>
                <th className="px-4 py-3">Earned</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-grey-mid font-body text-sm text-charcoal">
              {partners.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-semibold">{p.name}</td>
                  <td className="px-4 py-3">{p.category ?? '—'}</td>
                  <td className="px-4 py-3 font-mono">
                    {(p.commissionRate * 100).toFixed(0)}%
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(p)}
                      className={`inline-flex h-6 w-11 items-center rounded-full px-0.5 transition-colors ${
                        p.isActive ? 'bg-green' : 'bg-grey-mid'
                      }`}
                      aria-label="Toggle active"
                    >
                      <span
                        className={`h-5 w-5 rounded-full bg-white transition-transform ${
                          p.isActive ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 font-mono">{p.totalClicks}</td>
                  <td className="px-4 py-3 font-mono">{p.totalConversions}</td>
                  <td className="px-4 py-3 font-mono">
                    ${(p.totalEarnedCents / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/dashboard/admin/affiliates/${p.id}/earnings`}
                        className="inline-flex items-center gap-1 rounded-md border border-grey-mid px-2.5 py-1.5 text-xs font-semibold text-grey-dark hover:bg-grey-light"
                      >
                        <BarChart3 size={13} /> Earnings
                      </Link>
                      <button
                        onClick={() => startEdit(p)}
                        className="rounded-md border border-grey-mid px-2.5 py-1.5 text-xs font-semibold text-green hover:bg-grey-light"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(p.id)}
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

      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-green">
                {form.id ? 'Edit Partner' : 'New Partner'}
              </h2>
              <button onClick={() => setForm(null)} aria-label="Close">
                <X size={20} className="text-grey-dark" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="font-body text-xs text-grey-dark">Name</label>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => (f ? { ...f, name: e.target.value } : f))
                  }
                />
              </div>
              <div>
                <label className="font-body text-xs text-grey-dark">
                  Website URL
                </label>
                <input
                  className={inputClass}
                  placeholder="https://…"
                  value={form.websiteUrl}
                  onChange={(e) =>
                    setForm((f) =>
                      f ? { ...f, websiteUrl: e.target.value } : f
                    )
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-body text-xs text-grey-dark">
                    Commission rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className={inputClass}
                    value={form.commissionPct}
                    onChange={(e) =>
                      setForm((f) =>
                        f ? { ...f, commissionPct: e.target.value } : f
                      )
                    }
                  />
                </div>
                <div>
                  <label className="font-body text-xs text-grey-dark">
                    Category
                  </label>
                  <input
                    className={inputClass}
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) =>
                        f ? { ...f, category: e.target.value } : f
                      )
                    }
                  />
                </div>
              </div>
              <div>
                <label className="font-body text-xs text-grey-dark">
                  Tracking param (UTM / URL param)
                </label>
                <input
                  className={inputClass}
                  placeholder="e.g. shs_ref"
                  value={form.trackingParam}
                  onChange={(e) =>
                    setForm((f) =>
                      f ? { ...f, trackingParam: e.target.value } : f
                    )
                  }
                />
              </div>
              <label className="flex items-center gap-2 font-body text-sm text-charcoal">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((f) =>
                      f ? { ...f, isActive: e.target.checked } : f
                    )
                  }
                />
                Active
              </label>
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
    </div>
  )
}
