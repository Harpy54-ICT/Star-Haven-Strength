import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import type { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

const VALID_TYPES = ['science_review', 'workout_info', 'commentary'] as const

/**
 * GET /api/coach-posts — public list of PUBLISHED posts.
 * Optional ?type= filter (science_review | workout_info | commentary).
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')

  const where: Prisma.CoachPostWhereInput = {
    status: 'published',
    ...(type && VALID_TYPES.includes(type as (typeof VALID_TYPES)[number])
      ? { postType: type as (typeof VALID_TYPES)[number] }
      : {}),
  }

  const posts = await db.coachPost.findMany({
    where,
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      postType: true,
      publishedAt: true,
      sourceTitle: true,
      tags: true,
    },
  })

  return NextResponse.json({ posts })
}
