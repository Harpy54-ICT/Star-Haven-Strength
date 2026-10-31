'use client'

import { useCallback, useEffect, useState } from 'react'
import { Gift, Copy, Check, Users, DollarSign } from 'lucide-react'

interface ReferralData {
  code: string
  shareUrl: string
  totalReferrals: number
  convertedReferrals: number
  earnedCents: number
  pendingCents: number
  hasPendingPayout: boolean
  pendingPayoutAmountCents: number
}

function money(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export default function ReferralsPage() {
  const [data, setData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [payoutBusy, setPayoutBusy] = useState(false)
  const [payoutMsg, setPayoutMsg] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/referrals')
      if (!res.ok) throw new Error('Failed to load referral data.')
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

  async function copyLink() {
    if (!data) return
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
      const res = await fetch('/api/referrals/payout', { method: 'POST' })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error ?? 'Payout request failed.')
      setPayoutMsg('Payout requested! Drue will review it shortly.')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Payout request failed.')
    } finally {
      setPayoutBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-10">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green/10 text-green">
          <Gift size={22} />
        </span>
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-charcoal">
            Referrals
          </h1>
          <p className="font-body text-sm text-grey-dark">
            Share Star Haven Strength and earn commissions.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="mt-10 font-body text-sm text-grey-dark">Loading…</p>
      ) : error && !data ? (
        <p className="mt-10 font-body text-sm text-red-600">{error}</p>
      ) : data ? (
        <div className="mt-8 space-y-8">
          {/* Share link */}
          <section className="rounded-xl border border-grey-mid bg-white p-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-widest text-gold-dark">
              Your Share Link
            </h2>
            <p className="mt-2 font-body text-sm text-grey-dark">
              Your referral code is{' '}
              <span className="font-mono font-bold text-charcoal">
                {data.code}
              </span>
              . Share this link — anyone who signs up through it is tied to you.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input
                readOnly
                value={data.shareUrl}
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

          {/* Stats */}
          <section className="grid gap-4 sm:grid-cols-3">
            <StatCard
              icon={<Users size={20} />}
              label="Referrals"
              value={String(data.totalReferrals)}
              sub={`${data.convertedReferrals} converted`}
            />
            <StatCard
              icon={<DollarSign size={20} />}
              label="Earned (paid)"
              value={money(data.earnedCents)}
            />
            <StatCard
              icon={<DollarSign size={20} />}
              label="Pending"
              value={money(data.pendingCents)}
            />
          </section>

          {/* Payout */}
          <section className="rounded-xl border border-grey-mid bg-white p-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-widest text-gold-dark">
              Payout
            </h2>
            {data.hasPendingPayout ? (
              <p className="mt-2 font-body text-sm text-grey-dark">
                You have a payout request for{' '}
                <span className="font-semibold text-charcoal">
                  {money(data.pendingPayoutAmountCents)}
                </span>{' '}
                awaiting review.
              </p>
            ) : (
              <p className="mt-2 font-body text-sm text-grey-dark">
                You have{' '}
                <span className="font-semibold text-charcoal">
                  {money(data.pendingCents)}
                </span>{' '}
                in pending commissions available to request.
              </p>
            )}

            {payoutMsg && (
              <p className="mt-3 font-body text-sm text-green">{payoutMsg}</p>
            )}
            {error && data && (
              <p className="mt-3 font-body text-sm text-red-600">{error}</p>
            )}

            <button
              type="button"
              onClick={requestPayout}
              disabled={
                payoutBusy || data.hasPendingPayout || data.pendingCents <= 0
              }
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-gold px-5 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-charcoal transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {payoutBusy ? 'Requesting…' : 'Request Payout'}
            </button>
          </section>
        </div>
      ) : null}
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
