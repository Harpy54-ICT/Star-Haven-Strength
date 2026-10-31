import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { requireAdmin } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

/**
 * GET /api/messages/conversations — admin only.
 *
 * Lists every client who has exchanged messages with the admin, with the last
 * message and the count of unread messages sent by that client.
 */
export const GET = withAuth(async () => {
  const session = await requireAdmin()
  const adminId = session.user.id

  // All messages involving the admin, newest first.
  const messages = await db.directMessage.findMany({
    where: {
      OR: [{ senderId: adminId }, { recipientId: adminId }],
    },
    orderBy: { createdAt: 'desc' },
    include: {
      sender: {
        select: { id: true, firstName: true, lastName: true, image: true },
      },
      recipient: {
        select: { id: true, firstName: true, lastName: true, image: true },
      },
    },
  })

  interface Conversation {
    client: {
      id: string
      firstName: string | null
      lastName: string | null
      image: string | null
    }
    lastMessage: { content: string; createdAt: Date; readAt: Date | null }
    unreadCount: number
  }

  const map = new Map<string, Conversation>()

  for (const m of messages) {
    // The "other" party is the client.
    const client = m.senderId === adminId ? m.recipient : m.sender
    if (!client) continue
    const existing = map.get(client.id)
    if (!existing) {
      map.set(client.id, {
        client: {
          id: client.id,
          firstName: client.firstName,
          lastName: client.lastName,
          image: client.image,
        },
        // messages are newest-first, so the first one we see is the latest.
        lastMessage: {
          content: m.content,
          createdAt: m.createdAt,
          readAt: m.readAt,
        },
        unreadCount: 0,
      })
    }
    // Count unread messages the client sent to the admin.
    if (m.senderId === client.id && m.readAt === null) {
      const conv = map.get(client.id)!
      conv.unreadCount += 1
    }
  }

  return NextResponse.json({ conversations: Array.from(map.values()) })
})
