import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

/** Cohort discussion board. Only enrolled members (or admins) may read/post. */

const postSchema = z.object({
  content: z.string().min(1).max(5000),
  weekNumber: z.number().int().min(0).max(104).optional().nullable(),
  parentId: z.string().optional().nullable(),
})

async function isMember(cohortId: string, userId: string, role?: string) {
  if (role === 'admin') return true
  const enrollment = await db.cohortEnrollment.findUnique({
    where: { cohortId_userId: { cohortId, userId } },
    select: { id: true },
  })
  return !!enrollment
}

export const GET = withAuth(
  async (_req: Request, ctx: { params: { cohortId: string } }) => {
    const session = await requireAuth()
    const cohortId = ctx.params.cohortId
    if (!(await isMember(cohortId, session.user.id, session.user.role))) {
      return NextResponse.json(
        { error: 'Enroll to view the discussion' },
        { status: 403 }
      )
    }

    const posts = await db.cohortDiscussion.findMany({
      where: { cohortId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    })
    return NextResponse.json({ posts })
  }
)

export const POST = withAuth(
  async (req: Request, ctx: { params: { cohortId: string } }) => {
    const session = await requireAuth()
    const cohortId = ctx.params.cohortId
    if (!(await isMember(cohortId, session.user.id, session.user.role))) {
      return NextResponse.json(
        { error: 'Enroll to post in the discussion' },
        { status: 403 }
      )
    }
    const parsed = postSchema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid post' }, { status: 400 })
    }
    const created = await db.cohortDiscussion.create({
      data: {
        cohortId,
        userId: session.user.id,
        content: parsed.data.content,
        weekNumber: parsed.data.weekNumber ?? null,
        parentId: parsed.data.parentId ?? null,
      },
      select: { id: true },
    })
    return NextResponse.json({ id: created.id })
  }
)
