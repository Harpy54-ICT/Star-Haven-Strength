'use client'

import { useState } from 'react'
import { ShieldCheck, Lock, FileX2 } from 'lucide-react'
import type { BillingPeriod } from '@/types'
import PlanCard from '@/components/pricing/PlanCard'
import { TIERS, type Audience, type TierKey } from '@/lib/stripe/pricing'

/**
 * Resolved Stripe price ids keyed as `${tierKey}_${audience}_${period}`.
 * Produced server-side and passed down so the client never touches env vars.
 */
export type PriceIdMap = Record<string, string | undefined>

interface PricingClientProps {
  priceIds: PriceIdMap
  isAuthenticated: boolean
}

const AUDIENCES: { key: Audience; label: string; note: string }[] = [
  {
    key: 'civilian',
    label: 'Civilian',
    note: 'Standard membership pricing.',
  },
  {
    key: 'military',
    label: 'Military & Veteran',
    note: '20% lifetime discount applied after verification.',
  },
]

export default function PricingClient({
  priceIds,
  isAuthenticated,
}: PricingClientProps) {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')

  return (
    <>
      {/* Billing period toggle */}
      <div className="mt-8 flex items-center justify-center gap-4">
        <span
          className={`font-body text-sm font-medium ${
            billingPeriod === 'monthly' ? 'text-white' : 'text-white/50'
          }`}
        >
          Monthly
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={billingPeriod === 'annual'}
          onClick={() =>
            setBillingPeriod((p) => (p === 'monthly' ? 'annual' : 'monthly'))
          }
          className="relative h-7 w-14 rounded-full bg-green-light transition-colors"
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-gold transition-transform ${
              billingPeriod === 'annual' ? 'translate-x-8' : 'translate-x-1'
            }`}
          />
        </button>
        <span
          className={`font-body text-sm font-medium ${
            billingPeriod === 'annual' ? 'text-white' : 'text-white/50'
          }`}
        >
          Annual{' '}
          <span className="rounded-full bg-gold/20 px-2 py-0.5 text-xs text-gold">
            Save 15%
          </span>
        </span>
      </div>

      {/* Newbie note */}
      <p className="mt-6 text-center font-body text-sm font-medium text-gold">
        New clients receive $50 off their first 3 months — automatically.
      </p>

      {/* Audience columns */}
      <div className="mx-auto mt-12 max-w-7xl space-y-16 px-4">
        {AUDIENCES.map((aud) => (
          <section key={aud.key}>
            <div className="mb-6 text-center">
              <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-white">
                {aud.label}
              </h2>
              <p className="mt-1 font-body text-sm text-white/60">{aud.note}</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {TIERS.map((tier) => {
                const pricing =
                  aud.key === 'military' ? tier.military : tier.civilian
                const idKey = `${tier.key}_${aud.key}_${billingPeriod}`
                return (
                  <PlanCard
                    key={`${tier.key}_${aud.key}`}
                    tierName={tier.name}
                    tagline={tier.tagline}
                    features={tier.features}
                    audience={aud.key}
                    billingPeriod={billingPeriod}
                    monthlyCents={pricing.monthlyCents}
                    annualCents={pricing.annualCents}
                    priceId={priceIds[idKey]}
                    highlighted={tier.highlighted}
                    isAuthenticated={isAuthenticated}
                  />
                )
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Comparison table */}
      <ComparisonTable />

      {/* Trust badges */}
      <div className="mx-auto mt-16 flex max-w-4xl flex-wrap items-center justify-center gap-8 px-4 pb-20 text-white/70">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-gold" />
          <span className="font-body text-sm">Cancel anytime</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock size={20} className="text-gold" />
          <span className="font-body text-sm">Secure checkout by Stripe</span>
        </div>
        <div className="flex items-center gap-2">
          <FileX2 size={20} className="text-gold" />
          <span className="font-body text-sm">No contracts</span>
        </div>
      </div>
    </>
  )
}

// -----------------------------------------------------------------------------
// Feature comparison table
// -----------------------------------------------------------------------------

const COMPARISON_ROWS: {
  feature: string
  values: Record<TierKey, boolean | string>
}[] = [
  {
    feature: 'Full app access',
    values: { foundation: true, custom: true, performance: true, elite: true },
  },
  {
    feature: 'Pre-built templates',
    values: { foundation: true, custom: true, performance: true, elite: true },
  },
  {
    feature: 'Community chat',
    values: { foundation: true, custom: true, performance: true, elite: true },
  },
  {
    feature: 'Custom program monthly',
    values: { foundation: false, custom: true, performance: true, elite: true },
  },
  {
    feature: 'Video form reviews',
    values: { foundation: false, custom: true, performance: true, elite: true },
  },
  {
    feature: 'Coaching calls',
    values: {
      foundation: '—',
      custom: '30-min monthly',
      performance: 'Bi-weekly 30-min',
      elite: 'Weekly 30-min',
    },
  },
  {
    feature: 'Custom macros & nutrition',
    values: {
      foundation: false,
      custom: false,
      performance: true,
      elite: true,
    },
  },
  {
    feature: 'Direct messaging',
    values: {
      foundation: false,
      custom: false,
      performance: '24–48 hr',
      elite: 'Priority daily',
    },
  },
]

const TIER_ORDER: TierKey[] = ['foundation', 'custom', 'performance', 'elite']

function Cell({ value }: { value: boolean | string }) {
  if (value === true) {
    return <span className="text-green-light">✓</span>
  }
  if (value === false) {
    return <span className="text-white/30">—</span>
  }
  return <span className="text-white/80">{value}</span>
}

function ComparisonTable() {
  return (
    <div className="mx-auto mt-20 max-w-5xl px-4">
      <h2 className="mb-8 text-center font-display text-3xl font-bold uppercase tracking-wide text-white">
        Compare Plans
      </h2>
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="bg-white/5">
              <th className="p-4 font-body text-sm font-semibold text-white/70">
                Feature
              </th>
              {TIER_ORDER.map((key) => (
                <th
                  key={key}
                  className="p-4 text-center font-display text-base font-bold uppercase text-gold"
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row, i) => (
              <tr
                key={row.feature}
                className={i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.03]'}
              >
                <td className="p-4 font-body text-sm text-white">
                  {row.feature}
                </td>
                {TIER_ORDER.map((key) => (
                  <td
                    key={key}
                    className="p-4 text-center font-body text-sm"
                  >
                    <Cell value={row.values[key]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
