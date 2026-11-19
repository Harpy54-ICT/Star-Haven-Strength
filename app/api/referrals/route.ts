import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'
import { generateReferralCode } from '@/lib/utils/slug'
import { formatTierName } from '@/lib/stripe/billing'
import {
  MIN_PAYOUT_CENTS,
  commissionRatePercent,
} from '@/lib/referrals/commission'
import {
  enforceRateLimit,
  getClientIp,
} from '@/lib/security/rate-limit'

export const dynamic = 'force-dynamic'

const SITE_URL = 'https://www.starhavenstrength.com'

/** Mask a member's name for privacy: "Jane D." from firstName + lastName. */
function maskName(
  firstName: string | null,
  lastName: string | null
): string {
  const first = (firstName ?? '').trim()
  const lastInitial = (lastName ?? '').trim().charAt(0)
  if (!first && !lastInitial) return 'A member'
  if (!lastInitial) return first
  return `${first} ${lastInitial.toUpperCase()}.`
}

/** Generate a unique referral code for the user (program opt-in). */
async function createCode(userId: string): Promise<string> {
  // Retry on the rare code collision.
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = generateReferralCode(userId)
    const clash = await db.referralCode.findUnique({ where: { code } })
    if (clash) continue
    try {
      const created = await db.referralCode.create({
        data: { userId, code },
      })
      return created.code
    } catch {
      // Unique constraint race — try again.
    }
  }
  throw new Error('Could not generate a referral code. Please try again.')
}

/**
 * POST /api/referrals — opt in to the referral program by generating this
 * member's unique referral code. Idempotent: returns the existing code if the
 * member already activated. Session-checked and rate-limited.
 */
export const POST = withAuth(async (req: Request) => {
  const session = await requireAuth()
  const userId = session.user.id

  const limited = await enforceRateLimit({
    action: 'referral-activate',
    identifier: `${userId}:${getClientIp(req)}`,
    limit: 10,
    windowSeconds: 60,
  })
  if (limited) return limited

  const existing = await db.referralCode.findUnique({ where: { userId } })
  const code = existing ? existing.code : await createCode(userId)

  return NextResponse.json({ ok: true, code })
})

/**
 * GET /api/referrals — the caller's own referral portal data: code + share
 * link, funnel stats, earnings balances, recent commissions (with referee names
 * masked), and payout history. Returns `isAffiliate: false` when the member has
 * not opted in yet. Session-checked; only ever returns the caller's own data.
 */
export const GET = withAuth(async () => {
  const session = await requireAuth()
  const userId = session.user.id

  const referralCode = await db.referralCode.findUnique({ where: { userId } })

  // Not opted in yet → the portal shows a "Become an affiliate" prompt.
  if (!referralCode) {
    return NextResponse.json({
      isAffiliate: false,
      commissionRatePercent: commissionRatePercent(),
      minPayoutCents: MIN_PAYOUT_CENTS,
    })
  }

  const code = referralCode.code

  const [
    signups,
    conversions,
    commissionGroups,
    recentCommissions,
    payouts,
  ] = await Promise.all([
    db.referral.count({ where: { referrerId: userId } }),
    db.referral.count({
      where: { referrerId: userId, status: 'converted' },
    }),
    db.commissionLedgerEntry.groupBy({
      by: ['status'],
      where: { referrerId: userId },
      _sum: { amountCents: true },
    }),
    db.commissionLedgerEntry.findMany({
      where: { referrerId: userId },
      orderBy: { createdAt: 'desc' },
      take: 15,
      include: {
        referee: {
          select: {
            firstName: true,
            lastName: true,
            subscriptions: {
              select: { tier: true },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    }),
    db.payoutRequest.findMany({
      where: { userId },
      orderBy: { requestedAt: 'desc' },
      take: 20,
      select: {
        id: true,
        amountCents: true,
        status: true,
        requestedAt: true,
        processedAt: true,
        notes: true,
      },
    }),
  ])

  // Earnings balances from the commission ledger.
  let availableCents = 0 // pending (unpaid) commissions
  let paidCents = 0 // commissions marked paid
  for (const g of commissionGroups) {
    const sum = g._sum.amountCents ?? 0
    if (g.status === 'paid') paidCents += sum
    else availableCents += sum
  }

  // Payout-request states.
  let inReviewCents = 0 // requests awaiting admin review
  let approvedCents = 0 // approved, awaiting payment
  let hasPendingPayout = false
  for (const p of payouts) {
    if (p.status === 'pending') {
      inReviewCents += p.amountCents
      hasPendingPayout = true
    } else if (p.status === 'approved') {
      approvedCents += p.amountCents
    }
  }

  const conversionRate =
    signups > 0 ? Math.round((conversions / signups) * 100) : 0

  const canRequestPayout =
    !hasPendingPayout && availableCents >= MIN_PAYOUT_CENTS

  return NextResponse.json({
    isAffiliate: true,
    code,
    shareUrl: `${SITE_URL}/?ref=${code}`,
    commissionRatePercent: commissionRatePercent(),
    minPayoutCents: MIN_PAYOUT_CENTS,
    stats: {
      signups,
      conversions,
      conversionRate,
    },
    balances: {
      availableCents,
      inReviewCents,
      approvedCents,
      paidCents,
    },
    canRequestPayout,
    hasPendingPayout,
    recentCommissions: recentCommissions.map((c) => ({
      id: c.id,
      name: maskName(c.referee?.firstName ?? null, c.referee?.lastName ?? null),
      month: c.month,
      date: c.createdAt,
      plan: c.referee?.subscriptions?.[0]?.tier
        ? formatTierName(c.referee.subscriptions[0].tier)
        : '—',
      amountCents: c.amountCents,
      status: c.status,
    })),
    payouts: payouts.map((p) => ({
      id: p.id,
      amountCents: p.amountCents,
      status: p.status,
      requestedAt: p.requestedAt,
      processedAt: p.processedAt,
      notes: p.notes,
    })),
  })
})
