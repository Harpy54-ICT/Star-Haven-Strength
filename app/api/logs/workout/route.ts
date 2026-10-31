import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'
import { lbsToKg, kgToLbs } from '@/lib/units'

/**
 * Workout logging API.
 *
 * Weights are entered in the user's chosen unit (lbs or kg). We always store
 * `totalVolumeLbs` in pounds and PR `weightKg` in kilograms, converting at this
 * boundary so history and PRs stay consistent regardless of display unit.
 */

const setSchema = z.object({
  weight: z.number().min(0).max(5000),
  reps: z.number().int().min(0).max(1000),
  completed: z.boolean().default(true),
})

const exerciseSchema = z.object({
  name: z.string().min(1).max(200),
  exerciseId: z.string().optional().nullable(),
  sets: z.array(setSchema).min(1),
})

const bodySchema = z.object({
  name: z.string().min(1).max(200).default('Workout'),
  durationMinutes: z.number().int().min(0).max(1440).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  unit: z.enum(['lbs', 'kg']).default('lbs'),
  exercises: z.array(exerciseSchema).min(1),
})

export const POST = withAuth(async (req: Request) => {
  const session = await requireAuth()
  const userId = session.user.id

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid workout data', details: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const data = parsed.data
  const toLbs = (w: number) => (data.unit === 'kg' ? kgToLbs(w) : w)
  const toKg = (w: number) => (data.unit === 'kg' ? w : lbsToKg(w))

  // Totals (volume always in lbs).
  let totalSets = 0
  let totalVolumeLbs = 0
  for (const ex of data.exercises) {
    for (const s of ex.sets) {
      if (s.completed) {
        totalSets += 1
        totalVolumeLbs += toLbs(s.weight) * s.reps
      }
    }
  }
  totalVolumeLbs = Math.round(totalVolumeLbs * 10) / 10

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const log = await db.workoutLog.create({
    data: {
      userId,
      name: data.name,
      durationMinutes: data.durationMinutes ?? null,
      notes: data.notes ?? null,
      exercises: data.exercises,
      totalSets,
      totalVolumeLbs,
      loggedAt: new Date(),
    },
    select: { id: true },
  })

  // ---- Auto PR detection (strength: heaviest completed set per exercise) ----
  const newPRs: { exerciseName: string; weightKg: number; reps: number }[] = []
  for (const ex of data.exercises) {
    let bestKg = 0
    let bestReps = 0
    for (const s of ex.sets) {
      if (!s.completed || s.weight <= 0) continue
      const kg = toKg(s.weight)
      if (kg > bestKg) {
        bestKg = kg
        bestReps = s.reps
      }
    }
    if (bestKg <= 0) continue

    const existing = await db.pRLog.findFirst({
      where: { userId, exerciseName: ex.name, prType: 'strength' },
      orderBy: { weightKg: 'desc' },
    })

    if (!existing || (existing.weightKg ?? 0) < bestKg) {
      // Supersede any prior "current" PR flag for this exercise.
      await db.pRLog.updateMany({
        where: { userId, exerciseName: ex.name, prType: 'strength', isNewPR: true },
        data: { isNewPR: false },
      })
      await db.pRLog.create({
        data: {
          userId,
          exerciseName: ex.name,
          exerciseId: ex.exerciseId ?? null,
          prType: 'strength',
          weightKg: Math.round(bestKg * 100) / 100,
          reps: bestReps,
          isNewPR: true,
          achievedAt: today,
        },
      })
      newPRs.push({ exerciseName: ex.name, weightKg: Math.round(bestKg * 100) / 100, reps: bestReps })
    }
  }

  // XP award stub (gamification wiring comes later): 10 XP per set, capped 100.
  const xpAwarded = Math.min(totalSets * 10, 100)
  console.log(`[xp] user=${userId} workout=${log.id} awarded=${xpAwarded}`)

  return NextResponse.json({ id: log.id, newPRs, xpAwarded })
})

export const GET = withAuth(async (req: Request) => {
  const session = await requireAuth()
  const userId = session.user.id

  const { searchParams } = new URL(req.url)
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10) || 1, 1)
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10) || 20, 1), 100)
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  const where: {
    userId: string
    loggedAt?: { gte?: Date; lte?: Date }
  } = { userId }
  if (startDate || endDate) {
    where.loggedAt = {}
    if (startDate) where.loggedAt.gte = new Date(startDate)
    if (endDate) {
      const end = new Date(endDate)
      end.setUTCHours(23, 59, 59, 999)
      where.loggedAt.lte = end
    }
  }

  const [total, logs] = await Promise.all([
    db.workoutLog.count({ where }),
    db.workoutLog.findMany({
      where,
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
