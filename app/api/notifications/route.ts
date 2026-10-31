import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

/** GET /api/notifications — current user's notifications (newest first, max 30). */
export const GET = withAuth(async () => {
  const session = await requireAuth()
  const notifications = await db.clientNotification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 30,
  })
  const unreadCount = notifications.filter((n) => n.readAt === null).length
  return NextResponse.json({ notifications, unreadCount })
})

const patchSchema = z.union([
  z.object({ notificationId: z.string().min(1) }),
  z.object({ markAllRead: z.literal(true) }),
])

/** PATCH /api/notifications — mark one or all notifications read. */
export const PATCH = withAuth(async (req: Request) => {
  const session = await requireAuth()
  const userId = session.user.id

  const parsed = patchSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if ('markAllRead' in parsed.data) {
    await db.clientNotification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    })
  } else {
    await db.clientNotification.updateMany({
      where: { id: parsed.data.notificationId, userId, readAt: null },
      data: { readAt: new Date() },
    })
  }

  return NextResponse.json({ success: true })
})
