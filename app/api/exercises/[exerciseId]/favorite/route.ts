import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

/** Add or remove an exercise from the current user's favorites. */

export const POST = withAuth(
  async (_req: Request, ctx: { params: { exerciseId: string } }) => {
    const session = await requireAuth()
    const userId = session.user.id
    const { exerciseId } = ctx.params
    await db.exerciseFavorite.upsert({
      where: { userId_exerciseId: { userId, exerciseId } },
      create: { userId, exerciseId },
      update: {},
    })
    return NextResponse.json({ favorite: true })
  }
)

export const DELETE = withAuth(
  async (_req: Request, ctx: { params: { exerciseId: string } }) => {
    const session = await requireAuth()
    const userId = session.user.id
    const { exerciseId } = ctx.params
    await db.exerciseFavorite
      .delete({ where: { userId_exerciseId: { userId, exerciseId } } })
      .catch(() => null)
    return NextResponse.json({ favorite: false })
  }
)
