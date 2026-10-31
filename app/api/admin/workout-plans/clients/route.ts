import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { requireAdmin } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/workout-plans/clients — a lightweight, unpaginated list of all
 * client accounts for the plan-builder dropdown. Returns { id, name, email }[].
 */
export const GET = withAuth(async () => {
  await requireAdmin()

  const users = await db.user.findMany({
    where: { role: 'client' },
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }, { email: 'asc' }],
    select: { id: true, firstName: true, lastName: true, email: true },
  })

  const clients = users.map((u) => ({
    id: u.id,
    name: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email,
    email: u.email,
  }))

  return NextResponse.json({ clients })
})
