import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'
import { MIN_PAYOUT_CENTS } from '@/lib/referrals/commission'
import { enforceRateLimit, getClientIp } from '@/lib/security/rate-limit'

export const dynamic = 'force-dynamic'

/**
 * Optional body: the member can include a payout note — typically their PayPal
 * email or preferred payout method — which the coach sees in Admin → Payouts.
 * The schema (Prisma) has no dedicated payout-details field, so we carry the
 * detail here on the request's `notes` column rather than adding a column.
 */
const bodySchema = z
  .object({
    note: z.string().trim().max(500).optional(),
  })
  .optional()

/**
 * POST /api/referrals/payout — request a payout of the member's pending
 * commissions. Session-checked, zod-validated, and rate-limited. Enforces a
 * minimum balance, blocks duplicate pending requests, and files a request that
 * appears in the existing Admin → Payouts workflow.
 */
export const POST = withAuth(async (req: Request) => {
  const session = await requireAuth()
  const userId = session.user.id

  // Rate-limit payout requests per user (and IP) to deter abuse/spam.
  const limited = await enforceRateLimit({
    action: 'referral-payout',
    identifier: `${userId}:${getClientIp(req)}`,
    limit: 5,
    windowSeconds: 60 * 60, // 5 per hour
  })
  if (limited) return limited

  // Validate the (optional) body.
  const raw = await req.json().catch(() => undefined)
  const parsed = bodySchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid request' },
      { status: 400 }
    )
  }
  const note = parsed.data?.note?.trim() || null

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

  // Sum pending (unpaid) commissions — the available balance.
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

  if (amountCents < MIN_PAYOUT_CENTS) {
    const min = `$${(MIN_PAYOUT_CENTS / 100).toFixed(2)}`
    return NextResponse.json(
      {
        error: `You need at least ${min} in available commissions to request a payout.`,
      },
      { status: 400 }
    )
  }

  const payout = await db.payoutRequest.create({
    data: { userId, amountCents, status: 'pending', notes: note },
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
            metadata: { payoutRequestId: payout.id, amountCents, note },
          },
        })
      ),
      ...admins.map((admin) =>
        db.clientNotification.create({
          data: {
            userId: admin.id,
            title: 'New payout request',
            message: `${requesterName} requested a referral payout of ${amountLabel}. Review it in Admin → Payouts (/dashboard/admin/payouts).`,
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
