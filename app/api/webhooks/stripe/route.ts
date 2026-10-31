import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { randomBytes } from 'crypto'
import { db } from '@/lib/db/client'
import { stripe } from '@/lib/stripe/client'
import { getTierBaseline } from '@/lib/stripe/pricing'
import {
  computeCommissionCents,
  commissionMonthKey,
} from '@/lib/referrals/commission'
import type {
  SubscriptionTier,
  SubscriptionStatus,
} from '@/types'

/**
 * Stripe webhook handler.
 *
 * - POST only, NOT wrapped in withAuth (Stripe is the caller).
 * - Raw body read as text and verified with the webhook signing secret.
 * - Returns 200 for handler errors (so Stripe does not retry forever on a bug);
 *   only signature-verification failures return a non-2xx.
 * - Idempotent: each event id is recorded in ProcessedStripeEvent and skipped
 *   if seen before.
 */

// The App Router parses JSON bodies by default for route handlers, but reading
// req.text() still yields the raw body, which is what signature verification
// requires. Mark the route dynamic so it is never statically optimized.
export const dynamic = 'force-dynamic'

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case 'active':
      return 'active'
    case 'trialing':
      return 'trialing'
    case 'past_due':
    case 'unpaid':
      return 'past_due'
    case 'canceled':
    case 'incomplete':
    case 'incomplete_expired':
    case 'paused':
      return 'canceled'
    default:
      return 'active'
  }
}

/** Extract the tier from a subscription's product metadata (or price metadata). */
function extractTier(
  subscription: Stripe.Subscription
): SubscriptionTier | null {
  const item = subscription.items.data[0]
  const price = item?.price
  const product = price?.product
  if (product && typeof product !== 'string' && 'metadata' in product) {
    const tier = product.metadata?.tier
    if (tier) return tier as SubscriptionTier
  }
  const priceTier = price?.metadata?.tier
  if (priceTier) return priceTier as SubscriptionTier
  return null
}

function periodDates(subscription: Stripe.Subscription): {
  start: Date | null
  end: Date | null
} {
  const start = subscription.current_period_start
    ? new Date(subscription.current_period_start * 1000)
    : null
  const end = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : null
  return { start, end }
}

async function findUserIdForCustomer(
  customerId: string,
  fallbackUserId?: string | null
): Promise<string | null> {
  if (fallbackUserId) return fallbackUserId
  const user = await db.user.findFirst({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  })
  return user?.id ?? null
}

/** Retrieve a full subscription with product expanded for tier extraction. */
async function retrieveSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['items.data.price.product'],
  })
}

