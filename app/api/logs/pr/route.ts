import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'
import { awardXP, XP_AWARDS } from '@/lib/gamification/xp'
import { lbsToKg } from '@/lib/units'

/** Personal record API (manual logging + retrieval). */

const bodySchema = z.object({
  exerciseName: z.string().min(1).max(200),
  prType: z.enum(['strength', 'endurance', 'speed', 'body']),
  weight: z.number().min(0).max(5000).optional().nullable(),
  reps: z.number().int().min(0).max(1000).optional().nullable(),
  distanceMeters: z.number().min(0).optional().nullable(),
  durationSeconds: z.number().int().min(0).optional().nullable(),
  bodyValue: z.number().optional().nullable(),
  unit: z.enum(['lbs', 'kg']).default('lbs'),
  achievedAt: z.string(),
  notes: z.string().max(1000).optional().nullable(),
})

export const POST = withAuth(async (req: Request) => {
  const session = await requireAuth()
  const userId = session.user.id
  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid PR data', details: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const d = parsed.data
  const weightKg =
    d.weight != null ? (d.unit === 'kg' ? d.weight : lbsToKg(d.weight)) : null
  const achieved = new Date(d.achievedAt)
  achieved.setUTCHours(0, 0, 0, 0)

  // Supersede prior current PR flag for this exercise + type.
  await db.pRLog.updateMany({
    where: { userId, exerciseName: d.exerciseName, prType: d.prType, isNewPR: true },
    data: { isNewPR: false },
  })

  const created = await db.pRLog.create({
    data: {
      userId,
      exerciseName: d.exerciseName,
      prType: d.prType,
      weightKg: weightKg != null ? Math.round(weightKg * 100) / 100 : null,
      reps: d.reps ?? null,
      distanceMeters: d.distanceMeters ?? null,
      durationSeconds: d.durationSeconds ?? null,
      bodyValue: d.bodyValue ?? null,
      notes: d.notes ?? null,
      isNewPR: true,
      achievedAt: achieved,
    },
    select: { id: true },
  })

  await awardXP(userId, 'PR_ACHIEVED', XP_AWARDS.PR_ACHIEVED, {
    exerciseName: d.exerciseName,
  })

  return NextResponse.json({ id: created.id })
})

export const GET = withAuth(async (req: Request) => {
  const session = await requireAuth()
  const userId = session.user.id
  const { searchParams } = new URL(req.url)
  const exerciseName = searchParams.get('exerciseName')
  const prType = searchParams.get('prType')

  const where: {
    userId: string
    exerciseName?: { contains: string; mode: 'insensitive' }
    prType?: 'strength' | 'endurance' | 'speed' | 'body'
  } = { userId }
  if (exerciseName) where.exerciseName = { contains: exerciseName, mode: 'insensitive' }
  if (prType && ['strength', 'endurance', 'speed', 'body'].includes(prType)) {
    where.prType = prType as 'strength' | 'endurance' | 'speed' | 'body'
  }

  const prs = await db.pRLog.findMany({
    where,
    orderBy: { achievedAt: 'desc' },
  })
  return NextResponse.json({ prs })
})
