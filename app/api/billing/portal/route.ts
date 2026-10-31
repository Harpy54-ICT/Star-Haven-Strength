import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { stripe, assertStripeConfigured } from '@/lib/stripe/client'
import { requireAuth } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

function appUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.AUTH_URL ??
    'http://localhost:3000'
  ).replace(/\/$/, '')
}

/**
 * POST /api/billing/portal — creates a Stripe Billing Portal session and
 * returns its URL so the user can manage payment methods, invoices, and plan.
 */
export const POST = withAuth(async () => {
  assertStripeConfigured()
  const session = await requireAuth()

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  })

  if (!user?.stripeCustomerId) {
    return NextResponse.json(
      { error: 'No billing account found. Subscribe to a plan first.' },
      { status: 404 }
    )
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${appUrl()}/dashboard/settings/billing`,
  })

  return NextResponse.json({ url: portalSession.url })
})