async function upsertSubscription(
  userId: string,
  subscription: Stripe.Subscription
): Promise<void> {
  const tier = extractTier(subscription)
  const { start, end } = periodDates(subscription)
  const priceId = subscription.items.data[0]?.price?.id ?? null
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id

  const data = {
    userId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    status: mapStripeStatus(subscription.status),
    currentPeriodStart: start,
    currentPeriodEnd: end,
    cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
    ...(tier ? { tier } : {}),
  }

  await db.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    // tier is required on create; fall back to foundation_civilian if unknown.
    create: {
      ...data,
      tier: tier ?? ('foundation_civilian' as SubscriptionTier),
    },
    update: data,
  })
}

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  if (session.mode !== 'subscription' || !session.subscription) return

  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription.id
  const customerId =
    typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id ?? ''

  const userId = await findUserIdForCustomer(
    customerId,
    session.metadata?.userId ?? null
  )
  if (!userId) {
    console.error('[stripe] checkout.session.completed: no user for', customerId)
    return
  }

  const subscription = await retrieveSubscription(subscriptionId)
  await upsertSubscription(userId, subscription)

  const tier = extractTier(subscription)

  // Create a NewbieDesignation if the user doesn't have one yet.
  const existingNewbie = await db.newbieDesignation.findUnique({
    where: { userId },
  })
  if (!existingNewbie) {
    await db.newbieDesignation.create({
      data: {
        userId,
        paidTierBaseline: tier ? String(getTierBaseline(tier)) : null,
      },
    })
  }

  // Generate a referral code if the user doesn't have one.
  const existingCode = await db.referralCode.findUnique({ where: { userId } })
  if (!existingCode) {
    const code = `SHS-${randomBytes(4).toString('hex').toUpperCase()}`
    await db.referralCode.create({ data: { userId, code } })
  }

  // Affiliate attribution: mark the most recent click for this partner as
  // converted (earnings themselves are accrued on invoice.payment_succeeded).
  const affiliatePartnerId = session.metadata?.affiliatePartnerId
  if (affiliatePartnerId) {
    const click = await db.affiliateClick.findFirst({
      where: {
        partnerId: affiliatePartnerId,
        converted: false,
        ...(userId ? { userId } : {}),
      },
      orderBy: { clickedAt: 'desc' },
      select: { id: true },
    })
    if (click) {
      await db.affiliateClick
        .update({
          where: { id: click.id },
          data: {
            converted: true,
            orderValueCents: session.amount_total ?? null,
          },
        })
        .catch(() => null)
    }
  }
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<void> {
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id
  const userId = await findUserIdForCustomer(
    customerId,
    subscription.metadata?.userId ?? null
  )
  if (!userId) {
    console.error('[stripe] subscription.updated: no user for', customerId)
    return
  }
  // Re-retrieve with product expanded so tier is available.
  const full = await retrieveSubscription(subscription.id)
  await upsertSubscription(userId, full)
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  await db.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: { status: 'canceled', cancelAtPeriodEnd: false },
  })
}

async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice
): Promise<void> {
  const subscriptionId =
    typeof invoice.subscription === 'string'
      ? invoice.subscription
      : invoice.subscription?.id
  if (!subscriptionId) return

  const periodEnd = invoice.lines.data[0]?.period?.end
  await db.subscription.updateMany({
    where: { stripeSubscriptionId: subscriptionId },
    data: {
      status: 'active',
      ...(periodEnd
        ? { currentPeriodEnd: new Date(periodEnd * 1000) }
        : {}),
    },
  })

  // Referral commission: if the paying user was referred (a converted Referral
  // exists), credit the referrer a commission for this payment.
  await maybeCreateReferralCommission(invoice)

  // Affiliate earning: if the subscription carries affiliate attribution
  // metadata, roll this payment into the partner's monthly earnings.
  const affiliatePartnerId =
    await getAffiliatePartnerIdForSubscription(subscriptionId)
  await maybeCreateAffiliateEarning(affiliatePartnerId, invoice.amount_paid ?? 0)
}

/**
 * Create a CommissionLedgerEntry for the referrer of a paying user, if one
 * applies. Idempotent per (referrer, referee, month) via the schema's unique
 * constraint — a duplicate Stripe delivery in the same month is a no-op.
 * Self-referrals never earn commission.
 */
async function maybeCreateReferralCommission(
  invoice: Stripe.Invoice
): Promise<void> {
  const amountPaid = invoice.amount_paid ?? 0
  if (amountPaid <= 0) return

  const customerId =
    typeof invoice.customer === 'string'
      ? invoice.customer
      : invoice.customer?.id ?? ''
  const refereeId = await findUserIdForCustomer(customerId)
  if (!refereeId) return

  // Find the converted referral that brought this user in.
  const referral = await db.referral.findFirst({
    where: { refereeId, status: 'converted' },
    select: { referrerId: true },
  })
  if (!referral) return
  if (referral.referrerId === refereeId) return // never pay self-referrals

  const amountCents = computeCommissionCents(amountPaid)
  if (amountCents <= 0) return

  const month = commissionMonthKey(new Date())
  await db.commissionLedgerEntry
    .create({
      data: {
        referrerId: referral.referrerId,
        refereeId,
        month,
        amountCents,
        status: 'pending',
      },
    })
    .catch(() => {
      // Unique violation on (referrerId, refereeId, month) — already recorded
      // for this month; idempotent no-op.
    })
}

