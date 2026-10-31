import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { requireOwnership } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

/** Update (reschedule / status) or cancel a single booking. */

const patchSchema = z.object({
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  status: z
    .enum(['requested', 'scheduled', 'completed', 'cancelled'])
    .optional(),
  coachNotes: z.string().max(1000).optional().nullable(),
})

export const PATCH = withAuth(
  async (req: Request, ctx: { params: { bookingId: string } }) => {
    const booking = await db.booking.findUnique({
      where: { id: ctx.params.bookingId },
      select: { userId: true },
    })
    if (!booking) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    await requireOwnership(booking.userId)

    const parsed = patchSchema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }
    const { startTime, endTime, ...rest } = parsed.data
    await db.booking.update({
      where: { id: ctx.params.bookingId },
      data: {
        ...rest,
        ...(startTime ? { startTime: new Date(startTime) } : {}),
        ...(endTime ? { endTime: new Date(endTime) } : {}),
      },
    })
    return NextResponse.json({ ok: true })
  }
)

export const DELETE = withAuth(
  async (_req: Request, ctx: { params: { bookingId: string } }) => {
    const booking = await db.booking.findUnique({
      where: { id: ctx.params.bookingId },
      select: { userId: true },
    })
    if (!booking) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    await requireOwnership(booking.userId)
    await db.booking.update({
      where: { id: ctx.params.bookingId },
      data: { status: 'cancelled' },
    })
    return NextResponse.json({ ok: true })
  }
)
