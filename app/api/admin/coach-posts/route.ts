import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { requireAdmin } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'
import { slugify } from '@/lib/utils/slug'

export const dynamic = 'force-dynamic'

/** GET /api/admin/coach-posts — list ALL posts (incl. drafts). Admin only. */
export const GET = withAuth(async () => {
  await requireAdmin()
  const posts = await db.coachPost.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ posts })
})

const createSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().max(80).optional(),
  postType: z.enum(['science_review', 'workout_info', 'commentary']),
  content: z.string().min(1, 'Content is required'),
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
  status: z.enum(['draft', 'published']).default('draft'),
})

/** Ensure the slug is unique, appending -2, -3, … on collision. */
async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base) || 'post'
  let candidate = root
  let n = 1
  // Loop until we find a free slug.
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

/** POST /api/admin/coach-posts — create a post. Admin only. */
export const POST = withAuth(async (req: Request) => {
  await requireAdmin()

  const parsed = createSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid input' },
      { status: 400 }
    )
  }
  const data = parsed.data
  const slug = await uniqueSlug(data.slug || data.title)

  const post = await db.coachPost.create({
    data: {
      title: data.title,
      slug,
      postType: data.postType,
      content: data.content,
      excerpt: data.excerpt || null,
      sourceTitle: data.sourceTitle || null,
      sourceUrl: data.sourceUrl || null,
      sourceAuthors: data.sourceAuthors || null,
      publishedYear: data.publishedYear ?? null,
      tags: data.tags ?? [],
      coverImageUrl: data.coverImageUrl || null,
      status: data.status,
      publishedAt: data.status === 'published' ? new Date() : null,
    },
  })

  return NextResponse.json({ post }, { status: 201 })
})
