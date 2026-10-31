import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

/**
 * GET /api/military-verify/status
 * Returns the authenticated user's latest military verification record (status),
 * plus whether the account is already verified.
 */
export const GET = withAuth(async () => {
  const session = await requireAuth()
  const userId = session.user.id

  const [user, latest] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { militaryVerified: true, militaryBranch: true, accountType: true },
    }),
    db.militaryVerification.findFirst({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
      select: {
        id: true,
        status: true,
        submittedAt: true,
        reviewedAt: true,
        notes: true,
      },
    }),
  ])

  return NextResponse.json({
    verified: user?.militaryVerified ?? false,
    branch: user?.militaryBranch ?? null,
    accountType: user?.accountType ?? 'civilian',
    latest: latest ?? null,
  })
})
