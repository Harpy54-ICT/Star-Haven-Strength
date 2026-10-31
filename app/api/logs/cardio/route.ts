import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'
import { milesToMeters, kmToMeters } from '@/lib/units'
import { awardXP, XP_AWARDS } from '@/lib/gamification/xp'

/**
 * Cardio logging API. Distances are entered in miles or km and converted to
 * meters for storage so pace/distance comparisons stay consistent.
 */

const bodySchema = z.object({
  cardioType: z.string().min(1).max(100),
  durationSeconds: z.number().int().min(1).max(86400),
  distance: z.number().min(0).max(1000).optional().nullable(),
  distanceUnit: z.enum(['mi', 'km']).default('mi'),
  calories: z.number().int().min(0).max(50000).optional().nullable(),
  heartRateAvg: z.number().int().min(0).max(250).optional().nullable(),
  intensity: z.number().int().min(1).max(10).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
})

export const POST = withAuth(async (req: Request) => {
  const session = await requireAuth()
  const userId = session.user.id

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid cardio data', details: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const d = parsed.data

  let distanceMeters: number | null = null
  if (d.distance && d.distance > 0) {
    distanceMeters = d.distanceUnit === 'km' ? kmToMeters(d.distance) : milesToMeters(d.distance)
    distanceMeters = Math.round(distanceMeters)
  }

  // Pace in seconds per km (handy for charts later).
  let paceSecondsPerKm: number | null = null
  if (distanceMeters && distanceMeters > 0) {
    paceSecondsPerKm = Math.round(d.durationSeconds / (distanceMeters / 1000))
  }

  const log = await db.cardioLog.create({
    data: {
      userId,
      cardioType: d.cardioType,
      durationSeconds: d.durationSeconds,
      distanceMeters,
      calories: d.calories ?? null,
      heartRateAvg: d.heartRateAvg ?? null,
      intensity: d.intensity != null ? String(d.intensity) : null,
      paceSecondsPerKm,
      notes: d.notes ?? null,
      source: 'manual',
      loggedAt: new Date(),
    },
    select: { id: true },
  })

  // Award XP for logging cardio.
  await awardXP(userId, 'CARDIO_LOGGED', XP_AWARDS.CARDIO_LOGGED, {
    cardioId: log.id,
  })

  return NextResponse.json({ id: log.id, xpAwarded: XP_AWARDS.CARDIO_LOGGED })
})

export const GET = withAuth(async (req: Request) => {
  const session = await requireAuth()
  const userId = session.user.id

  const { searchParams } = new URL(req.url)
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10) || 1, 1)
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10) || 20, 1), 100)

  const [total, logs] = await Promise.all([
    db.cardioLog.count({ where: { userId } }),
    db.cardioLog.findMany({
      where: { userId },
      orderBy: { loggedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return NextResponse.json({
    logs,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
})
