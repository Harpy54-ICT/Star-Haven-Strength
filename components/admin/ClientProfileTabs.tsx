'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MessageSquare, ShieldCheck } from 'lucide-react'

export interface ClientProfileData {
  user: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    image: string | null
    accountType: string
    militaryBranch: string | null
    militaryVerified: boolean
    totalXP: number
    createdAt: string
  }
  workoutLogs: {
    id: string
    name: string | null
    durationMinutes: number | null
    totalSets: number | null
    exerciseCount: number
    loggedAt: string
  }[]
  latestMetric: {
    weightKg: number | null
    bodyFatPercentage: number | null
    measuredAt: string
  } | null
  checkIns: {
    id: string
    weekStart: string
    mood: number | null
    energy: number | null
    stress: number | null
    wentWell: string | null
    challenging: string | null
  }[]
  subscription: {
    tier: string
    status: string
    currentPeriodEnd: string | null
    cancelAtPeriodEnd: boolean
  } | null
  newbieDesignation: {
    currentWeek: number
    currentPhase: string
    discountActive: boolean
  } | null
  sessionCount: number
  referral: { code: string | null; referralsMade: number }
}

const TABS = ['Overview', 'Logs', 'Check-Ins', 'Subscription'] as const
type Tab = (typeof TABS)[number]

function tierLabel(tier: string): string {
  const [key, audience] = tier.split('_')
  const name = key.charAt(0).toUpperCase() + key.slice(1)
  return audience ? `${name} (${audience})` : name
}

function fmtDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString() : '—'
}

