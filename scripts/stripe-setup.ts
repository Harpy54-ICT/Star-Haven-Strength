/**
 * Star Haven Strength — one-time Stripe setup.
 *
 * Creates all 8 products (4 tiers × civilian/military), their monthly + annual
 * prices, the military + newbie coupons, the VETERAN20 promotion code, and the
 * webhook endpoint. Idempotent: existing resources are detected and reused, so
 * the script can be re-run safely.
 *
 * REQUIREMENTS (environment):
 *   - STRIPE_SECRET_KEY      (required)
 *   - NEXT_PUBLIC_APP_URL    (required for webhook endpoint registration;
 *                             e.g. https://www.starhavenstrength.com)
 *
 * RUN:
 *   npx tsx scripts/stripe-setup.ts
 *
 * When run locally, values are read from .env.local automatically (see the
 * dotenv loading below).
 *
 * OUTPUT:
 *   - prints every created/found id
 *   - writes scripts/stripe-ids.json
 *   - prints ready-to-paste env var lines
 */
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import Stripe from 'stripe'

// ---------------------------------------------------------------------------
// Minimal .env.local loader (no dotenv dependency required).
// ---------------------------------------------------------------------------
function loadEnvLocal(): void {
  const envPath = join(process.cwd(), '.env.local')
  if (!existsSync(envPath)) return
  const content = readFileSync(envPath, 'utf-8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = value
  }
}

loadEnvLocal()

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const APP_URL = process.env.NEXT_PUBLIC_APP_URL

if (!STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY is not set. Aborting.')
  process.exit(1)
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
})

// ---------------------------------------------------------------------------
// PRICE CONSTANTS (cents)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Product definitions
// ---------------------------------------------------------------------------

interface ProductDef {
  /** Stable lookup key stored in product metadata. */
  tier: string
  audience: 'civilian' | 'military'
  name: string
  description: string
  monthlyCents: number
  annualCents: number
  /** env var prefix, e.g. FOUNDATION_CIVILIAN */
  envPrefix: string
}

