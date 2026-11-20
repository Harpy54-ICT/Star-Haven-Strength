'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Gift,
  Copy,
  Check,
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  BadgeCheck,
  Wallet,
} from 'lucide-react'

interface Commission {
  id: string
  name: string
  month: string
  date: string
  plan: string
  amountCents: number
  status: string
}

interface Payout {
  id: string
  amountCents: number
  status: string
  requestedAt: string
  processedAt: string | null
  notes: string | null
}

interface PortalData {
  isAffiliate: boolean
  code?: string
  shareUrl?: string
  commissionRatePercent: number
  minPayoutCents: number
  stats?: {
    signups: number
    conversions: number
    conversionRate: number
  }
  balances?: {
    availableCents: number
    inReviewCents: number
    approvedCents: number
    paidCents: number
  }
  canRequestPayout?: boolean
  hasPendingPayout?: boolean
  recentCommissions?: Commission[]
  payouts?: Payout[]
}

function money(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function statusBadge(status: string): string {
  switch (status) {
    case 'paid':
    case 'approved':
      return 'bg-green/10 text-green'
    case 'rejected':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gold/15 text-gold-dark'
  }
}

export default function ReferralsPortalPage() {
  const [data, setData] = useState<PortalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [activating, setActivating] = useState(false)
  const [payoutBusy, setPayoutBusy] = useState(false)
  const [payoutMsg, setPayoutMsg] = useState<string | null>(null)
  const [note, setNote] = useState('')

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/referrals')
      if (!res.ok) throw new Error('Failed to load your affiliate data.')
      setData(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function activate() {
    setActivating(true)
    setError(null)
    try {
      const res = await fetch('/api/referrals', { method: 'POST' })
      if (!res.ok) throw new Error('Could not activate your referral link.')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Activation failed.')
    } finally {
      setActivating(false)
    }
  }

  async function copyLink() {
    if (!data?.shareUrl) return
    try {
      await navigator.clipboard.writeText(data.shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Could not copy to clipboard.')
    }
  }

  async function requestPayout() {
    setPayoutBusy(true)
    setPayoutMsg(null)
    setError(null)
    try {
      const res = await fetch('/api/referrals/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: note.trim() || undefined }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error ?? 'Payout request failed.')
      setPayoutMsg('Payout requested! Drue will review it shortly.')
      setNote('')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Payout request failed.')
    } finally {
      setPayoutBusy(false)
    }
  }

  // --- Header -------------------------------------------------------------
  const header = (
    <div className="flex items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green/10 text-green">
        <Gift size={22} />
      </span>
      <div>
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-charcoal">
          Referrals
        </h1>
        <p className="font-body text-sm text-grey-dark">
          Refer a friend to Star Haven Strength and earn commissions.
        </p>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-10">
        {header}
        <p className="mt-10 font-body text-sm text-grey-dark">Loading...</p>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-10">
        {header}
        <p className="mt-10 font-body text-sm text-red-600">{error}</p>
      </div>
    )
  }

  // --- Not an affiliate yet → friendly join prompt ------------------------
  if (data && !data.isAffiliate) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-10">
        {header}
        <section className="mt-8 rounded-xl border border-grey-mid bg-white p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/15 text-gold-dark">
            <Gift size={28} />
          </span>
          <h2 className="mt-4 font-display text-xl font-bold uppercase tracking-tight text-charcoal">
            Refer a friend
          </h2>
          <p className="mx-auto mt-2 max-w-md font-body text-sm text-grey-dark">
            Earn a {data.commissionRatePercent}% commission every time someone
            you refer becomes a paying member. Activate your personal referral
            link to get started — it only takes a second.
          </p>
          <button
            type="button"
            onClick={activate}
            disabled={activating}
            className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-green px-6 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-green-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {activating ? 'Activating...' : 'Activate my referral link'}
          </button>
          {error && (
            <p className="mt-3 font-body text-sm text-red-600">{error}</p>
          )}
          <p className="mt-6 font-body text-xs text-grey-dark">
            Questions about the program?{' '}
            <Link href="/contact" className="font-semibold text-green underline">
              Contact the coach
            </Link>
            .
          </p>
        </section>
      </div>
    )
  }

  if (!data || !data.stats || !data.balances) return null

  const { stats, balances } = data

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-10">
      {header}

      <div className="mt-8 space-y-8">
        {/* Share link + commission rate */}
        <section className="rounded-xl border border-grey-mid bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-sm font-bold uppercase tracking-widest text-gold-dark">
              Your Referral Link
            </h2>
            <span className="rounded-full bg-green/10 px-3 py-1 font-display text-xs font-bold uppercase tracking-wide text-green">
              {data.commissionRatePercent}% commission
            </span>
          </div>
          <p className="mt-2 font-body text-sm text-grey-dark">
            Your referral code is{' '}
            <span className="font-mono font-bold text-charcoal">
              {data.code}
            </span>
            . Anyone who signs up through this link is tied to you, and you earn{' '}
            {data.commissionRatePercent}% of what they pay.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              readOnly
              value={data.shareUrl ?? ''}
              className="flex-1 rounded-lg border border-grey-mid bg-grey-light px-3 py-2 font-mono text-sm text-charcoal"
              onFocus={(e) => e.currentTarget.select()}
            />
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-green px-4 py-2 font-display text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-green-dark"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </section>

        {/* Funnel stats */}
        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={<Users size={20} />}
            label="Referred signups"
            value={String(stats.signups)}
          />
          <StatCard
            icon={<BadgeCheck size={20} />}
            label="Conversions"
            value={String(stats.conversions)}
            sub="became paying members"
          />
          <StatCard
            icon={<TrendingUp size={20} />}
            label="Conversion rate"
            value={`${stats.conversionRate}%`}
          />
        </section>

        {/* Earnings balances */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<DollarSign size={20} />}
            label="Available"
            value={money(balances.availableCents)}
            sub="ready to request"
          />
          <StatCard
            icon={<Clock size={20} />}
            label="In review"
            value={money(balances.inReviewCents)}
            sub="awaiting approval"
          />
          <StatCard
            icon={<Wallet size={20} />}
            label="Approved"
            value={money(balances.approvedCents)}
            sub="awaiting payment"
          />
          <StatCard
            icon={<BadgeCheck size={20} />}
            label="Paid out"
            value={money(balances.paidCents)}
            sub="lifetime"
          />
        </section>

        {/* Payout request */}
        <section className="rounded-xl border border-grey-mid bg-white p-6">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-gold-dark">
            Request a payout
          </h2>
          {data.hasPendingPayout ? (
            <p className="mt-2 font-body text-sm text-grey-dark">
              You have a payout request for{' '}
              <span className="font-semibold text-charcoal">
                {money(balances.inReviewCents)}
              </span>{' '}
              awaiting review. You can request another once it&apos;s processed.
            </p>
          ) : (
            <p className="mt-2 font-body text-sm text-grey-dark">
              You have{' '}
              <span className="font-semibold text-charcoal">
                {money(balances.availableCents)}
              </span>{' '}
              available. The minimum payout is{' '}
              <span className="font-semibold text-charcoal">
                {money(data.minPayoutCents)}
              </span>
              .
            </p>
          )}

          {/* Payout details: no dedicated field in the system yet, so the
              member includes their PayPal/method here and the coach reads it. */}
          <label className="mt-4 block font-display text-xs font-bold uppercase tracking-wide text-grey-dark">
            Payout details (PayPal email or preferred method)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="e.g. PayPal: you@example.com"
            disabled={data.hasPendingPayout}
            className="mt-1 w-full rounded-lg border border-grey-mid bg-grey-light px-3 py-2 font-body text-sm text-charcoal disabled:opacity-60"
          />
          <p className="mt-1 font-body text-xs text-grey-dark">
            Drue manages payments manually and will use these details. It&apos;s
            sent with your request and visible to the coach only.
          </p>

          {payoutMsg && (
            <p className="mt-3 font-body text-sm text-green">{payoutMsg}</p>
          )}
          {error && data && (
            <p className="mt-3 font-body text-sm text-red-600">{error}</p>
          )}

          <button
            type="button"
            onClick={requestPayout}
            disabled={payoutBusy || !data.canRequestPayout}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-gold px-5 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-charcoal transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {payoutBusy ? 'Requesting...' : 'Request payout'}
          </button>
          {!data.canRequestPayout && !data.hasPendingPayout && (
            <p className="mt-2 font-body text-xs text-grey-dark">
              You can request a payout once your available balance reaches{' '}
              {money(data.minPayoutCents)}.
            </p>
          )}
        </section>

        {/* Recent commissions */}
        <section className="rounded-xl border border-grey-mid bg-white p-6">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-gold-dark">
            Recent commissions
          </h2>
          {data.recentCommissions && data.recentCommissions.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left">
                <thead>
                  <tr className="border-b border-grey-mid font-display text-xs font-bold uppercase tracking-wide text-grey-dark">
                    <th className="pb-2 pr-4">Member</th>
                    <th className="pb-2 pr-4">Date</th>
                    <th className="pb-2 pr-4">Plan</th>
                    <th className="pb-2 pr-4">Amount</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="font-body text-sm text-charcoal">
                  {data.recentCommissions.map((c) => (
                    <tr key={c.id} className="border-b border-grey-light">
                      <td className="py-2.5 pr-4">{c.name}</td>
                      <td className="py-2.5 pr-4 text-grey-dark">
                        {formatDate(c.date)}
                      </td>
                      <td className="py-2.5 pr-4 text-grey-dark">{c.plan}</td>
                      <td className="py-2.5 pr-4 font-mono">
                        {money(c.amountCents)}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 font-display text-xs font-bold uppercase tracking-wide ${statusBadge(
                            c.status
                          )}`}
                        >
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-2 font-body text-sm text-grey-dark">
              No commissions yet. Share your link to start earning.
            </p>
          )}
        </section>

        {/* Payout history */}
        <section className="rounded-xl border border-grey-mid bg-white p-6">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-gold-dark">
            Payout history
          </h2>
          {data.payouts && data.payouts.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[480px] text-left">
                <thead>
                  <tr className="border-b border-grey-mid font-display text-xs font-bold uppercase tracking-wide text-grey-dark">
                    <th className="pb-2 pr-4">Requested</th>
                    <th className="pb-2 pr-4">Amount</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2">Processed</th>
                  </tr>
                </thead>
                <tbody className="font-body text-sm text-charcoal">
                  {data.payouts.map((p) => (
                    <tr key={p.id} className="border-b border-grey-light">
                      <td className="py-2.5 pr-4 text-grey-dark">
                        {formatDate(p.requestedAt)}
                      </td>
                      <td className="py-2.5 pr-4 font-mono">
                        {money(p.amountCents)}
                      </td>
                      <td className="py-2.5 pr-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 font-display text-xs font-bold uppercase tracking-wide ${statusBadge(
                            p.status
                          )}`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-grey-dark">
                        {p.processedAt ? formatDate(p.processedAt) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-2 font-body text-sm text-grey-dark">
              No payout requests yet.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="rounded-xl border border-grey-mid bg-white p-5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green/10 text-green">
        {icon}
      </span>
      <p className="mt-3 font-mono text-2xl font-bold text-charcoal">{value}</p>
      <p className="font-display text-xs font-bold uppercase tracking-wide text-grey-dark">
        {label}
      </p>
      {sub && <p className="mt-0.5 font-body text-xs text-grey-dark">{sub}</p>}
    </div>
  )
}
