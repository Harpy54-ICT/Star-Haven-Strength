import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { requireAdmin } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

export const dynamic = 'force-dynamic'

const replySchema = z.object({
  coachNotes: z.string().min(1).max(5000),
})

/**
 * PATCH /api/admin/check-ins/[id] — record coach feedback on a check-in.
 *
 * The CheckIn model has a `coachNotes` field, so feedback is stored there. The
 * client is also notified via ClientNotification so they see the reply.
 * Admin only.
 */
export const PATCH = withAuth(
  async (req: Request, ctx: { params: { id: string } }) => {
    await requireAdmin()

    const parsed = replySchema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Feedback is required', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const checkIn = await db.checkIn.findUnique({
      where: { id: ctx.params.id },
      select: { id: true, userId: true, weekStart: true },
    })
    if (!checkIn) {
      return NextResponse.json({ error: 'Check-in not found' }, { status: 404 })
    }

    await db.checkIn.update({
      where: { id: checkIn.id },
      data: { coachNotes: parsed.data.coachNotes },
    })

    const weekLabel = new Date(checkIn.weekStart).toLocaleDateString()
    await db.clientNotification.create({
      data: {
        userId: checkIn.userId,
        title: 'Your coach replied to your check-in',
        message: `Coach feedback on your check-in for the week of ${weekLabel}: ${parsed.data.coachNotes}`,
        type: 'general',
      },
    })

    return NextResponse.json({ ok: true })
  }
)