const PRODUCTS: ProductDef[] = [
  {
    tier: 'foundation_civilian',
    audience: 'civilian',
    name: 'Foundation — Civilian',
    description: 'Self-guided training with full app access.',
    monthlyCents: FOUNDATION_CIVILIAN_MONTHLY_CENTS,
    annualCents: FOUNDATION_CIVILIAN_ANNUAL_CENTS,
    envPrefix: 'FOUNDATION_CIVILIAN',
  },
  {
    tier: 'foundation_military',
    audience: 'military',
    name: 'Foundation — Military',
    description: 'Self-guided training with full app access (military).',
    monthlyCents: FOUNDATION_MILITARY_MONTHLY_CENTS,
    annualCents: FOUNDATION_MILITARY_ANNUAL_CENTS,
    envPrefix: 'FOUNDATION_MILITARY',
  },
  {
    tier: 'custom_civilian',
    audience: 'civilian',
    name: 'Custom — Civilian',
    description: 'A custom program built for you every month.',
    monthlyCents: CUSTOM_CIVILIAN_MONTHLY_CENTS,
    annualCents: CUSTOM_CIVILIAN_ANNUAL_CENTS,
    envPrefix: 'CUSTOM_CIVILIAN',
  },
  {
    tier: 'custom_military',
    audience: 'military',
    name: 'Custom — Military',
    description: 'A custom program built for you every month (military).',
    monthlyCents: CUSTOM_MILITARY_MONTHLY_CENTS,
    annualCents: CUSTOM_MILITARY_ANNUAL_CENTS,
    envPrefix: 'CUSTOM_MILITARY',
  },
  {
    tier: 'performance_civilian',
    audience: 'civilian',
    name: 'Performance — Civilian',
    description: 'Coaching, nutrition, and direct messaging.',
    monthlyCents: PERFORMANCE_CIVILIAN_MONTHLY_CENTS,
    annualCents: PERFORMANCE_CIVILIAN_ANNUAL_CENTS,
    envPrefix: 'PERFORMANCE_CIVILIAN',
  },
  {
    tier: 'performance_military',
    audience: 'military',
    name: 'Performance — Military',
    description: 'Coaching, nutrition, and direct messaging (military).',
    monthlyCents: PERFORMANCE_MILITARY_MONTHLY_CENTS,
    annualCents: PERFORMANCE_MILITARY_ANNUAL_CENTS,
    envPrefix: 'PERFORMANCE_MILITARY',
  },
  {
    tier: 'elite_civilian',
    audience: 'civilian',
    name: 'Elite — Civilian',
    description: 'The highest level of personal coaching.',
    monthlyCents: ELITE_CIVILIAN_MONTHLY_CENTS,
    annualCents: ELITE_CIVILIAN_ANNUAL_CENTS,
    envPrefix: 'ELITE_CIVILIAN',
  },
  {
    tier: 'elite_military',
    audience: 'military',
    name: 'Elite — Military',
    description: 'The highest level of personal coaching (military).',
    monthlyCents: ELITE_MILITARY_MONTHLY_CENTS,
    annualCents: ELITE_MILITARY_ANNUAL_CENTS,
    envPrefix: 'ELITE_MILITARY',
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Find a product by its metadata.tier, searching all (active) products. */
async function findProductByTier(
  tier: string
): Promise<Stripe.Product | null> {
  // Prefer the search API when available; fall back to list + filter.
  try {
    const result = await stripe.products.search({
      query: `metadata['tier']:'${tier}' AND active:'true'`,
      limit: 1,
    })
    if (result.data.length > 0) return result.data[0]
  } catch {
    // search may be unavailable on some accounts — fall back to listing.
    const list = await stripe.products.list({ active: true, limit: 100 })
    const found = list.data.find((p) => p.metadata?.tier === tier)
    if (found) return found
  }
  return null
}

/** Find an existing recurring price on a product for a given interval. */
async function findPrice(
  productId: string,
  interval: 'month' | 'year',
  unitAmount: number
): Promise<Stripe.Price | null> {
  const prices = await stripe.prices.list({
    product: productId,
    active: true,
    limit: 100,
  })
  return (
    prices.data.find(
      (p) =>
        p.recurring?.interval === interval &&
        p.unit_amount === unitAmount
    ) ?? null
  )
}

async function ensureProduct(def: ProductDef): Promise<Stripe.Product> {
  const existing = await findProductByTier(def.tier)
  if (existing) {
    console.log(`  ↳ product exists: ${def.name} (${existing.id})`)
    return existing
  }
  const product = await stripe.products.create({
    name: def.name,
    description: def.description,
    metadata: { tier: def.tier, audience: def.audience },
  })
  console.log(`  ✓ created product: ${def.name} (${product.id})`)
  return product
}

async function ensurePrice(
  productId: string,
  interval: 'month' | 'year',
  unitAmount: number,
  tier: string
): Promise<Stripe.Price> {
  const existing = await findPrice(productId, interval, unitAmount)
  if (existing) {
    console.log(`    ↳ price exists: ${interval} ${unitAmount} (${existing.id})`)
    return existing
  }
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: unitAmount,
    currency: 'usd',
    recurring: { interval },
    metadata: { tier, interval },
  })
  console.log(`    ✓ created price: ${interval} ${unitAmount} (${price.id})`)
  return price
}

async function ensureCoupon(
  id: string,
  params: Stripe.CouponCreateParams
): Promise<Stripe.Coupon> {
  try {
    const existing = await stripe.coupons.retrieve(id)
    console.log(`  ↳ coupon exists: ${id}`)
    return existing
  } catch {
    const coupon = await stripe.coupons.create({ ...params, id })
    console.log(`  ✓ created coupon: ${id}`)
    return coupon
  }
}

async function ensurePromotionCode(
  code: string,
  couponId: string
): Promise<Stripe.PromotionCode> {
  const existing = await stripe.promotionCodes.list({ code, limit: 1 })
  if (existing.data.length > 0) {
    console.log(`  ↳ promotion code exists: ${code}`)
    return existing.data[0]
  }
  const promo = await stripe.promotionCodes.create({
    code,
    coupon: couponId,
  })
  console.log(`  ✓ created promotion code: ${code}`)
  return promo
}

