import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { randomBytes } from 'crypto'
import { db } from '@/lib/db/client'
import { stripe } from '@/lib/stripe/client'
import { getTierBaseline } from '@/lib/stripe/pricing'
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
