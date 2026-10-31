import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

const step1Schema = z.object({
  hasInjuries: z.boolean(),
  injuriesDetail: z.string().default(''),
  chronicConditions: z.array(z.string()).default([]),
  chronicConditionOther: z.string().default(''),
  recentSurgery: z.boolean(),
  recentSurgeryDetail: z.string().default(''),
  clearedByDoctor: z.boolean(),
  medicationsAffectingExercise: z.boolean(),
  medicationsDetail: z.string().default(''),
})

const step2Schema = z.object({
  fitnessLevel: z.number().int().min(1).max(5),
  yearsTraining: z.number().int().min(0).max(50),
  trainingStyles: z.array(z.string()).min(1, 'Select at least one training style'),
  daysPerWeek: z.string().min(1, 'Select how many days per week you train'),
  equipmentAccess: z.array(z.string()).min(1, 'Select at least one equipment option'),
})

const step3Schema = z.object({
  primaryGoal: z.string().min(1, 'Select a primary goal'),
  targetTimeline: z.string().min(1, 'Select a target timeline'),
  numericGoal: z.string().default(''),
  additionalNotes: z.string().default(''),
})

const intakeSchema = z.object({
  step1: step1Schema,
  step2: step2Schema,
  step3: step3Schema,
})

/**
 * POST /api/onboarding/intake
 * Upserts the authenticated user's client intake record.
 */
export const POST = withAuth(async (req: Request) => {
  const session = await requireAuth()
  const userId = session.user.id

  const json = await req.json().catch(() => null)
  const parsed = intakeSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid intake data' },
      { status: 400 }
    )
  }

  const { step1, step2, step3 } = parsed.data

  await db.clientIntake.upsert({
    where: { userId },
    create: {
      userId,
      step1Data: step1,
      step2Data: step2,
      step3Data: step3,
      completedAt: new Date(),
    },
    update: {
      step1Data: step1,
      step2Data: step2,
      step3Data: step3,
      completedAt: new Date(),
    },
  })

  // XP award stub — gamification wiring arrives in a later prompt.
  console.log(`[xp] Award 100 XP to user ${userId} for completing intake`)

  return NextResponse.json({ success: true, redirect: '/dashboard' })
})