async function ensureWebhook(url: string): Promise<Stripe.WebhookEndpoint | null> {
  const events: Stripe.WebhookEndpointCreateParams.EnabledEvent[] = [
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'invoice.payment_succeeded',
    'invoice.payment_failed',
  ]
  const existingList = await stripe.webhookEndpoints.list({ limit: 100 })
  const existing = existingList.data.find((w) => w.url === url)
  if (existing) {
    console.log(`  ↳ webhook exists: ${url} (${existing.id})`)
    return existing
  }
  const webhook = await stripe.webhookEndpoints.create({
    url,
    enabled_events: events,
    description: 'Star Haven Strength subscription events',
  })
  console.log(`  ✓ created webhook: ${url} (${webhook.id})`)
  console.log(
    `  ⚠️  Save this signing secret as STRIPE_WEBHOOK_SECRET: ${webhook.secret}`
  )
  return webhook
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

interface SetupOutput {
  products: Record<
    string,
    { productId: string; monthlyPriceId: string; annualPriceId: string }
  >
  coupons: { military: string; newbie: string }
  promotionCode: string
  webhook?: { id: string; url: string }
  generatedAt: string
}

async function main() {
  console.log('🚀 Star Haven Strength — Stripe setup\n')

  const output: SetupOutput = {
    products: {},
    coupons: { military: '', newbie: '' },
    promotionCode: '',
    generatedAt: new Date().toISOString(),
  }
  const envLines: string[] = []

  console.log('📦 Products & prices:')
  for (const def of PRODUCTS) {
    const product = await ensureProduct(def)
    const monthly = await ensurePrice(
      product.id,
      'month',
      def.monthlyCents,
      def.tier
    )
    const annual = await ensurePrice(
      product.id,
      'year',
      def.annualCents,
      def.tier
    )
    output.products[def.tier] = {
      productId: product.id,
      monthlyPriceId: monthly.id,
      annualPriceId: annual.id,
    }
    envLines.push(`STRIPE_${def.envPrefix}_MONTHLY_PRICE_ID=${monthly.id}`)
    envLines.push(`STRIPE_${def.envPrefix}_ANNUAL_PRICE_ID=${annual.id}`)
  }

  console.log('\n🎟️  Coupons:')
  const militaryCoupon = await ensureCoupon('MILITARY_FOREVER', {
    percent_off: 20,
    duration: 'forever',
    name: 'Military — 20% forever',
  })
  const newbieCoupon = await ensureCoupon('NEWBIE_3MONTHS', {
    amount_off: 5000,
    currency: 'usd',
    duration: 'repeating',
    duration_in_months: 3,
    name: 'New client — $50 off first 3 months',
  })
  output.coupons.military = militaryCoupon.id
  output.coupons.newbie = newbieCoupon.id
  envLines.push(`STRIPE_MILITARY_COUPON_ID=${militaryCoupon.id}`)
  envLines.push(`STRIPE_NEWBIE_COUPON_ID=${newbieCoupon.id}`)

  console.log('\n🏷️  Promotion codes:')
  const promo = await ensurePromotionCode('VETERAN20', militaryCoupon.id)
  output.promotionCode = promo.code

  console.log('\n🔔 Webhook:')
  if (!APP_URL) {
    console.warn(
      '  ⚠️  NEXT_PUBLIC_APP_URL is not set — skipping webhook registration.'
    )
    console.warn(
      '     Set NEXT_PUBLIC_APP_URL and re-run, or register the webhook manually.'
    )
  } else {
    const webhookUrl = `${APP_URL.replace(/\/$/, '')}/api/webhooks/stripe`
    const webhook = await ensureWebhook(webhookUrl)
    if (webhook) {
      output.webhook = { id: webhook.id, url: webhook.url }
    }
  }

  // Write stripe-ids.json
  const outPath = join(process.cwd(), 'scripts', 'stripe-ids.json')
  writeFileSync(outPath, JSON.stringify(output, null, 2) + '\n')
  console.log(`\n💾 Wrote ${outPath}`)

  // Print env var block
  console.log('\n===================================================')
  console.log('📋 Copy these into Vercel / .env.local:')
  console.log('===================================================')
  console.log(envLines.join('\n'))
  console.log('===================================================')
  console.log(
    '\n✅ Done. (Remember to also set STRIPE_WEBHOOK_SECRET from the webhook above.)'
  )
}

main().catch((error) => {
  console.error('❌ Stripe setup failed:', error)
  process.exit(1)
})
