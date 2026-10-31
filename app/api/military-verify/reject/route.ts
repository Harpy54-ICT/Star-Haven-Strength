import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { requireAdmin } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

const bodySchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  reason: z.string().max(1000).optional(),
})

/**
 * POST /api/military-verify/reject — admin only.
 *
 * Rejects a user's pending military verification, notifies them, and writes an
 * audit-log entry.
 */
export const POST = withAuth(async (req: Request) => {
  const session = await requireAdmin()
  const adminId = session.user.id

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid request' },
      { status: 400 }
    )
  }
  const { userId, reason } = parsed.data

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true },
  })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  await db.militaryVerification.updateMany({
    where: { userId, status: 'pending' },
    data: {
      status: 'rejected',
      reviewedAt: new Date(),
      reviewedBy: adminId,
      notes: reason ?? undefined,
    },
  })

  await db.clientNotification.create({
    data: {
      userId,
      title: 'Military Verification Update',
      message: `Military verification was not approved.${
        reason ? ` ${reason}` : ''
      }`,
      type: 'general',
    },
  })

  await db.adminAuditLog.create({
    data: {
      adminId,
      action: 'military_verify_reject',
      targetUserId: userId,
      reason: reason,
    },
  })

  return NextResponse.json({ success: true })
})
