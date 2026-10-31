import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

/** Coaching session bookings: list the user's sessions and request new ones. */

const createSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  notes: z.string().max(1000).optional().nullable(),
})

export const GET = withAuth(async (req: Request) => {
  const session = await requireAuth()
  const userId = session.user.id
  const { searchParams } = new URL(req.url)
  const scope = searchParams.get('scope') // 'upcoming' | 'past' | null

  const now = new Date()
  const where: {
    userId: string
    startTime?: { gte?: Date; lt?: Date }
  } = { userId }
  if (scope === 'upcoming') where.startTime = { gte: now }
  else if (scope === 'past') where.startTime = { lt: now }

  const bookings = await db.booking.findMany({
    where,
    orderBy: { startTime: scope === 'past' ? 'desc' : 'asc' },
  })
  return NextResponse.json({ bookings })
})

export const POST = withAuth(async (req: Request) => {
  const session = await requireAuth()
  const userId = session.user.id
  const parsed = createSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid booking data', details: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const start = new Date(parsed.data.startTime)
  const end = new Date(parsed.data.endTime)
  if (end <= start) {
    return NextResponse.json(
      { error: 'End time must be after start time' },
      { status: 400 }
    )
  }

  const created = await db.booking.create({
    data: {
      userId,
      startTime: start,
      endTime: end,
      coachNotes: parsed.data.notes ?? null,
      status: 'requested',
    },
    select: { id: true },
  })
  return NextResponse.json({ id: created.id })
})
