'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2, Star } from 'lucide-react'
import type { BillingPeriod } from '@/types'
import {
  formatPrice,
  monthlyEquivalentCents,
  type Audience,
} from '@/lib/stripe/pricing'

export interface PlanCardProps {
  tierName: string
  tagline: string
  features: string[]
  audience: Audience
  billingPeriod: BillingPeriod
  monthlyCents: number
  annualCents: number
  /** Stripe price id for the currently-selected period; undefined if not set up. */
  priceId?: string
  highlighted?: boolean
  /** True when the viewer is authenticated (checkout available). */
  isAuthenticated?: boolean
}

export default function PlanCard({
  tierName,
  tagline,
  features,
  audience,
  billingPeriod,
  monthlyCents,
  annualCents,
  priceId,
  highlighted = false,
  isAuthenticated = false,
}: PlanCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isAnnual = billingPeriod === 'annual'
  const displayCents = isAnnual
    ? monthlyEquivalentCents(annualCents)
    : monthlyCents

  async function handleSelect() {
    setError('')

    if (!isAuthenticated) {
      // Send unauthenticated users to register, preserving intent.
      router.push('/register?callbackUrl=/pricing')
      return
    }

    if (!priceId) {
      setError('This plan is not available yet. Please check back soon.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, billingPeriod }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) {
        setError(data.error || 'Could not start checkout. Please try again.')
        setLoading(false)
        return
      }
      window.location.href = data.url
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div
      className={`relative flex h-full flex-col rounded-xl bg-white p-6 shadow-md transition-shadow hover:shadow-lg ${
        highlighted ? 'ring-2 ring-gold' : 'border border-grey-mid'
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-gold px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-dark">
          <Star size={12} className="fill-green-dark" />
          Most Popular
        </div>
      )}

      <h3 className="font-display text-2xl font-bold text-green">{tierName}</h3>
      <p className="mt-1 min-h-[2.5rem] font-body text-sm text-grey-dark">
        {tagline}
      </p>

      <div className="mt-4">
        <span className="font-mono text-4xl font-bold text-charcoal">
          {formatPrice(displayCents)}
        </span>
        <span className="font-body text-sm text-grey-dark"> / mo</span>
        {isAnnual && (
          <p className="mt-1 font-body text-xs text-green-light">
            Billed annually ({formatPrice(annualCents)}/yr) · save 15%
          </p>
        )}
      </div>

      <ul className="mt-6 flex-1 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0 text-green-light"
            />
            <span className="font-body text-sm text-charcoal">{feature}</span>
          </li>
        ))}
      </ul>

      {audience === 'military' && (
        <p className="mt-4 font-body text-xs text-gold-dark">
          20% lifetime discount applied after verification.
        </p>
      )}

      {error && (
        <p className="mt-3 font-body text-xs text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSelect}
        disabled={loading}
        className={`mt-6 flex w-full items-center justify-center gap-2 rounded-lg py-3 font-display font-semibold uppercase tracking-wide transition-colors disabled:opacity-70 ${
          highlighted
            ? 'bg-gold text-green-dark hover:bg-gold-light'
            : 'bg-green text-gold hover:bg-green-light'
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            Starting…
          </>
        ) : (
          'Choose Plan'
        )}
      </button>
    </div>
  )
}
