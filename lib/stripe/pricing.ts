import type { SubscriptionTier, BillingPeriod } from '@/types'

/**
 * Single source of truth for Star Haven Strength pricing.
 *
 * Monthly prices are the brief's canonical values. Annual prices are billed as
 * one payment covering 12 months at a 15% discount:
 *   annualCents = round(monthlyCents * 12 * 0.85)
 */

export const ANNUAL_DISCOUNT_RATE = 0.15 // 15% off when paying annually

// Coupon IDs (created by scripts/stripe-setup.ts)
export const MILITARY_COUPON_ID = 'MILITARY_FOREVER'
export const NEWBIE_COUPON_ID = 'NEWBIE_3MONTHS'
export const VETERAN_PROMO_CODE = 'VETERAN20'

export const MILITARY_DISCOUNT_PERCENT = 20 // 20% forever
export const NEWBIE_DISCOUNT_CENTS = 5000 // $50 off
export const NEWBIE_DISCOUNT_MONTHS = 3 // first 3 months

export type TierKey = 'foundation' | 'custom' | 'performance' | 'elite'
export type Audience = 'civilian' | 'military'

export interface TierPricing {
  monthlyCents: number
  annualCents: number
}

export interface TierDefinition {
  key: TierKey
  /** Display name, e.g. "Foundation". */
  name: string
  /** Marketing tagline shown under the name. */
  tagline: string
  /** Tier number from the brief (Tier 4 = Foundation … Tier 1 = Elite). */
  tierNumber: number
  /** Whether to visually highlight this card as recommended. */
  highlighted: boolean
  civilian: TierPricing
  military: TierPricing
  /** Feature bullets shown on the card. */
  features: string[]
}

// -----------------------------------------------------------------------------
// Price constants (cents)
// -----------------------------------------------------------------------------

// Tier 4 — Foundation
const FOUNDATION_CIVILIAN_MONTHLY_CENTS = 10000 // $100/mo
const FOUNDATION_CIVILIAN_ANNUAL_CENTS = 102000 // $85/mo × 12 (15% off)
const FOUNDATION_MILITARY_MONTHLY_CENTS = 7500 // $75/mo
const FOUNDATION_MILITARY_ANNUAL_CENTS = 76500 // $63.75/mo × 12 (15% off)

// Tier 3 — Custom
const CUSTOM_CIVILIAN_MONTHLY_CENTS = 15000 // $150/mo
const CUSTOM_CIVILIAN_ANNUAL_CENTS = 153000 // $127.50/mo × 12
const CUSTOM_MILITARY_MONTHLY_CENTS = 12000 // $120/mo
const CUSTOM_MILITARY_ANNUAL_CENTS = 122400 // $102/mo × 12

// Tier 2 — Performance
const PERFORMANCE_CIVILIAN_MONTHLY_CENTS = 20000 // $200/mo
const PERFORMANCE_CIVILIAN_ANNUAL_CENTS = 204000 // $170/mo × 12
const PERFORMANCE_MILITARY_MONTHLY_CENTS = 15000 // $150/mo
const PERFORMANCE_MILITARY_ANNUAL_CENTS = 153000 // $127.50/mo × 12

// Tier 1 — Elite
const ELITE_CIVILIAN_MONTHLY_CENTS = 30000 // $300/mo
const ELITE_CIVILIAN_ANNUAL_CENTS = 306000 // $255/mo × 12
const ELITE_MILITARY_MONTHLY_CENTS = 22500 // $225/mo
const ELITE_MILITARY_ANNUAL_CENTS = 229500 // $191.25/mo × 12

// -----------------------------------------------------------------------------
// Tier definitions
// -----------------------------------------------------------------------------

const FOUNDATION_FEATURES = [
  'Full app access',
  'Pre-built workout templates',
  'Community chat',
  'Progress tracking tools',
]

const CUSTOM_FEATURES = [
  'Everything in Foundation',
  'Custom program built monthly',
  'Workout tracking & analytics',
  'Video form reviews',
  'Weekly check-in',
  '30-min monthly coaching call',
]

const PERFORMANCE_FEATURES = [
  'Everything in Custom',
  'Custom macros & nutrition plan',
  'Bi-weekly 30-min calls',
  'Direct messaging (24–48 hr response)',
]

const ELITE_FEATURES = [
  'Everything in Performance',
  'Weekly 30-min coaching call',
  'Priority daily text support',
  'First access to new programs',
]

