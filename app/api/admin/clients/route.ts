import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { requireAdmin } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'
import type { Prisma } from '@prisma/client'

type AccountType = 'civilian' | 'military' | 'veteran'
type SubStatus = 'active' | 'canceled' | 'past_due'

/**
 * GET /api/admin/clients — admin only.
 * Paginated, searchable, filterable list of client accounts.
 */
export const GET = withAuth(async (req: Request) => {
  await requireAdmin()

  const { searchParams } = new URL(req.url)
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10) || 1, 1)
  const limit = Math.min(
    Math.max(parseInt(searchParams.get('limit') || '20', 10) || 20, 1),
    100
  )
  const search = searchParams.get('search')?.trim()
  const accountType = searchParams.get('accountType') ?? 'all'
  const subscriptionStatus = searchParams.get('subscriptionStatus') ?? 'all'

  const where: Prisma.UserWhereInput = { role: 'client' }

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (['civilian', 'military', 'veteran'].includes(accountType)) {
    where.accountType = accountType as AccountType
  }

  if (['active', 'canceled', 'past_due'].includes(subscriptionStatus)) {
    where.subscriptions = {
      some: { status: subscriptionStatus as SubStatus },
    }
  }

  const [total, users] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        accountType: true,
        militaryVerified: true,
        createdAt: true,
        totalXP: true,
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            tier: true,
            status: true,
            currentPeriodEnd: true,
          },
        },
        newbieDesignation: {
          select: {
            currentWeek: true,
            currentPhase: true,
            discountActive: true,
          },
        },
      },
    }),
  ])

  const clients = users.map((u) => ({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    accountType: u.accountType,
    militaryVerified: u.militaryVerified,
    createdAt: u.createdAt,
    totalXP: u.totalXP,
    subscription: u.subscriptions[0] ?? null,
    newbieDesignation: u.newbieDesignation,
  }))

  return NextResponse.json({
    clients,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
})
