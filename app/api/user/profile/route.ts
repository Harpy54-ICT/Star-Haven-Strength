import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

/**
 * GET /api/user/profile — returns the authenticated user's profile.
 * The password hash is never selected/returned.
 */
export const GET = withAuth(async () => {
  const session = await requireAuth()

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      image: true,
      firstName: true,
      lastName: true,
      role: true,
      accountType: true,
      militaryBranch: true,
      militaryVerified: true,
      bio: true,
      preferredUnits: true,
      dailyCalorieGoal: true,
      dailyProteinGoal: true,
      dailyCarbGoal: true,
      dailyFatGoal: true,
      totalXP: true,
      leaderboardOptOut: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({ user })
})
