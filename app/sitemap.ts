import type { MetadataRoute } from 'next'
import { db } from '@/lib/db/client'

export const dynamic = 'force-dynamic'

const BASE_URL = 'https://www.starhavenstrength.com'

/** Public marketing routes that always exist. */
const STATIC_ROUTES = [
  '',
  '/home',
  '/about',
  '/services',
  '/pricing',
  '/contact',
  '/faq',
  '/references',
  '/testimonials',
  '/sample-workouts',
  '/coaches-office',
  '/video-library',
  '/challenges',
  '/privacy',
  '/terms',
  '/refund-policy',
  '/medical-disclaimer',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '' || path === '/home' ? 1 : 0.7,
  }))

  // Published Coach's Office posts — wrapped so a missing DB never breaks build.
  try {
    const posts = await db.coachPost.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: 'desc' },
    })
    for (const post of posts) {
      entries.push({
        url: `${BASE_URL}/coaches-office/${post.slug}`,
        lastModified: post.updatedAt ?? now,
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    }
  } catch {
    // No DB available at build time — skip dynamic post entries.
  }

  // Video library items.
  try {
    const videos = await db.videoLibraryItem.findMany({
      select: { id: true, createdAt: true },
      orderBy: { publishedAt: 'desc' },
    })
    for (const video of videos) {
      entries.push({
        url: `${BASE_URL}/video-library/${video.id}`,
        lastModified: video.createdAt ?? now,
        changeFrequency: 'monthly',
        priority: 0.5,
      })
    }
  } catch {
    // No DB available at build time — skip dynamic video entries.
  }

  return entries
}
