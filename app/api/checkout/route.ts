import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { stripe, assertStripeConfigured } from '@/lib/stripe/client'
import { buildDiscountsArray } from '@/lib/stripe/discounts'
import { requireAuth } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

const bodySchema = z.object({
  priceId: z.string().min(1, 'priceId is required'),
  billingPeriod: z.enum(['monthly', 'annual']),
})

function appUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.AUTH_URL ??
    'http://localhost:3000'
  ).replace(/\/$/, '')
}

export const POST = withAuth(async (req: Request) => {
  assertStripeConfigured()
  const session = await requireAuth()
  const userId = session.user.id

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid request' },
      { status: 400 }
    )
  }
  const { priceId, billingPeriod } = parsed.data

  // Block if there is already an active/trialing subscription.
  const activeSub = await db.subscription.findFirst({
    where: { userId, status: { in: ['active', 'trialing'] } },
  })
  if (activeSub) {
    return NextResponse.json(
      { error: 'You already have an active subscription.' },
      { status: 409 }
    )
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      stripeCustomerId: true,
    },
  })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Create or reuse the Stripe customer.
  let customerId = user.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name:
        [user.firstName, user.lastName].filter(Boolean).join(' ') || undefined,
      metadata: { userId: user.id },
    })
    customerId = customer.id
    await db.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    })
  }

  // Determine applicable discount (military takes precedence over newbie).
  const discounts = await buildDiscountsArray(userId)

  // Affiliate attribution: if the visitor arrived via an affiliate link, the
  // httpOnly `shs_aff` cookie holds the partner's tracking code. Resolve it to
  // an active partner and carry it through checkout + subscription metadata so
  // the webhook can credit the partner on paid invoices.
  const affCode = cookies().get('shs_aff')?.value ?? null
  let affiliateMeta: Record<string, string> = {}
  if (affCode) {
    const partner = await db.affiliatePartner.findFirst({
      where: { trackingParam: affCode, isActive: true },
      select: { id: true },
    })
    if (partner) {
      affiliateMeta = {
        affiliateCode: affCode,
        affiliatePartnerId: partner.id,
      }
    }
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    // If no discount applies, allow manual promo codes (e.g. VETERAN20).
    ...(discounts.length > 0
      ? { discounts }
      : { allow_promotion_codes: true }),
    success_url: `${appUrl()}/dashboard/welcome?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl()}/pricing`,
    subscription_data: {
      metadata: { userId: user.id, billingPeriod, ...affiliateMeta },
    },
    metadata: { userId: user.id, billingPeriod, priceId, ...affiliateMeta },
  })

  if (!checkoutSession.url) {
    return NextResponse.json(
      { error: 'Could not create checkout session.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ url: checkoutSession.url })
})
