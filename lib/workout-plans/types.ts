import { z } from 'zod'

/**
 * Shared types + validation for coach-assigned WorkoutPlans.
 *
 * The plan's `days` column is stored as JSON — an array of day blocks, each
 * with a label and a list of exercises. These schemas are the single source of
 * truth for both the admin builder API and the member viewer.
 */

export const exerciseSchema = z.object({
  name: z.string().trim().min(1, 'Exercise name is required').max(200),
  sets: z.coerce.number().int().min(0).max(100).default(0),
  reps: z.string().trim().max(50).default(''),
  rpe: z.coerce.number().min(1).max(10).optional().nullable(),
  notes: z.string().trim().max(500).optional().nullable(),
})

export const daySchema = z.object({
  dayLabel: z.string().trim().min(1, 'Day label is required').max(120),
  exercises: z.array(exerciseSchema).default([]),
})

export const planDaysSchema = z.array(daySchema)

export const workoutPlanInputSchema = z.object({
  userId: z.string().min(1, 'A client must be selected'),
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(2000).optional().nullable(),
  weeks: z.coerce.number().int().min(1).max(12).default(4),
  days: planDaysSchema.min(1, 'Add at least one day'),
  isActive: z.boolean().default(false),
})

/** Update schema — client cannot be reassigned; everything else is editable. */
export const workoutPlanUpdateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  weeks: z.coerce.number().int().min(1).max(12).optional(),
  days: planDaysSchema.optional(),
  isActive: z.boolean().optional(),
})

export type PlanExercise = z.infer<typeof exerciseSchema>
export type PlanDay = z.infer<typeof daySchema>
export type WorkoutPlanInput = z.infer<typeof workoutPlanInputSchema>

/** Coerce an unknown JSON value from the DB into a typed day array. */
export function parsePlanDays(value: unknown): PlanDay[] {
  const result = planDaysSchema.safeParse(value)
  return result.success ? result.data : []
}