export default function ClientProfileTabs({ data }: { data: ClientProfileData }) {
  const [tab, setTab] = useState<Tab>('Overview')
  const { user } = data
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Unnamed'
  const initials =
    (user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '') || 'U'

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-xl border border-grey-mid bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-green font-display text-lg font-bold uppercase text-gold">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt={name} className="h-full w-full object-cover" />
            ) : (
              initials.toUpperCase()
            )}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-green">{name}</h1>
            <p className="font-body text-sm text-grey-dark">{user.email}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-green/10 px-2 py-0.5 font-display text-[10px] font-bold uppercase text-green">
                {user.accountType}
              </span>
              {user.militaryVerified && (
                <span className="flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5 font-display text-[10px] font-bold uppercase text-gold-dark">
                  <ShieldCheck size={11} /> Verified
                </span>
              )}
            </div>
          </div>
        </div>
        <Link
          href={`/dashboard/messages?to=${user.id}`}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-green px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-gold hover:bg-green-light"
        >
          <MessageSquare size={16} /> Send Message
        </Link>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 font-display text-sm font-bold uppercase tracking-wide ${
              tab === t ? 'bg-green text-gold' : 'border border-grey-mid text-grey-dark'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'Overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-grey-mid bg-white p-4">
                <p className="font-mono text-2xl font-bold text-charcoal">
                  {user.totalXP.toLocaleString()}
                </p>
                <p className="font-body text-xs text-grey-dark">Total XP</p>
              </div>
              <div className="rounded-xl border border-grey-mid bg-white p-4">
                <p className="font-mono text-2xl font-bold text-charcoal">
                  {data.workoutLogs.length}
                </p>
                <p className="font-body text-xs text-grey-dark">Recent Workouts</p>
              </div>
              <div className="rounded-xl border border-grey-mid bg-white p-4">
                <p className="font-mono text-2xl font-bold text-charcoal">
                  {data.sessionCount}
                </p>
                <p className="font-body text-xs text-grey-dark">Total Sessions</p>
              </div>
              <div className="rounded-xl border border-grey-mid bg-white p-4">
                <p className="font-mono text-2xl font-bold text-charcoal">
                  {data.newbieDesignation
                    ? `Wk ${data.newbieDesignation.currentWeek}`
                    : '—'}
                </p>
                <p className="font-body text-xs text-grey-dark">Current Week</p>
              </div>
            </div>
            <div className="rounded-xl border border-grey-mid bg-white p-5">
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <dt className="font-body text-xs text-grey-dark">Joined</dt>
                  <dd className="font-body text-sm text-charcoal">
                    {fmtDate(user.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="font-body text-xs text-grey-dark">
                    Military Branch
                  </dt>
                  <dd className="font-body text-sm text-charcoal">
                    {user.militaryBranch ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="font-body text-xs text-grey-dark">
                    Referral Code
                  </dt>
                  <dd className="font-mono text-sm text-charcoal">
                    {data.referral.code ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="font-body text-xs text-grey-dark">
                    Referrals Made
                  </dt>
                  <dd className="font-mono text-sm text-charcoal">
                    {data.referral.referralsMade}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {tab === 'Logs' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-grey-mid bg-white p-5">
              <h3 className="font-display text-sm font-bold uppercase tracking-wide text-green">
                Recent Workouts
              </h3>
              {data.workoutLogs.length === 0 ? (
                <p className="mt-2 font-body text-sm text-grey-dark">
                  No workouts logged.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-grey-mid">
                  {data.workoutLogs.map((w) => (
                    <li key={w.id} className="flex justify-between py-2">
                      <span className="font-body text-sm text-charcoal">
                        {w.name ?? 'Workout'}
                      </span>
                      <span className="font-mono text-xs text-grey-dark">
                        {fmtDate(w.loggedAt)} · {w.exerciseCount} ex ·{' '}
                        {w.durationMinutes ?? 0} min
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-xl border border-grey-mid bg-white p-5">
              <h3 className="font-display text-sm font-bold uppercase tracking-wide text-green">
                Latest Body Metric
              </h3>
              {data.latestMetric ? (
                <p className="mt-2 font-body text-sm text-charcoal">
                  {data.latestMetric.weightKg != null
                    ? `${Math.round(data.latestMetric.weightKg * 2.2046)} lbs`
                    : 'No weight'}
                  {data.latestMetric.bodyFatPercentage != null
                    ? ` · ${data.latestMetric.bodyFatPercentage}% BF`
                    : ''}{' '}
                  <span className="font-mono text-xs text-grey-dark">
                    ({fmtDate(data.latestMetric.measuredAt)})
                  </span>
                </p>
              ) : (
                <p className="mt-2 font-body text-sm text-grey-dark">
                  No metrics recorded.
                </p>
              )}
            </div>
          </div>
        )}

        {tab === 'Check-Ins' && (
          <div className="space-y-3">
            {data.checkIns.length === 0 ? (
              <p className="rounded-xl border border-grey-mid bg-white p-6 text-center font-body text-sm text-grey-dark">
                No check-ins submitted.
              </p>
            ) : (
              data.checkIns.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border border-grey-mid bg-white p-4"
                >
                  <p className="font-display text-sm font-bold uppercase tracking-wide text-green">
                    Week of {fmtDate(c.weekStart)}
                  </p>
                  <p className="mt-1 font-mono text-xs text-grey-dark">
                    Mood {c.mood ?? '—'} · Energy {c.energy ?? '—'} · Stress{' '}
                    {c.stress ?? '—'}
                  </p>
                  {c.wentWell && (
                    <p className="mt-2 font-body text-sm text-charcoal">
                      <span className="font-semibold">Went well:</span>{' '}
                      {c.wentWell}
                    </p>
                  )}
                  {c.challenging && (
                    <p className="mt-1 font-body text-sm text-charcoal">
                      <span className="font-semibold">Challenging:</span>{' '}
                      {c.challenging}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'Subscription' && (
          <div className="rounded-xl border border-grey-mid bg-white p-5">
            {data.subscription ? (
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <dt className="font-body text-xs text-grey-dark">Plan</dt>
                  <dd className="font-body text-sm font-semibold text-charcoal">
                    {tierLabel(data.subscription.tier)}
                  </dd>
                </div>
                <div>
                  <dt className="font-body text-xs text-grey-dark">Status</dt>
                  <dd className="font-body text-sm capitalize text-charcoal">
                    {data.subscription.status}
                    {data.subscription.cancelAtPeriodEnd && ' (canceling)'}
                  </dd>
                </div>
                <div>
                  <dt className="font-body text-xs text-grey-dark">
                    Next Billing
                  </dt>
                  <dd className="font-body text-sm text-charcoal">
                    {fmtDate(data.subscription.currentPeriodEnd)}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="font-body text-sm text-grey-dark">
                No active subscription (Free tier).
              </p>
            )}

            {data.newbieDesignation && (
              <div className="mt-4 rounded-lg border border-gold/40 bg-gold/10 p-4">
                <p className="font-display text-xs font-bold uppercase tracking-wide text-gold-dark">
                  Newbie Designation
                </p>
                <p className="mt-1 font-body text-sm text-charcoal">
                  Week {data.newbieDesignation.currentWeek} ·{' '}
                  {data.newbieDesignation.currentPhase} ·{' '}
                  {data.newbieDesignation.discountActive
                    ? 'Discount active'
                    : 'Discount inactive'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
