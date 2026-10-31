import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { requireAuth, requireOwnership } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

/** Injury logging API. */

const createSchema = z.object({
  bodyPart: z.string().min(1).max(100),
  severity: z.enum(['mild', 'moderate', 'severe']),
  description: z.string().max(2000).optional().nullable(),
  exerciseModifications: z.string().max(2000).optional().nullable(),
  occurredAt: z.string(),
})

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['active', 'recovering', 'resolved']).optional(),
  description: z.string().max(2000).optional().nullable(),
  exerciseModifications: z.string().max(2000).optional().nullable(),
})

export const POST = withAuth(async (req: Request) => {
  const session = await requireAuth()
  const userId = session.user.id
  const parsed = createSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid injury data', details: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const d = parsed.data
  const occurred = new Date(d.occurredAt)
  occurred.setUTCHours(0, 0, 0, 0)

  const created = await db.injuryLog.create({
    data: {
      userId,
      bodyPart: d.bodyPart,
      severity: d.severity,
      description: d.description ?? null,
      exerciseModifications: d.exerciseModifications ?? null,
      occurredAt: occurred,
    },
    select: { id: true },
  })
  return NextResponse.json({ id: created.id })
})

export const GET = withAuth(async () => {
  const session = await requireAuth()
  const injuries = await db.injuryLog.findMany({
    where: { userId: session.user.id },
    orderBy: [{ status: 'asc' }, { occurredAt: 'desc' }],
  })
  return NextResponse.json({ injuries })
})

export const PATCH = withAuth(async (req: Request) => {
  const parsed = patchSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid update' }, { status: 400 })
  }
  const { id, status, ...rest } = parsed.data

  const injury = await db.injuryLog.findUnique({
    where: { id },
    select: { userId: true },
  })
  if (!injury) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  await requireOwnership(injury.userId)

  await db.injuryLog.update({
    where: { id },
    data: {
      ...rest,
      ...(status ? { status } : {}),
      ...(status === 'resolved' ? { resolvedAt: new Date() } : {}),
    },
  })
  return NextResponse.json({ success: true })
})
