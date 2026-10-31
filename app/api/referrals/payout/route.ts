import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

export const dynamic = 'force-dynamic'

/**
 * POST /api/referrals/payout — request a payout of the member's pending
 * commissions. Creates a PayoutRequest and notifies admins via an audit log
 * entry + a notification. Guards against zero balance and duplicate requests.
 */
export const POST = withAuth(async () => {
  const session = await requireAuth()
  const userId = session.user.id

  // Block duplicate open requests.
  const openRequest = await db.payoutRequest.findFirst({
    where: { userId, status: 'pending' },
  })
  if (openRequest) {
    return NextResponse.json(
      { error: 'You already have a payout request pending review.' },
      { status: 409 }
    )
  }

  // Sum pending (unpaid) commissions.
  const pending = await db.commissionLedgerEntry.aggregate({
    where: { referrerId: userId, status: 'pending' },
    _sum: { amountCents: true },
  })
  const amountCents = pending._sum.amountCents ?? 0

  if (amountCents <= 0) {
    return NextResponse.json(
      { error: 'You have no pending commissions available for payout.' },
      { status: 400 }
    )
  }

  const payout = await db.payoutRequest.create({
    data: { userId, amountCents, status: 'pending' },
  })

  const amountLabel = `$${(amountCents / 100).toFixed(2)}`
  const requesterName = session.user.name || session.user.email || 'A member'

  // Notify all admins (audit log + in-app notification). Best-effort — never
  // fail the payout request if notification fan-out hiccups.
  try {
    const admins = await db.user.findMany({
      where: { role: 'admin' },
      select: { id: true },
    })
    await Promise.all([
      ...admins.map((admin) =>
        db.adminAuditLog.create({
          data: {
            adminId: admin.id,
            action: 'referral_payout_requested',
            targetUserId: userId,
            metadata: { payoutRequestId: payout.id, amountCents },
          },
        })
      ),
      ...admins.map((admin) =>
        db.clientNotification.create({
          data: {
            userId: admin.id,
            title: 'New payout request',
            message: `${requesterName} requested a referral payout of ${amountLabel}.`,
            type: 'payout_request',
          },
        })
      ),
    ])
  } catch (e) {
    console.error('[referrals/payout] admin notification failed:', e)
  }

  return NextResponse.json({ success: true, payout }, { status: 201 })
})
