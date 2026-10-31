import type Stripe from 'stripe'
import { db } from '@/lib/db/client'
import { stripe } from '@/lib/stripe/client'
import type { SubscriptionTier, SubscriptionStatus } from '@/types'

/**
 * Billing data helpers for the settings/billing UI.
 */

export interface InvoiceSummary {
  id: string
  number: string | null
  amountPaidCents: number
  currency: string
  status: string | null
  createdAt: Date
  hostedInvoiceUrl: string | null
  pdfUrl: string | null
}

export interface UserSubscriptionData {
  /** DB subscription row (source of truth for app state). */
  db: Awaited<ReturnType<typeof getDbSubscription>>
  /** Live Stripe subscription (null if none or not retrievable). */
  stripe: Stripe.Subscription | null
}

async function getDbSubscription(userId: string) {
  return db.subscription.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Returns the user's current subscription combining the DB row with the live
 * Stripe subscription (for cancel-at-period-end, discounts, etc.).
 */
export async function getUserSubscription(
  userId: string
): Promise<UserSubscriptionData> {
  const dbSub = await getDbSubscription(userId)

  let stripeSub: Stripe.Subscription | null = null
  if (dbSub?.stripeSubscriptionId) {
    try {
      stripeSub = await stripe.subscriptions.retrieve(
        dbSub.stripeSubscriptionId,
        { expand: ['items.data.price.product', 'discounts'] }
      )
    } catch (error) {
      console.error('[billing] Failed to retrieve Stripe subscription:', error)
    }
  }

  return { db: dbSub, stripe: stripeSub }
}

/**
 * Returns recent invoices for a Stripe customer.
 */
export async function getInvoiceHistory(
  stripeCustomerId: string,
  limit = 12
): Promise<InvoiceSummary[]> {
  try {
    const invoices = await stripe.invoices.list({
      customer: stripeCustomerId,
      limit,
    })
    return invoices.data.map((inv) => ({
      id: inv.id,
      number: inv.number ?? null,
      amountPaidCents: inv.amount_paid,
      currency: inv.currency,
      status: inv.status,
      createdAt: new Date(inv.created * 1000),
      hostedInvoiceUrl: inv.hosted_invoice_url ?? null,
      pdfUrl: inv.invoice_pdf ?? null,
    }))
  } catch (error) {
    console.error('[billing] Failed to list invoices:', error)
    return []
  }
}

/**
 * Human-friendly tier name, e.g. 'foundation_military' → 'Foundation (Military)'.
 */
export function formatTierName(tier: SubscriptionTier | string): string {
  const [key, audience] = tier.split('_')
  const name = key.charAt(0).toUpperCase() + key.slice(1)
  if (audience === 'military') return `${name} (Military)`
  if (audience === 'civilian') return `${name} (Civilian)`
  return name
}

export interface StatusDisplay {
  label: string
  /** Tailwind color classes for a badge. */
  className: string
}

/**
 * Maps a subscription status to a display label + badge color classes.
 */
export function formatSubscriptionStatus(
  status: SubscriptionStatus | string
): StatusDisplay {
  switch (status) {
    case 'active':
      return {
        label: 'Active',
        className: 'bg-green/10 text-green border border-green/30',
      }
    case 'trialing':
      return {
        label: 'Trialing',
        className: 'bg-blue-50 text-blue-700 border border-blue-200',
      }
    case 'past_due':
      return {
        label: 'Past Due',
        className: 'bg-red-50 text-red-700 border border-red-200',
      }
    case 'canceled':
      return {
        label: 'Canceled',
        className: 'bg-grey-mid/40 text-grey-dark border border-grey-mid',
      }
    default:
      return {
        label: String(status),
        className: 'bg-grey-mid/40 text-grey-dark border border-grey-mid',
      }
  }
}
