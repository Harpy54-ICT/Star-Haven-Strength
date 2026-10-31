import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

/**
 * GET /api/exercises/search?q=bench&limit=20
 *
 * Case-insensitive search of the local Exercise table by name. Returns a
 * lightweight list for the exercise picker in the workout logger.
 */
export const GET = withAuth(async (req: Request) => {
  await requireAuth()

  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') || '').trim()
  const limitRaw = parseInt(searchParams.get('limit') || '20', 10)
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 50) : 20

  if (q.length < 2) {
    return NextResponse.json({ exercises: [] })
  }

  const exercises = await db.exercise.findMany({
    where: { name: { contains: q, mode: 'insensitive' } },
    select: {
      id: true,
      name: true,
      bodyPart: true,
      targetMuscle: true,
      equipment: true,
    },
    orderBy: { name: 'asc' },
    take: limit,
  })

  return NextResponse.json({ exercises })
})
