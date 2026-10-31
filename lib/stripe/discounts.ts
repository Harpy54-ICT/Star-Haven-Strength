import Stripe from 'stripe'
import { db } from '@/lib/db/client'
import { stripe } from '@/lib/stripe/client'
import { MILITARY_COUPON_ID, NEWBIE_COUPON_ID } from '@/lib/stripe/pricing'

/**
 * Discount eligibility + application utilities.
 *
 * Two discount programs:
 *  - Military: 20% forever (coupon MILITARY_FOREVER) — requires verification.
 *  - Newbie: $50 off the first 3 months (coupon NEWBIE_3MONTHS) — first-time
 *    subscribers only.
 */

/**
 * Military discount eligibility: the user must have a verified military status.
 */
export async function checkMilitaryDiscountEligibility(
  userId: string
): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { militaryVerified: true, accountType: true },
  })
  if (!user) return false
  return (
    user.militaryVerified &&
    (user.accountType === 'military' || user.accountType === 'veteran')
  )
}

/**
 * Newbie discount eligibility: the user has never had a subscription before
 * (no Subscription rows of any status).
 */
export async function checkNewbieDiscountEligibility(
  userId: string
): Promise<boolean> {
  const count = await db.subscription.count({ where: { userId } })
  return count === 0
}

/**
 * Build the Stripe `discounts` array to attach to a Checkout Session.
 *
 * Only one coupon can be applied to a Checkout Session at a time, so we apply
 * the most valuable one: military (20% forever) takes precedence over the
 * newbie ($50 × 3 months) discount when the user qualifies for both.
 */
export async function buildDiscountsArray(
  userId: string
): Promise<Stripe.Checkout.SessionCreateParams.Discount[]> {
  const [militaryEligible, newbieEligible] = await Promise.all([
    checkMilitaryDiscountEligibility(userId),
    checkNewbieDiscountEligibility(userId),
  ])

  if (militaryEligible) {
    return [{ coupon: MILITARY_COUPON_ID }]
  }
  if (newbieEligible) {
    return [{ coupon: NEWBIE_COUPON_ID }]
  }
  return []
}

/**
 * Apply the military (forever) coupon to an existing subscription. Used when a
 * user's military status is approved after they already subscribed.
 */
export async function applyMilitaryDiscountToExistingSubscription(
  stripeSubscriptionId: string
): Promise<void> {
  await stripe.subscriptions.update(stripeSubscriptionId, {
    coupon: MILITARY_COUPON_ID,
  })
}

/**
 * Remove a coupon/discount from a subscription.
 *
 * When `couponId` is provided, the subscription's current discount is only
 * removed if it matches that coupon (so we don't accidentally strip a different
 * discount). When omitted, any discount on the subscription is removed.
 *
 * Stripe applies at most one subscription-level coupon, so clearing it is done
 * with `deleteDiscount`.
 */
export async function removeCouponFromSubscription(
  stripeSubscriptionId: string,
  couponId?: string
): Promise<void> {
  if (!couponId) {
    await stripe.subscriptions.deleteDiscount(stripeSubscriptionId)
    return
  }

  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId)
  const discounts = (subscription.discounts ?? []) as Array<
    string | Stripe.Discount
  >

  const hasMatchingCoupon = discounts.some((discount) => {
    if (typeof discount === 'string') return false
    return discount.coupon?.id === couponId
  })

  if (hasMatchingCoupon) {
    await stripe.subscriptions.deleteDiscount(stripeSubscriptionId)
  }
}
