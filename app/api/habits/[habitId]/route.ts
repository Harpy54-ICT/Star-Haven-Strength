import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { requireOwnership } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

/** Update or soft-delete a single habit. */

const patchSchema = z.object({
  habitName: z.string().min(1).max(200).optional(),
  frequency: z.enum(['daily', 'weekly']).optional(),
  category: z
    .enum(['fitness', 'nutrition', 'recovery', 'mindset', 'other'])
    .optional()
    .nullable(),
  isActive: z.boolean().optional(),
})

export const PATCH = withAuth(
  async (req: Request, ctx: { params: { habitId: string } }) => {
    const habit = await db.habit.findUnique({
      where: { id: ctx.params.habitId },
      select: { userId: true },
    })
    if (!habit) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    await requireOwnership(habit.userId)

    const parsed = patchSchema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }
    await db.habit.update({
      where: { id: ctx.params.habitId },
      data: parsed.data,
    })
    return NextResponse.json({ ok: true })
  }
)

export const DELETE = withAuth(
  async (_req: Request, ctx: { params: { habitId: string } }) => {
    const habit = await db.habit.findUnique({
      where: { id: ctx.params.habitId },
      select: { userId: true },
    })
    if (!habit) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    await requireOwnership(habit.userId)
    // Soft delete.
    await db.habit.update({
      where: { id: ctx.params.habitId },
      data: { isActive: false },
    })
    return NextResponse.json({ ok: true })
  }
)
