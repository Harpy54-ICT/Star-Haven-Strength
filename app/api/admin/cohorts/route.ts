import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { requireAdmin } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

/** Admin cohort CRUD — list all and create. */

const createSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional().nullable(),
  durationWeeks: z.number().int().min(1).max(104),
  priceCents: z.number().int().min(0).max(10_000_00),
  maxClients: z.number().int().min(1).max(10_000).optional().nullable(),
  startDate: z.string().optional().nullable(),
  status: z
    .enum(['draft', 'open', 'active', 'completed', 'cancelled'])
    .default('draft'),
})

export const GET = withAuth(async () => {
  await requireAdmin()
  const cohorts = await db.cohortProgram.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { enrollments: true } } },
  })
  return NextResponse.json({ cohorts })
})

export const POST = withAuth(async (req: Request) => {
  await requireAdmin()
  const parsed = createSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid cohort data', details: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const d = parsed.data
  const created = await db.cohortProgram.create({
    data: {
      name: d.name,
      description: d.description ?? null,
      durationWeeks: d.durationWeeks,
      priceCents: d.priceCents,
      maxClients: d.maxClients ?? null,
      startDate: d.startDate ? new Date(d.startDate) : null,
      status: d.status,
    },
    select: { id: true },
  })
  return NextResponse.json({ id: created.id })
})
