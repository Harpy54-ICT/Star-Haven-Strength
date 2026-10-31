import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'

// Queries the database at request time; never statically pre-render.
export const dynamic = 'force-dynamic'

/**
 * GET /api/messages/admin-id
 *
 * Returns the coach's (admin's) user id so a client can load their message
 * thread. This exposes only an opaque id — no sensitive data — so it does not
 * require authentication.
 */
export async function GET() {
  const admin = await db.user.findFirst({
    where: { role: 'admin' },
    select: { id: true },
  })
  return NextResponse.json({ adminId: admin?.id ?? null })
}
