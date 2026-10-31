import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { requireAdmin } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

export const dynamic = 'force-dynamic'

/** Admin: approve or reject a payout request (and notify the member). */

const patchSchema = z.object({
  action: z.enum(['approve', 'reject']),
  notes: z.string().max(1000).optional().nullable(),
})

export const PATCH = withAuth(
  async (req: Request, ctx: { params: { id: string } }) => {
    await requireAdmin()
    const parsed = patchSchema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    const payout = await db.payoutRequest.findUnique({
      where: { id: ctx.params.id },
      select: { id: true, userId: true, amountCents: true, status: true },
    })
    if (!payout) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const approved = parsed.data.action === 'approve'
    const status = approved ? 'approved' : 'rejected'

    await db.payoutRequest.update({
      where: { id: payout.id },
      data: {
        status,
        processedAt: new Date(),
        ...(parsed.data.notes !== undefined
          ? { notes: parsed.data.notes || null }
          : {}),
      },
    })

    const amount = `$${(payout.amountCents / 100).toFixed(2)}`
    await db.clientNotification.create({
      data: {
        userId: payout.userId,
        title: approved ? 'Payout approved' : 'Payout request declined',
        message: approved
          ? `Your payout request for ${amount} has been approved and will be processed.`
          : `Your payout request for ${amount} was declined.${
              parsed.data.notes ? ` Note: ${parsed.data.notes}` : ''
            }`,
        type: 'general',
      },
    })

    return NextResponse.json({ ok: true, status })
  }
)
