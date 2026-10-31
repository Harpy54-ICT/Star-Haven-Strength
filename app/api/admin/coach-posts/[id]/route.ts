import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { requireAdmin } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'
import { slugify } from '@/lib/utils/slug'

export const dynamic = 'force-dynamic'

type Ctx = { params: { id: string } }

/** GET /api/admin/coach-posts/[id] — fetch a single post (any status). */
export const GET = withAuth(async (_req: Request, ctx: Ctx) => {
  await requireAdmin()
  const post = await db.coachPost.findUnique({ where: { id: ctx.params.id } })
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }
  return NextResponse.json({ post })
})

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().max(80).optional(),
  postType: z.enum(['science_review', 'workout_info', 'commentary']).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().max(500).optional().nullable(),
  sourceTitle: z.string().max(300).optional().nullable(),
  sourceUrl: z.string().url().max(500).optional().or(z.literal('')).nullable(),
  sourceAuthors: z.string().max(300).optional().nullable(),
  publishedYear: z.number().int().min(1900).max(2100).optional().nullable(),
  tags: z.array(z.string().max(40)).max(20).optional(),
  coverImageUrl: z
    .string()
    .url()
    .max(500)
    .optional()
    .or(z.literal(''))
    .nullable(),
  status: z.enum(['draft', 'published']).optional(),
})

async function uniqueSlug(base: string, excludeId: string): Promise<string> {
  const root = slugify(base) || 'post'
  let candidate = root
  let n = 1
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await db.coachPost.findUnique({
      where: { slug: candidate },
      select: { id: true },
    })
    if (!existing || existing.id === excludeId) return candidate
    n += 1
    candidate = `${root}-${n}`
  }
}

/** PATCH /api/admin/coach-posts/[id] — update a post. */
export const PATCH = withAuth(async (req: Request, ctx: Ctx) => {
  await requireAdmin()
  const { id } = ctx.params

  const current = await db.coachPost.findUnique({ where: { id } })
  if (!current) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  const parsed = updateSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid input' },
      { status: 400 }
    )
  }
  const data = parsed.data

  // Resolve slug only if the caller explicitly sent one.
  const slug =
    data.slug !== undefined
      ? await uniqueSlug(data.slug || current.title, id)
      : undefined

  // Manage publishedAt on status transitions.
  let publishedAt = current.publishedAt
  if (data.status === 'published' && current.status !== 'published') {
    publishedAt = new Date()
  } else if (data.status === 'draft') {
    publishedAt = null
  }

  const post = await db.coachPost.update({
    where: { id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(slug !== undefined ? { slug } : {}),
      ...(data.postType !== undefined ? { postType: data.postType } : {}),
      ...(data.content !== undefined ? { content: data.content } : {}),
      ...(data.excerpt !== undefined ? { excerpt: data.excerpt || null } : {}),
      ...(data.sourceTitle !== undefined
        ? { sourceTitle: data.sourceTitle || null }
        : {}),
      ...(data.sourceUrl !== undefined
        ? { sourceUrl: data.sourceUrl || null }
        : {}),
      ...(data.sourceAuthors !== undefined
        ? { sourceAuthors: data.sourceAuthors || null }
        : {}),
      ...(data.publishedYear !== undefined
        ? { publishedYear: data.publishedYear ?? null }
        : {}),
      ...(data.tags !== undefined ? { tags: data.tags } : {}),
      ...(data.coverImageUrl !== undefined
        ? { coverImageUrl: data.coverImageUrl || null }
        : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      publishedAt,
    },
  })

  return NextResponse.json({ post })
})

/** DELETE /api/admin/coach-posts/[id] — delete a post. */
export const DELETE = withAuth(async (_req: Request, ctx: Ctx) => {
  await requireAdmin()
  const { id } = ctx.params
  const existing = await db.coachPost.findUnique({
    where: { id },
    select: { id: true },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }
  await db.coachPost.delete({ where: { id } })
  return NextResponse.json({ success: true })
})