export const TIERS: TierDefinition[] = [
  {
    key: 'foundation',
    name: 'Foundation',
    tagline: 'Self-guided training with the full toolkit',
    tierNumber: 4,
    highlighted: false,
    civilian: {
      monthlyCents: FOUNDATION_CIVILIAN_MONTHLY_CENTS,
      annualCents: FOUNDATION_CIVILIAN_ANNUAL_CENTS,
    },
    military: {
      monthlyCents: FOUNDATION_MILITARY_MONTHLY_CENTS,
      annualCents: FOUNDATION_MILITARY_ANNUAL_CENTS,
    },
    features: FOUNDATION_FEATURES,
  },
  {
    key: 'custom',
    name: 'Custom',
    tagline: 'A program built for you, refreshed monthly',
    tierNumber: 3,
    highlighted: true,
    civilian: {
      monthlyCents: CUSTOM_CIVILIAN_MONTHLY_CENTS,
      annualCents: CUSTOM_CIVILIAN_ANNUAL_CENTS,
    },
    military: {
      monthlyCents: CUSTOM_MILITARY_MONTHLY_CENTS,
      annualCents: CUSTOM_MILITARY_ANNUAL_CENTS,
    },
    features: CUSTOM_FEATURES,
  },
  {
    key: 'performance',
    name: 'Performance',
    tagline: 'Coaching, nutrition, and direct access',
    tierNumber: 2,
    highlighted: false,
    civilian: {
      monthlyCents: PERFORMANCE_CIVILIAN_MONTHLY_CENTS,
      annualCents: PERFORMANCE_CIVILIAN_ANNUAL_CENTS,
    },
    military: {
      monthlyCents: PERFORMANCE_MILITARY_MONTHLY_CENTS,
      annualCents: PERFORMANCE_MILITARY_ANNUAL_CENTS,
    },
    features: PERFORMANCE_FEATURES,
  },
  {
    key: 'elite',
    name: 'Elite',
    tagline: 'The highest level of personal coaching',
    tierNumber: 1,
    highlighted: false,
    civilian: {
      monthlyCents: ELITE_CIVILIAN_MONTHLY_CENTS,
      annualCents: ELITE_CIVILIAN_ANNUAL_CENTS,
    },
    military: {
      monthlyCents: ELITE_MILITARY_MONTHLY_CENTS,
      annualCents: ELITE_MILITARY_ANNUAL_CENTS,
    },
    features: ELITE_FEATURES,
  },
]

/** Build the SubscriptionTier enum value for a tier + audience. */
export function tierEnum(key: TierKey, audience: Audience): SubscriptionTier {
  return `${key}_${audience}` as SubscriptionTier
}

/** Map a tier key to its baseline rank (foundation:1 … elite:4). */
export function getTierBaseline(tier: SubscriptionTier | TierKey): number {
  const key = tier.split('_')[0] as TierKey
  const baselines: Record<TierKey, number> = {
    foundation: 1,
    custom: 2,
    performance: 3,
    elite: 4,
  }
  return baselines[key] ?? 1
}

/** Format cents as a USD string, e.g. 10000 → "$100". */
export function formatPrice(cents: number): string {
  const dollars = cents / 100
  return Number.isInteger(dollars)
    ? `$${dollars}`
    : `$${dollars.toFixed(2)}`
}

/** Monthly-equivalent price for display under an annual plan. */
export function monthlyEquivalentCents(annualCents: number): number {
  return Math.round(annualCents / 12)
}

/** Get the price in cents for a tier / audience / period. */
export function getPriceCents(
  tier: TierDefinition,
  audience: Audience,
  period: BillingPeriod
): number {
  const pricing = audience === 'military' ? tier.military : tier.civilian
  return period === 'annual' ? pricing.annualCents : pricing.monthlyCents
}

/**
 * The environment variable name holding the Stripe price id for a given
 * tier / audience / period, e.g. STRIPE_FOUNDATION_CIVILIAN_MONTHLY_PRICE_ID.
 * These are populated by scripts/stripe-setup.ts.
 */
export function priceIdEnvKey(
  key: TierKey,
  audience: Audience,
  period: BillingPeriod
): string {
  const periodPart = period === 'annual' ? 'ANNUAL' : 'MONTHLY'
  return `STRIPE_${key.toUpperCase()}_${audience.toUpperCase()}_${periodPart}_PRICE_ID`
}

/**
 * Resolve the Stripe price id for a tier / audience / period from the server
 * environment. Returns undefined if not configured yet. Server-only.
 */
export function resolvePriceId(
  key: TierKey,
  audience: Audience,
  period: BillingPeriod
): string | undefined {
  return process.env[priceIdEnvKey(key, audience, period)]
}
