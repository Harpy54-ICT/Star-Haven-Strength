import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'

export const dynamic = 'force-dynamic'

/**
 * Public video library listing. No auth required.
 *
 * All VideoLibraryItem records are considered published (the model has no
 * `published` flag). Optional `?category=` filter.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')?.trim()

  const items = await db.videoLibraryItem.findMany({
    where: category ? { category } : undefined,
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      youtubeVideoId: true,
      category: true,
      tags: true,
      durationSeconds: true,
      publishedAt: true,
    },
  })

  // Distinct, non-null categories for the filter UI.
  const categories = Array.from(
    new Set(
      items
        .map((i) => i.category)
        .filter((c): c is string => !!c && c.length > 0)
    )
  ).sort()

  return NextResponse.json({ items, categories })
}
