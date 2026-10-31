'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'

interface Client {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  accountType: string
  militaryVerified: boolean
  createdAt: string
  totalXP: number
  subscription: { tier: string; status: string; currentPeriodEnd: string | null } | null
}

const ACCOUNT_TYPES = ['all', 'civilian', 'military', 'veteran']
const SUB_STATUSES = ['all', 'active', 'canceled', 'past_due']

function tierLabel(tier: string): string {
  const [key, audience] = tier.split('_')
  const name = key.charAt(0).toUpperCase() + key.slice(1)
  return audience ? `${name} (${audience})` : name
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [accountType, setAccountType] = useState('all')
  const [subscriptionStatus, setSubscriptionStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      accountType,
      subscriptionStatus,
    })
    if (search.trim()) params.set('search', search.trim())
    const res = await fetch(`/api/admin/clients?${params.toString()}`)
    if (res.ok) {
      const data = await res.json()
      setClients(data.clients ?? [])
      setTotalPages(data.totalPages ?? 1)
    }
    setLoading(false)
  }, [page, accountType, subscriptionStatus, search])

  // Reset to page 1 when filters/search change.
  useEffect(() => {
    setPage(1)
  }, [accountType, subscriptionStatus, search])

  // Debounce fetch.
  useEffect(() => {
    const t = setTimeout(() => void load(), 300)
    return () => clearTimeout(t)
  }, [load])

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-green">
          Client Management
        </h1>

        {/* Filters */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            className="flex-1 rounded-lg border border-grey-mid px-3 py-2 font-body text-sm"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
            className="rounded-lg border border-grey-mid px-3 py-2 font-body text-sm capitalize"
          >
            {ACCOUNT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t === 'all' ? 'All Types' : t}
              </option>
            ))}
          </select>
          <select
            value={subscriptionStatus}
            onChange={(e) => setSubscriptionStatus(e.target.value)}
            className="rounded-lg border border-grey-mid px-3 py-2 font-body text-sm"
          >
            {SUB_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === 'all'
                  ? 'All Statuses'
                  : s === 'past_due'
                    ? 'Past Due'
                    : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-x-auto rounded-xl border border-grey-mid bg-white">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-grey-mid font-display text-xs font-bold uppercase tracking-wide text-grey-dark">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">XP</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grey-mid">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-3 w-full rounded bg-grey-mid/60" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : clients.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center font-body text-sm text-grey-dark"
                  >
                    No clients found matching your search.
                  </td>
                </tr>
              ) : (
                clients.map((c) => (
                  <tr key={c.id} className="hover:bg-grey-light">
                    <td className="px-4 py-3 font-body text-sm font-semibold text-charcoal">
                      {[c.firstName, c.lastName].filter(Boolean).join(' ') ||
                        'Unnamed'}
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-charcoal">
                      {c.email}
                    </td>
                    <td className="px-4 py-3 font-body text-sm capitalize text-charcoal">
                      {c.accountType}
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-charcoal">
                      {c.subscription ? tierLabel(c.subscription.tier) : 'Free'}
                    </td>
                    <td className="px-4 py-3 font-body text-sm capitalize text-charcoal">
                      {c.subscription?.status ?? '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-grey-dark">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-charcoal">
                      {c.totalXP.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/admin/clients/${c.id}`}
                        className="rounded-lg bg-green px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wide text-gold hover:bg-green-light"
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-grey-mid px-4 py-2 font-display text-xs font-bold uppercase tracking-wide text-grey-dark disabled:opacity-40"
          >
            Previous
          </button>
          <span className="font-mono text-sm text-grey-dark">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border border-grey-mid px-4 py-2 font-display text-xs font-bold uppercase tracking-wide text-grey-dark disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
