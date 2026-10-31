import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { requireAdmin } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

/** Admin: get one cohort (with enrollees), edit it, or delete it. */

const patchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  durationWeeks: z.number().int().min(1).max(104).optional(),
  priceCents: z.number().int().min(0).max(10_000_00).optional(),
  maxClients: z.number().int().min(1).max(10_000).optional().nullable(),
  startDate: z.string().optional().nullable(),
  status: z
    .enum(['draft', 'open', 'active', 'completed', 'cancelled'])
    .optional(),
})

export const GET = withAuth(
  async (_req: Request, ctx: { params: { cohortId: string } }) => {
    await requireAdmin()
    const cohort = await db.cohortProgram.findUnique({
      where: { id: ctx.params.cohortId },
      include: {
        enrollments: {
          orderBy: { enrolledAt: 'asc' },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    })
    if (!cohort) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ cohort })
  }
)

export const PATCH = withAuth(
  async (req: Request, ctx: { params: { cohortId: string } }) => {
    await requireAdmin()
    const parsed = patchSchema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }
    const { startDate, ...rest } = parsed.data
    await db.cohortProgram.update({
      where: { id: ctx.params.cohortId },
      data: {
        ...rest,
        ...(startDate !== undefined
          ? { startDate: startDate ? new Date(startDate) : null }
          : {}),
      },
    })
    return NextResponse.json({ ok: true })
  }
)

export const DELETE = withAuth(
  async (_req: Request, ctx: { params: { cohortId: string } }) => {
    await requireAdmin()
    await db.cohortProgram.delete({ where: { id: ctx.params.cohortId } })
    return NextResponse.json({ ok: true })
  }
)
