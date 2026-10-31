import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { requireAdmin } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

export const dynamic = 'force-dynamic'

/**
 * Admin video library CRUD — list all and create.
 *
 * Note: the VideoLibraryItem model has no `published` flag, so every record is
 * treated as published (visible on the public page). We intentionally do NOT
 * add a schema field for this.
 */

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional().or(z.literal('')).nullable(),
  youtubeVideoId: z.string().min(1).max(32),
  category: z.string().max(100).optional().or(z.literal('')).nullable(),
  tags: z.array(z.string().max(40)).max(30).optional(),
  durationSeconds: z.number().int().min(0).max(86_400).optional().nullable(),
})

export const GET = withAuth(async () => {
  await requireAdmin()
  const items = await db.videoLibraryItem.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ items })
})

export const POST = withAuth(async (req: Request) => {
  await requireAdmin()
  const parsed = createSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid data' },
      { status: 400 }
    )
  }
  const d = parsed.data
  const created = await db.videoLibraryItem.create({
    data: {
      title: d.title,
      description: d.description || null,
      youtubeVideoId: d.youtubeVideoId,
      category: d.category || null,
      tags: d.tags ?? [],
      durationSeconds: d.durationSeconds ?? null,
    },
    select: { id: true },
  })
  return NextResponse.json({ id: created.id }, { status: 201 })
})
