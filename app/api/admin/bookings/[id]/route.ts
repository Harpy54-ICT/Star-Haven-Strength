import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { requireAdmin } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

export const dynamic = 'force-dynamic'

/** Statuses an admin may set a booking to. */
const ALLOWED_STATUSES = [
  'scheduled',
  'confirmed',
  'completed',
  'cancelled',
] as const

const patchSchema = z.object({
  status: z.enum(ALLOWED_STATUSES),
})

/**
 * PATCH /api/admin/bookings/[id] — change a booking's status and notify the
 * member via ClientNotification. Admin only.
 */
export const PATCH = withAuth(
  async (req: Request, ctx: { params: { id: string } }) => {
    await requireAdmin()

    const parsed = patchSchema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid status', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const booking = await db.booking.findUnique({
      where: { id: ctx.params.id },
      select: { id: true, userId: true, startTime: true },
    })
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    await db.booking.update({
      where: { id: booking.id },
      data: { status: parsed.data.status },
    })

    const when = new Date(booking.startTime).toLocaleString()
    await db.clientNotification.create({
      data: {
        userId: booking.userId,
        title: `Your session is now ${parsed.data.status}`,
        message: `Your coaching session scheduled for ${when} has been marked "${parsed.data.status}".`,
        type: 'general',
      },
    })

    return NextResponse.json({ ok: true })
  }
)
