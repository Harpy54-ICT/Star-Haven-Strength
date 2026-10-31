import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'
import { generateReferralCode } from '@/lib/utils/slug'

export const dynamic = 'force-dynamic'

const SITE_URL = 'https://www.starhavenstrength.com'

/** Get the user's referral code, creating a unique one if missing. */
async function getOrCreateCode(userId: string): Promise<string> {
  const existing = await db.referralCode.findUnique({ where: { userId } })
  if (existing) return existing.code

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

/** GET /api/referrals — the member's referral code, stats, and commissions. */
export const GET = withAuth(async () => {
  const session = await requireAuth()
  const userId = session.user.id

  const code = await getOrCreateCode(userId)

  const [totalReferrals, convertedReferrals, commissionGroups, pendingPayout] =
    await Promise.all([
      db.referral.count({ where: { referrerId: userId } }),
      db.referral.count({
        where: { referrerId: userId, status: 'converted' },
      }),
      db.commissionLedgerEntry.groupBy({
        by: ['status'],
        where: { referrerId: userId },
        _sum: { amountCents: true },
      }),
      db.payoutRequest.findFirst({
        where: { userId, status: 'pending' },
        orderBy: { requestedAt: 'desc' },
      }),
    ])

  let earnedCents = 0
  let pendingCents = 0
  for (const g of commissionGroups) {
    const sum = g._sum.amountCents ?? 0
    if (g.status === 'paid') earnedCents += sum
    else pendingCents += sum
  }

  return NextResponse.json({
    code,
    shareUrl: `${SITE_URL}/pricing?ref=${code}`,
    totalReferrals,
    convertedReferrals,
    earnedCents,
    pendingCents,
    hasPendingPayout: !!pendingPayout,
    pendingPayoutAmountCents: pendingPayout?.amountCents ?? 0,
  })
})
