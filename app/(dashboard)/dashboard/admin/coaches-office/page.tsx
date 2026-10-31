import Link from 'next/link'
import { Plus, Pencil, ExternalLink } from 'lucide-react'
import { db } from '@/lib/db/client'
import { coachPostTypeLabel } from '@/lib/coach/post-types'
import DeletePostButton from '@/components/admin/DeletePostButton'

export const dynamic = 'force-dynamic'

function formatDate(date: Date | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default async function AdminCoachesOfficePage() {
  const posts = await db.coachPost.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      postType: true,
      status: true,
      publishedAt: true,
      updatedAt: true,
    },
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-charcoal">
            Coach&apos;s Office
          </h1>
          <p className="mt-1 font-body text-sm text-grey-dark">
            Manage posts for your public content hub.
          </p>
        </div>
        <Link
          href="/dashboard/admin/coaches-office/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-charcoal transition-colors hover:bg-gold-dark"
        >
          <Plus size={16} />
          New Post
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-grey-mid bg-white">
        {posts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-display text-lg font-bold uppercase tracking-wide text-green">
              No posts yet
            </p>
            <p className="mt-2 font-body text-sm text-grey-dark">
              Create your first post to get started.
            </p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="border-b border-grey-mid bg-grey-light">
              <tr className="font-display text-xs font-bold uppercase tracking-wide text-grey-dark">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grey-mid">
              {posts.map((post) => (
                <tr key={post.id} className="font-body text-sm">
                  <td className="px-4 py-3">
                    <span className="font-semibold text-charcoal">
                      {post.title}
                    </span>
                    <span className="block font-mono text-xs text-grey-dark">
                      /{post.slug}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-grey-dark">
                    {coachPostTypeLabel(post.postType)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 font-display text-xs font-bold uppercase tracking-wide ${
                        post.status === 'published'
                          ? 'bg-green/10 text-green'
                          : 'bg-grey-mid text-grey-dark'
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-grey-dark">
                    {formatDate(post.publishedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-4">
                      {post.status === 'published' && (
                        <Link
                          href={`/coaches-office/${post.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs font-medium text-grey-dark transition-colors hover:text-green"
                        >
                          <ExternalLink size={14} />
                          View
                        </Link>
                      )}
                      <Link
                        href={`/dashboard/admin/coaches-office/${post.id}/edit`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-green transition-colors hover:text-gold-dark"
                      >
                        <Pencil size={14} />
                        Edit
                      </Link>
                      <DeletePostButton id={post.id} title={post.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
