'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { MessageSquare, ShieldCheck } from 'lucide-react'
import ClientProgressCharts from '@/components/admin/ClientProgressCharts'

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

const TABS = [
  'Overview',
  'Program',
  'Logs',
  'Check-Ins',
  'Subscription',
  'Progress',
] as const
type Tab = (typeof TABS)[number]

interface ProgramAssignment {
  id: string
  status: string
  enrolledAt: string
  cohort: {
    id: string
    name: string
    durationWeeks: number
    status: string
  }
}
interface ProgramOption {
  id: string
  name: string
  status: string
}

/** Self-fetching admin tab to assign / update a client's program. */
function ProgramTab({ userId }: { userId: string }) {
  const [assignments, setAssignments] = useState<ProgramAssignment[]>([])
  const [programs, setPrograms] = useState<ProgramOption[]>([])
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/clients/${userId}/program`)
    if (res.ok) {
      const data = await res.json()
      setAssignments(data.assignments ?? [])
      setPrograms(data.programs ?? [])
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  async function assign() {
    if (!selected) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/clients/${userId}/program`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cohortId: selected }),
      })
      if (res.ok) {
        setSelected('')
        await load()
      }
    } finally {
      setSaving(false)
    }
  }

  async function unassign(cohortId: string) {
    const res = await fetch(
      `/api/admin/clients/${userId}/program?cohortId=${cohortId}`,
      { method: 'DELETE' }
    )
    if (res.ok) await load()
  }

  if (loading) {
    return (
      <p className="font-body text-sm text-grey-dark">Loading program…</p>
    )
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-grey-mid bg-white p-5">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-green">
          Assign a Program
        </h3>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="min-w-[14rem] rounded-lg border border-grey-mid px-3 py-2 font-body text-sm text-charcoal focus:border-green focus:outline-none"
          >
            <option value="">Select a program…</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.status})
              </option>
            ))}
          </select>
          <button
            onClick={assign}
            disabled={saving || !selected}
            className="rounded-lg bg-green px-4 py-2 font-body text-sm font-semibold text-gold hover:bg-green-light disabled:opacity-50"
          >
            {saving ? 'Assigning…' : 'Assign'}
          </button>
        </div>
        <p className="mt-2 font-body text-xs text-grey-dark">
          The client is notified and the program appears on their My Program
          page.
        </p>
      </div>

      <div className="rounded-xl border border-grey-mid bg-white p-5">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-green">
          Current Assignments
        </h3>
        {assignments.length === 0 ? (
          <p className="mt-2 font-body text-sm text-grey-dark">
            No programs assigned yet.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-grey-mid">
            {assignments.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between py-2.5"
              >
                <div>
                  <p className="font-body text-sm font-semibold text-charcoal">
                    {a.cohort.name}
                  </p>
                  <p className="font-mono text-xs text-grey-dark">
                    {a.cohort.durationWeeks} wks · status: {a.status}
                  </p>
                </div>
                <button
                  onClick={() => unassign(a.cohort.id)}
                  className="rounded-md border border-grey-mid px-2.5 py-1.5 font-body text-xs font-semibold text-red-600 hover:bg-grey-light"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

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

        {tab === 'Program' && <ProgramTab userId={user.id} />}

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

        {tab === 'Progress' && <ClientProgressCharts clientId={user.id} />}
      </div>
    </div>
  )
}
