import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { db } from '@/lib/db/client'
import { coachPostTypeLabel } from '@/lib/coach/post-types'

export const dynamic = 'force-dynamic'

async function getPost(slug: string) {
  return db.coachPost.findFirst({
    where: { slug, status: 'published' },
  })
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = await getPost(params.slug)
  if (!post) {
    return { title: "Post Not Found | Coach's Office" }
  }
  const description =
    post.excerpt ?? post.content.slice(0, 155).replace(/\s+\S*$/, '') + '…'
  return {
    title: `${post.title} | Coach's Office | Star Haven Strength`,
    description,
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      ...(post.coverImageUrl ? { images: [post.coverImageUrl] } : {}),
    },
  }
}

function formatDate(date: Date | null): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function CoachPostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getPost(params.slug)
  if (!post) notFound()

  // Render the body safely as plain-text paragraphs. We never inject raw HTML.
  const paragraphs = post.content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <main className="min-h-screen bg-grey-light">
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
        <Link
          href="/coaches-office"
          className="inline-flex items-center gap-1.5 font-body text-sm font-medium text-green transition-colors hover:text-gold-dark"
        >
          <ArrowLeft size={16} />
          Coach&apos;s Office
        </Link>

        <header className="mt-6">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-green/10 px-3 py-1 font-display text-xs font-bold uppercase tracking-wide text-green">
              {coachPostTypeLabel(post.postType)}
            </span>
            {post.publishedAt && (
              <span className="font-mono text-xs text-grey-dark">
                {formatDate(post.publishedAt)}
              </span>
            )}
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold uppercase tracking-tight text-charcoal">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-4 font-body text-lg leading-relaxed text-grey-dark">
              {post.excerpt}
            </p>
          )}
        </header>

        {post.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-grey-mid px-3 py-1 font-body text-xs text-grey-dark"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-8 space-y-5">
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className="font-body text-base leading-relaxed text-charcoal"
            >
              {p}
            </p>
          ))}
        </div>

        {/* Source / citation */}
        {(post.sourceTitle || post.sourceUrl || post.sourceAuthors) && (
          <aside className="mt-12 rounded-xl border border-grey-mid bg-white p-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-widest text-gold-dark">
              Source
            </h2>
            <div className="mt-3 space-y-1 font-body text-sm text-grey-dark">
              {post.sourceTitle && (
                <p className="font-semibold text-charcoal">{post.sourceTitle}</p>
              )}
              {post.sourceAuthors && <p>{post.sourceAuthors}</p>}
              {post.publishedYear && <p>Published {post.publishedYear}</p>}
              {post.sourceUrl && (
                <a
                  href={post.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="mt-2 inline-flex items-center gap-1.5 font-medium text-green hover:text-gold-dark"
                >
                  View original source
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </aside>
        )}
      </article>
    </main>
  )
}
