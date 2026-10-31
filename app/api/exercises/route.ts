import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'
import type { Prisma } from '@prisma/client'

/** Paginated exercise library with search + body-part/equipment filters. */
export const GET = withAuth(async (req: Request) => {
  const session = await requireAuth()
  const userId = session.user.id

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  const bodyPart = searchParams.get('bodyPart')?.trim()
  const equipment = searchParams.get('equipment')?.trim()
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10) || 1, 1)
  const limit = Math.min(
    Math.max(parseInt(searchParams.get('limit') || '24', 10) || 24, 1),
    60
  )

  const where: Prisma.ExerciseWhereInput = {}
  if (q) where.name = { contains: q, mode: 'insensitive' }
  if (bodyPart) where.bodyPart = { equals: bodyPart, mode: 'insensitive' }
  if (equipment) where.equipment = { equals: equipment, mode: 'insensitive' }

  const [total, exercises, favorites] = await Promise.all([
    db.exercise.count({ where }),
    db.exercise.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.exerciseFavorite.findMany({
      where: { userId },
      select: { exerciseId: true },
    }),
  ])

  const favSet = new Set(favorites.map((f) => f.exerciseId))
  return NextResponse.json({
    exercises: exercises.map((e) => ({ ...e, isFavorite: favSet.has(e.id) })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
})
