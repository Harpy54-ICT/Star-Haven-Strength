import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import PricingClient, {
  type PriceIdMap,
} from '@/components/pricing/PricingClient'
import { TIERS, resolvePriceId, type Audience } from '@/lib/stripe/pricing'
import type { BillingPeriod } from '@/types'

export const metadata: Metadata = {
  title: 'Pricing | Star Haven Strength',
  description:
    'Choose your Star Haven Strength plan. Four coaching tiers for civilians and military, billed monthly or annually.',
}

const AUDIENCES: Audience[] = ['civilian', 'military']
const PERIODS: BillingPeriod[] = ['monthly', 'annual']

export default async function PricingPage() {
  const session = await auth()
  const isAuthenticated = !!session?.user?.id

  // Resolve all Stripe price ids server-side so the client never sees env vars.
  const priceIds: PriceIdMap = {}
  for (const tier of TIERS) {
    for (const audience of AUDIENCES) {
      for (const period of PERIODS) {
        priceIds[`${tier.key}_${audience}_${period}`] = resolvePriceId(
          tier.key,
          audience,
          period
        )
      }
    }
  }

  return (
    <main className="min-h-screen bg-charcoal">
      {/* Hero */}
      <section className="px-4 pt-20 text-center">
        <span className="font-display text-sm font-bold uppercase tracking-[0.3em] text-gold">
          Star Haven Strength
        </span>
        <h1 className="mt-4 font-display text-5xl font-extrabold uppercase tracking-wide text-white sm:text-6xl">
          Choose Your Plan
        </h1>
        <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-white/70">
          Train like a Star. Pick the level of coaching that fits your goals —
          upgrade, downgrade, or cancel anytime.
        </p>
      </section>

      <PricingClient priceIds={priceIds} isAuthenticated={isAuthenticated} />
    </main>
  )
}
