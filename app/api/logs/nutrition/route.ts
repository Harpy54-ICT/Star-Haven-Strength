import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'
import { awardXP, XP_AWARDS } from '@/lib/gamification/xp'

/** Nutrition logging API. One row per food entry; grouped by day on read. */

const bodySchema = z.object({
  mealName: z.string().min(1).max(200),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snacks']).optional(),
  calories: z.number().int().min(0).max(20000).optional().nullable(),
  proteinG: z.number().min(0).max(5000).optional().nullable(),
  carbsG: z.number().min(0).max(5000).optional().nullable(),
  fatG: z.number().min(0).max(5000).optional().nullable(),
  fiberG: z.number().min(0).max(5000).optional().nullable(),
  sugarG: z.number().min(0).max(5000).optional().nullable(),
  sodiumMg: z.number().min(0).max(100000).optional().nullable(),
  waterOz: z.number().min(0).max(1000).optional().nullable(),
  loggedAt: z.string().datetime().optional(),
})

export const POST = withAuth(async (req: Request) => {
  const session = await requireAuth()
  const userId = session.user.id

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid nutrition data', details: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const d = parsed.data

  const created = await db.nutritionLog.create({
    data: {
      userId,
      mealName: d.mealName,
      mealType: d.mealType ?? null,
      calories: d.calories ?? null,
      proteinG: d.proteinG ?? null,
      carbsG: d.carbsG ?? null,
      fatG: d.fatG ?? null,
      fiberG: d.fiberG ?? null,
      sugarG: d.sugarG ?? null,
      sodiumMg: d.sodiumMg ?? null,
      waterOz: d.waterOz ?? null,
      source: 'manual',
      loggedAt: d.loggedAt ? new Date(d.loggedAt) : new Date(),
    },
    select: { id: true },
  })

  await awardXP(userId, 'NUTRITION_LOGGED', XP_AWARDS.NUTRITION_LOGGED, {
    nutritionId: created.id,
  })

  return NextResponse.json({ id: created.id })
})

export const GET = withAuth(async (req: Request) => {
  const session = await requireAuth()
  const userId = session.user.id

  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  const where: { userId: string; loggedAt?: { gte?: Date; lte?: Date } } = {
    userId,
  }
  if (date) {
    const start = new Date(date)
    start.setUTCHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setUTCHours(23, 59, 59, 999)
    where.loggedAt = { gte: start, lte: end }
  } else if (startDate || endDate) {
    where.loggedAt = {}
    if (startDate) where.loggedAt.gte = new Date(startDate)
    if (endDate) {
      const end = new Date(endDate)
      end.setUTCHours(23, 59, 59, 999)
      where.loggedAt.lte = end
    }
  }

  const logs = await db.nutritionLog.findMany({
    where,
    orderBy: { loggedAt: 'desc' },
    take: 500,
  })

  // Group by YYYY-MM-DD.
  const byDate: Record<string, typeof logs> = {}
  for (const log of logs) {
    const key = log.loggedAt.toISOString().slice(0, 10)
    ;(byDate[key] ??= []).push(log)
  }

  return NextResponse.json({ logs, byDate })
})
