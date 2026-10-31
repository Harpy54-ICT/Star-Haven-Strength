import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { requireAdmin } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

export const dynamic = 'force-dynamic'

/** Admin affiliate partner CRUD — list all (with aggregates) and create. */

const createSchema = z.object({
  name: z.string().min(1).max(200),
  websiteUrl: z.string().url().max(500).optional().or(z.literal('')).nullable(),
  // commissionRate stored as a fraction (0.10 = 10%).
  commissionRate: z.number().min(0).max(1),
  trackingParam: z.string().max(200).optional().or(z.literal('')).nullable(),
  category: z.string().max(100).optional().or(z.literal('')).nullable(),
  isActive: z.boolean().default(true),
})

export const GET = withAuth(async () => {
  await requireAdmin()

  const [partners, clicksByPartner, convByPartner, earnByPartner] =
    await Promise.all([
      db.affiliatePartner.findMany({ orderBy: { createdAt: 'desc' } }),
      db.affiliateClick.groupBy({
        by: ['partnerId'],
        _count: { _all: true },
      }),
      db.affiliateClick.groupBy({
        by: ['partnerId'],
        where: { converted: true },
        _count: { _all: true },
      }),
      db.affiliateEarning.groupBy({
        by: ['partnerId'],
        _sum: { totalEarnedCents: true },
      }),
    ])

  const clickMap = new Map(
    clicksByPartner.map((c) => [c.partnerId, c._count._all])
  )
  const convMap = new Map(
    convByPartner.map((c) => [c.partnerId, c._count._all])
  )
  const earnMap = new Map(
    earnByPartner.map((e) => [e.partnerId, e._sum.totalEarnedCents ?? 0])
  )

  const result = partners.map((p) => ({
    id: p.id,
    name: p.name,
    websiteUrl: p.websiteUrl,
    commissionRate: Number(p.commissionRate),
    trackingParam: p.trackingParam,
    category: p.category,
    isActive: p.isActive,
    createdAt: p.createdAt,
    totalClicks: clickMap.get(p.id) ?? 0,
    totalConversions: convMap.get(p.id) ?? 0,
    totalEarnedCents: earnMap.get(p.id) ?? 0,
  }))

  return NextResponse.json({ partners: result })
})

export const POST = withAuth(async (req: Request) => {
  await requireAdmin()
  const parsed = createSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid data' },
      { status: 400 }
    )
  }
  const d = parsed.data
  const created = await db.affiliatePartner.create({
    data: {
      name: d.name,
      websiteUrl: d.websiteUrl || null,
      commissionRate: d.commissionRate,
      trackingParam: d.trackingParam || null,
      category: d.category || null,
      isActive: d.isActive,
    },
    select: { id: true },
  })
  return NextResponse.json({ id: created.id }, { status: 201 })
})
