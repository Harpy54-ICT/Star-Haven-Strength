import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { requireAdmin } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

export const dynamic = 'force-dynamic'

/** Admin: get / edit / delete a single affiliate partner. */

const patchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  websiteUrl: z.string().url().max(500).optional().or(z.literal('')).nullable(),
  commissionRate: z.number().min(0).max(1).optional(),
  trackingParam: z.string().max(200).optional().or(z.literal('')).nullable(),
  category: z.string().max(100).optional().or(z.literal('')).nullable(),
  isActive: z.boolean().optional(),
})

export const GET = withAuth(
  async (_req: Request, ctx: { params: { id: string } }) => {
    await requireAdmin()
    const partner = await db.affiliatePartner.findUnique({
      where: { id: ctx.params.id },
    })
    if (!partner) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({
      partner: { ...partner, commissionRate: Number(partner.commissionRate) },
    })
  }
)

export const PATCH = withAuth(
  async (req: Request, ctx: { params: { id: string } }) => {
    await requireAdmin()
    const parsed = patchSchema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }
    const d = parsed.data
    await db.affiliatePartner.update({
      where: { id: ctx.params.id },
      data: {
        ...(d.name !== undefined ? { name: d.name } : {}),
        ...(d.websiteUrl !== undefined
          ? { websiteUrl: d.websiteUrl || null }
          : {}),
        ...(d.commissionRate !== undefined
          ? { commissionRate: d.commissionRate }
          : {}),
        ...(d.trackingParam !== undefined
          ? { trackingParam: d.trackingParam || null }
          : {}),
        ...(d.category !== undefined ? { category: d.category || null } : {}),
        ...(d.isActive !== undefined ? { isActive: d.isActive } : {}),
      },
    })
    return NextResponse.json({ ok: true })
  }
)

export const DELETE = withAuth(
  async (_req: Request, ctx: { params: { id: string } }) => {
    await requireAdmin()
    await db.affiliatePartner.delete({ where: { id: ctx.params.id } })
    return NextResponse.json({ ok: true })
  }
)
