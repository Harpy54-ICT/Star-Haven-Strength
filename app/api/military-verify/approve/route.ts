import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { requireAdmin } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'
import { applyMilitaryDiscountToExistingSubscription } from '@/lib/stripe/discounts'

const bodySchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  verificationId: z.string().optional(),
  notes: z.string().optional(),
})

/**
 * POST /api/military-verify/approve — admin only.
 *
 * Approves a user's military verification:
 *  1. marks user.militaryVerified = true
 *  2. marks the MilitaryVerification record approved (if provided/found)
 *  3. applies the military (forever) coupon to any active subscription
 *  4. writes an AdminAuditLog entry
 */
export const POST = withAuth(async (req: Request) => {
  const session = await requireAdmin()
  const adminId = session.user.id

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid request' },
      { status: 400 }
    )
  }
  const { userId, verificationId, notes } = parsed.data

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, militaryVerified: true },
  })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // 1 + 2: mark verified and update the verification record.
  await db.user.update({
    where: { id: userId },
    data: { militaryVerified: true },
  })

  if (verificationId) {
    await db.militaryVerification.updateMany({
      where: { id: verificationId, userId },
      data: {
        status: 'approved',
        reviewedAt: new Date(),
        reviewedBy: adminId,
        notes: notes ?? undefined,
      },
    })
  } else {
    await db.militaryVerification.updateMany({
      where: { userId, status: 'pending' },
      data: {
        status: 'approved',
        reviewedAt: new Date(),
        reviewedBy: adminId,
        notes: notes ?? undefined,
      },
    })
  }

  // 3: apply the discount to an active subscription, if any.
  let discountApplied = false
  const activeSub = await db.subscription.findFirst({
    where: { userId, status: { in: ['active', 'trialing', 'past_due'] } },
    orderBy: { createdAt: 'desc' },
  })
  if (activeSub?.stripeSubscriptionId) {
    try {
      await applyMilitaryDiscountToExistingSubscription(
        activeSub.stripeSubscriptionId
      )
      discountApplied = true
    } catch (error) {
      // Don't fail the whole approval if the Stripe call fails; log it.
      console.error(
        '[military-verify/approve] Failed to apply discount:',
        error
      )
    }
  }

  // 4: audit log.
  await db.adminAuditLog.create({
    data: {
      adminId,
      action: 'military_verify_approve',
      targetUserId: userId,
      reason: notes,
      metadata: {
        discountApplied,
        subscriptionId: activeSub?.stripeSubscriptionId ?? null,
      },
    },
  })

  return NextResponse.json({ success: true, discountApplied })
})
