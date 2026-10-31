import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

/**
 * Direct messaging API.
 *
 * Clients may only converse with the coach (the admin user). Admins may
 * converse with any client. Both directions are enforced server-side.
 */

const senderSelect = {
  id: true,
  firstName: true,
  lastName: true,
  image: true,
} as const

async function getAdminId(): Promise<string | null> {
  const admin = await db.user.findFirst({
    where: { role: 'admin' },
    select: { id: true },
  })
  return admin?.id ?? null
}

/** GET /api/messages?with=userId — conversation thread (last 50, ASC). */
export const GET = withAuth(async (req: Request) => {
  const session = await requireAuth()
  const userId = session.user.id
  const isAdmin = session.user.role === 'admin'

  const { searchParams } = new URL(req.url)
  const withId = searchParams.get('with')?.trim()
  if (!withId) {
    return NextResponse.json({ error: 'Missing "with" param' }, { status: 400 })
  }

  // Clients can only talk to the coach.
  if (!isAdmin) {
    const adminId = await getAdminId()
    if (!adminId || withId !== adminId) {
      return NextResponse.json(
        { error: 'You can only message your coach' },
        { status: 403 }
      )
    }
  }

  const messages = await db.directMessage.findMany({
    where: {
      OR: [
        { senderId: userId, recipientId: withId },
        { senderId: withId, recipientId: userId },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { sender: { select: senderSelect } },
  })

  // Return oldest-first for chat rendering.
  return NextResponse.json({ messages: messages.reverse() })
})

const postSchema = z.object({
  recipientId: z.string().min(1),
  content: z.string().trim().min(1, 'Message cannot be empty').max(2000),
})

/** POST /api/messages — send a message. */
export const POST = withAuth(async (req: Request) => {
  const session = await requireAuth()
  const userId = session.user.id
  const isAdmin = session.user.role === 'admin'

  const parsed = postSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid message' },
      { status: 400 }
    )
  }
  let { recipientId } = parsed.data
  const { content } = parsed.data

  // Clients can only send to the coach — force the recipient to the admin.
  if (!isAdmin) {
    const adminId = await getAdminId()
    if (!adminId) {
      return NextResponse.json(
        { error: 'No coach is available to receive messages' },
        { status: 400 }
      )
    }
    recipientId = adminId
  }

  const recipient = await db.user.findUnique({
    where: { id: recipientId },
    select: { id: true },
  })
  if (!recipient) {
    return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
  }

  const sender = await db.user.findUnique({
    where: { id: userId },
    select: { firstName: true },
  })

  const message = await db.directMessage.create({
    data: { senderId: userId, recipientId, content },
    include: { sender: { select: senderSelect } },
  })

  // Notify the recipient.
  await db.clientNotification.create({
    data: {
      userId: recipientId,
      title: 'New Message',
      message: `You have a new message from ${sender?.firstName ?? 'your coach'}.`,
      type: 'message',
    },
  })

  return NextResponse.json({ message })
})