// ---------------------------------------------------------------------------
// Affiliate earnings
// ---------------------------------------------------------------------------

/** Commission rate is stored as a fraction (0.10 = 10%); fall back to 10%. */
function resolveCommissionRate(rate: unknown): number {
  const n = Number(rate)
  if (!Number.isFinite(n) || n <= 0) return 0.1
  // Defensive: if ever stored as a percentage (e.g. 10), treat it as such.
  return n > 1 ? n / 100 : n
}

/** Read the affiliate partner id (if any) from a subscription's metadata. */
async function getAffiliatePartnerIdForSubscription(
  subscriptionId: string
): Promise<string | null> {
  try {
    const sub = await stripe.subscriptions.retrieve(subscriptionId)
    return sub.metadata?.affiliatePartnerId || null
  } catch {
    return null
  }
}

/**
 * Roll a paid invoice up into the partner's monthly AffiliateEarning row using
 * the partner's commissionRate (fraction; default 10%). Idempotent at the event
 * level via ProcessedStripeEvent, so a given invoice event increments once. The
 * AffiliateEarning row is keyed by (partnerId, month) — there is no per-invoice
 * field in the schema, so monthly totals are accumulated.
 */
async function maybeCreateAffiliateEarning(
  partnerId: string | null | undefined,
  amountPaidCents: number
): Promise<void> {
  if (!partnerId || amountPaidCents <= 0) return

  const partner = await db.affiliatePartner.findUnique({
    where: { id: partnerId },
    select: { id: true, commissionRate: true, isActive: true },
  })
  if (!partner || !partner.isActive) return

  const rate = resolveCommissionRate(partner.commissionRate)
  const earnedCents = Math.round(amountPaidCents * rate)
  if (earnedCents <= 0) return

  const month = commissionMonthKey(new Date())
  await db.affiliateEarning
    .upsert({
      where: { partnerId_month: { partnerId: partner.id, month } },
      create: {
        partnerId: partner.id,
        month,
        totalConversions: 1,
        totalEarnedCents: earnedCents,
        status: 'pending',
      },
      update: {
        totalConversions: { increment: 1 },
        totalEarnedCents: { increment: earnedCents },
      },
    })
    .catch((e) => {
      console.error('[stripe] affiliate earning upsert failed:', e)
    })
}

async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice
): Promise<void> {
  const subscriptionId =
    typeof invoice.subscription === 'string'
      ? invoice.subscription
      : invoice.subscription?.id
  if (!subscriptionId) return

  await db.subscription.updateMany({
    where: { stripeSubscriptionId: subscriptionId },
    data: { status: 'past_due' },
  })
}

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[stripe] STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 }
    )
  }

  const rawBody = await req.text()
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (error) {
    console.error('[stripe] Signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Idempotency: skip if we've already processed this event.
  try {
    const already = await db.processedStripeEvent.findUnique({
      where: { eventId: event.id },
    })
    if (already) {
      return NextResponse.json({ received: true, duplicate: true })
    }
  } catch (error) {
    console.error('[stripe] Idempotency check failed:', error)
    // Continue — better to process than to drop a legitimate event.
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        )
        break
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        )
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        )
        break
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(
          event.data.object as Stripe.Invoice
        )
        break
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break
      default:
        // Unhandled event type — acknowledge without action.
        break
    }

    // Record as processed (best-effort).
    await db.processedStripeEvent
      .create({ data: { eventId: event.id } })
      .catch(() => {
        /* already recorded by a concurrent delivery — ignore */
      })
  } catch (error) {
    console.error(`[stripe] Error handling ${event.type}:`, error)
    // Return 200 so Stripe does not retry a deterministic bug indefinitely.
    return NextResponse.json({ received: true, handlerError: true })
  }

  return NextResponse.json({ received: true })
}
