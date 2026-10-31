import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { requireAdmin } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

export const dynamic = 'force-dynamic'

/** Admin: get / edit / delete a single video library item. */

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional().or(z.literal('')).nullable(),
  youtubeVideoId: z.string().min(1).max(32).optional(),
  category: z.string().max(100).optional().or(z.literal('')).nullable(),
  tags: z.array(z.string().max(40)).max(30).optional(),
  durationSeconds: z.number().int().min(0).max(86_400).optional().nullable(),
})

export const GET = withAuth(
  async (_req: Request, ctx: { params: { id: string } }) => {
    await requireAdmin()
    const item = await db.videoLibraryItem.findUnique({
      where: { id: ctx.params.id },
    })
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ item })
  }
)

export const PATCH = withAuth(
  async (req: Request, ctx: { params: { id: string } }) => {
    await requireAdmin()
    const parsed = patchSchema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }
    const d = parsed.data
    await db.videoLibraryItem.update({
      where: { id: ctx.params.id },
      data: {
        ...(d.title !== undefined ? { title: d.title } : {}),
        ...(d.description !== undefined
          ? { description: d.description || null }
          : {}),
        ...(d.youtubeVideoId !== undefined
          ? { youtubeVideoId: d.youtubeVideoId }
          : {}),
        ...(d.category !== undefined ? { category: d.category || null } : {}),
        ...(d.tags !== undefined ? { tags: d.tags } : {}),
        ...(d.durationSeconds !== undefined
          ? { durationSeconds: d.durationSeconds ?? null }
          : {}),
      },
    })
    return NextResponse.json({ ok: true })
  }
)

export const DELETE = withAuth(
  async (_req: Request, ctx: { params: { id: string } }) => {
    await requireAdmin()
    await db.videoLibraryItem.delete({ where: { id: ctx.params.id } })
    return NextResponse.json({ ok: true })
  }
)
