import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { requireAdmin } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 20

/**
 * GET /api/admin/check-ins — recent check-ins across all clients, newest first,
 * paginated via ?page=N (1-based). Admin only.
 */
export const GET = withAuth(async (req: Request) => {
  await requireAdmin()

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const skip = (page - 1) * PAGE_SIZE

  const [checkIns, total] = await Promise.all([
    db.checkIn.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: PAGE_SIZE,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    }),
    db.checkIn.count(),
  ])

  return NextResponse.json({
    checkIns,
    page,
    pageSize: PAGE_SIZE,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  })
})
