import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'
import { lbsToKg, inToCm, round } from '@/lib/units'

/**
 * Body metrics API. Weight/muscle mass are entered in kg or lbs; circumference
 * measurements in cm or in. Everything is converted to metric (kg/cm) for
 * storage and upserted per calendar day so there is one entry per day.
 */

const numOpt = z.number().min(0).max(1000).optional().nullable()

const bodySchema = z.object({
  measuredAt: z.string().min(1),
  weightUnit: z.enum(['kg', 'lbs']).default('lbs'),
  lengthUnit: z.enum(['cm', 'in']).default('in'),
  weight: numOpt,
  muscleMass: numOpt,
  bodyFatPercentage: z.number().min(0).max(100).optional().nullable(),
  waist: numOpt,
  chest: numOpt,
  hips: numOpt,
  leftArm: numOpt,
  rightArm: numOpt,
  leftThigh: numOpt,
  rightThigh: numOpt,
  neck: numOpt,
  shoulders: numOpt,
  leftCalf: numOpt,
  rightCalf: numOpt,
  notes: z.string().max(2000).optional().nullable(),
})

export const POST = withAuth(async (req: Request) => {
  const session = await requireAuth()
  const userId = session.user.id

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid body metrics data', details: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const d = parsed.data

  const toKg = (v?: number | null) =>
    v == null ? null : round(d.weightUnit === 'kg' ? v : lbsToKg(v), 2)
  const toCm = (v?: number | null) =>
    v == null ? null : round(d.lengthUnit === 'cm' ? v : inToCm(v), 1)

  // Normalise the measurement date to midnight UTC (schema column is @db.Date).
  const measuredAt = new Date(d.measuredAt)
  measuredAt.setUTCHours(0, 0, 0, 0)
  if (Number.isNaN(measuredAt.getTime())) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
  }

  const data = {
    weightKg: toKg(d.weight),
    muscleMassKg: toKg(d.muscleMass),
    bodyFatPercentage: d.bodyFatPercentage ?? null,
    waistCm: toCm(d.waist),
    chestCm: toCm(d.chest),
    hipsCm: toCm(d.hips),
    leftArmCm: toCm(d.leftArm),
    rightArmCm: toCm(d.rightArm),
    leftThighCm: toCm(d.leftThigh),
    rightThighCm: toCm(d.rightThigh),
    neckCm: toCm(d.neck),
    shouldersCm: toCm(d.shoulders),
    leftCalfCm: toCm(d.leftCalf),
    rightCalfCm: toCm(d.rightCalf),
    notes: d.notes ?? null,
  }

  const record = await db.bodyMetric.upsert({
    where: { userId_measuredAt: { userId, measuredAt } },
    create: { userId, measuredAt, source: 'manual', ...data },
    update: data,
    select: { id: true },
  })

  return NextResponse.json({ id: record.id })
})

export const GET = withAuth(async () => {
  const session = await requireAuth()
  const userId = session.user.id

  const metrics = await db.bodyMetric.findMany({
    where: { userId },
    orderBy: { measuredAt: 'desc' },
  })

  return NextResponse.json({ metrics })
})
