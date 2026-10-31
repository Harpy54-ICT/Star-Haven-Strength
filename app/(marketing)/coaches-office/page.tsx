import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { db } from '@/lib/db/client'
import {
  COACH_POST_TYPES,
  coachPostTypeLabel,
  type CoachPostTypeValue,
} from '@/lib/coach/post-types'
import type { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Coach's Office | Star Haven Strength",
  description:
    "Drue's content hub — science reviews, workout info, and coaching commentary from Star Haven Strength.",
}

const VALID_TYPES = COACH_POST_TYPES.map((t) => t.value)

function formatDate(date: Date | null): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default async function CoachesOfficePage({
  searchParams,
}: {
  searchParams: { type?: string }
}) {
  const typeParam = searchParams.type
  const activeType =
    typeParam && VALID_TYPES.includes(typeParam as CoachPostTypeValue)
      ? (typeParam as CoachPostTypeValue)
      : null

  const where: Prisma.CoachPostWhereInput = {
    status: 'published',
    ...(activeType ? { postType: activeType } : {}),
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
    },
  })

  return (
    <main className="min-h-screen bg-grey-light">
      <section className="bg-green">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6">
          <p className="font-display text-xs font-bold uppercase tracking-widest text-gold">
            Star Haven Strength
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl">
            Coach&apos;s Office
          </h1>
          <p className="mx-auto mt-4 max-w-2xl font-body text-lg leading-relaxed text-white/85">
            Evidence, technique, and straight talk from Drue. Science reviews,
            workout info, and coaching commentary — all in one place.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        {/* Type filter */}
        <div className="flex flex-wrap justify-center gap-2">
          <FilterLink label="All" href="/coaches-office" active={!activeType} />
          {COACH_POST_TYPES.map((t) => (
            <FilterLink
              key={t.value}
              label={t.label}
              href={`/coaches-office?type=${t.value}`}
              active={activeType === t.value}
            />
          ))}
        </div>

        {/* Posts */}
        <div className="mt-10">
          {posts.length === 0 ? (
            <div className="rounded-xl border border-grey-mid bg-white p-12 text-center">
              <p className="font-display text-lg font-bold uppercase tracking-wide text-green">
                No posts yet
              </p>
              <p className="mt-2 font-body text-sm text-grey-dark">
                Check back soon — Drue is working on new content.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/coaches-office/${post.slug}`}
                  className="group block rounded-xl border border-grey-mid bg-white p-6 transition-all hover:border-gold hover:shadow-lg"
                >
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
                  <h2 className="mt-3 font-display text-2xl font-bold uppercase tracking-tight text-charcoal transition-colors group-hover:text-green">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mt-2 font-body text-base leading-relaxed text-grey-dark">
                      {post.excerpt}
                    </p>
                  )}
                  {post.sourceTitle && (
                    <p className="mt-2 font-body text-sm italic text-grey-dark">
                      Reviewing: {post.sourceTitle}
                    </p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1.5 font-display text-sm font-bold uppercase tracking-wide text-green transition-colors group-hover:text-gold-dark">
                    Read more
                    <ArrowRight size={16} />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

function FilterLink({
  label,
  href,
  active,
}: {
  label: string
  href: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-2 font-display text-xs font-bold uppercase tracking-wide transition-colors ${
        active
          ? 'bg-green text-white'
          : 'border border-grey-mid bg-white text-grey-dark hover:border-green hover:text-green'
      }`}
    >
      {label}
    </Link>
  )
}
