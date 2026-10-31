import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

/**
 * PATCH /api/messages/[messageId]/read — mark a message as read.
 * Only the recipient may mark their received message as read.
 */
export const PATCH = withAuth(
  async (_req: Request, ctx: { params: { messageId: string } }) => {
    const session = await requireAuth()
    const userId = session.user.id

    const result = await db.directMessage.updateMany({
      where: {
        id: ctx.params.messageId,
        recipientId: userId,
        readAt: null,
      },
      data: { readAt: new Date() },
    })

    if (result.count === 0) {
      // Either not found, not the recipient, or already read — all non-fatal.
      return NextResponse.json({ success: true, updated: false })
    }
    return NextResponse.json({ success: true, updated: true })
  }
)
