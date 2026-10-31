import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { requireAdmin } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

/**
 * Admin-only exercise library seed endpoint.
 *
 * If RAPIDAPI_KEY is set, pulls from the ExerciseDB API. Otherwise seeds a
 * small built-in starter set so the library is usable in development.
 *
 * TODO: Set RAPIDAPI_KEY env var to enable full ExerciseDB import
 * (https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb).
 */

interface ExerciseDBItem {
  id?: string
  name: string
  bodyPart?: string
  target?: string
  equipment?: string
  secondaryMuscles?: string[]
  instructions?: string[]
  gifUrl?: string
}

const STARTER_SET: ExerciseDBItem[] = [
  {
    id: 'seed-barbell-squat',
    name: 'Barbell Back Squat',
    bodyPart: 'upper legs',
    target: 'quads',
    equipment: 'barbell',
    secondaryMuscles: ['glutes', 'hamstrings'],
    instructions: ['Set the bar on your upper back.', 'Squat to depth.', 'Drive up through your heels.'],
  },
  {
    id: 'seed-bench-press',
    name: 'Barbell Bench Press',
    bodyPart: 'chest',
    target: 'pectorals',
    equipment: 'barbell',
    secondaryMuscles: ['triceps', 'front delts'],
    instructions: ['Lie on the bench.', 'Lower the bar to your chest.', 'Press to lockout.'],
  },
  {
    id: 'seed-deadlift',
    name: 'Conventional Deadlift',
    bodyPart: 'back',
    target: 'lower back',
    equipment: 'barbell',
    secondaryMuscles: ['glutes', 'hamstrings', 'traps'],
    instructions: ['Grip the bar.', 'Brace and lift by extending hips and knees.', 'Lock out at the top.'],
  },
  {
    id: 'seed-pullup',
    name: 'Pull-Up',
    bodyPart: 'back',
    target: 'lats',
    equipment: 'body weight',
    secondaryMuscles: ['biceps'],
    instructions: ['Hang from the bar.', 'Pull your chin over the bar.', 'Lower under control.'],
  },
  {
    id: 'seed-ohp',
    name: 'Overhead Press',
    bodyPart: 'shoulders',
    target: 'delts',
    equipment: 'barbell',
    secondaryMuscles: ['triceps'],
    instructions: ['Start at shoulder height.', 'Press overhead.', 'Lower under control.'],
  },
  {
    id: 'seed-row',
    name: 'Barbell Row',
    bodyPart: 'back',
    target: 'lats',
    equipment: 'barbell',
    secondaryMuscles: ['biceps', 'rear delts'],
    instructions: ['Hinge at the hips.', 'Row the bar to your waist.', 'Lower under control.'],
  },
]

async function fetchExerciseDB(): Promise<ExerciseDBItem[]> {
  const key = process.env.RAPIDAPI_KEY
  if (!key) return STARTER_SET
  try {
    const res = await fetch(
      'https://exercisedb.p.rapidapi.com/exercises?limit=200',
      {
        headers: {
          'X-RapidAPI-Key': key,
          'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
        },
      }
    )
    if (!res.ok) return STARTER_SET
    return (await res.json()) as ExerciseDBItem[]
  } catch {
    return STARTER_SET
  }
}

export const POST = withAuth(async () => {
  await requireAdmin()
  const items = await fetchExerciseDB()

  let created = 0
  for (const it of items) {
    if (!it.name) continue
    const externalId = it.id ?? `seed-${it.name.toLowerCase().replace(/\s+/g, '-')}`
    await db.exercise.upsert({
      where: { externalId },
      create: {
        externalId,
        name: it.name,
        bodyPart: it.bodyPart ?? null,
        targetMuscle: it.target ?? null,
        equipment: it.equipment ?? null,
        secondaryMuscles: it.secondaryMuscles ?? [],
        instructions: it.instructions ?? [],
        gifUrl: it.gifUrl ?? null,
        isCustom: false,
      },
      update: {
        bodyPart: it.bodyPart ?? null,
        targetMuscle: it.target ?? null,
        equipment: it.equipment ?? null,
      },
    })
    created += 1
  }

  return NextResponse.json({
    seeded: created,
    source: process.env.RAPIDAPI_KEY ? 'exercisedb' : 'starter-set',
  })
})
