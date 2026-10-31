import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { db } from '@/lib/db/client'
import CoachPostForm from '@/components/admin/CoachPostForm'
import type { CoachPostTypeValue } from '@/lib/coach/post-types'

export const dynamic = 'force-dynamic'

export default async function EditCoachPostPage({
  params,
}: {
  params: { id: string }
}) {
  const post = await db.coachPost.findUnique({ where: { id: params.id } })
  if (!post) notFound()

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-10">
      <Link
        href="/dashboard/admin/coaches-office"
        className="inline-flex items-center gap-1.5 font-body text-sm font-medium text-green transition-colors hover:text-gold-dark"
      >
        <ArrowLeft size={16} />
        Back to all posts
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight text-charcoal">
        Edit Post
      </h1>
      <div className="mt-8">
        <CoachPostForm
          initial={{
            id: post.id,
            title: post.title,
            slug: post.slug,
            postType: post.postType as CoachPostTypeValue,
            excerpt: post.excerpt ?? '',
            content: post.content,
            sourceTitle: post.sourceTitle ?? '',
            sourceUrl: post.sourceUrl ?? '',
            sourceAuthors: post.sourceAuthors ?? '',
            publishedYear: post.publishedYear
              ? String(post.publishedYear)
              : '',
            tags: post.tags.join(', '),
            status: post.status as 'draft' | 'published',
          }}
        />
      </div>
    </div>
  )
}
