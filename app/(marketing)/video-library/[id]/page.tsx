import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { db } from '@/lib/db/client'
import YouTubeEmbed from '@/components/marketing/YouTubeEmbed'

export const dynamic = 'force-dynamic'

export default async function VideoDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const video = await db.videoLibraryItem.findUnique({
    where: { id: params.id },
  })

  if (!video) notFound()

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-10">
      <Link
        href="/video-library"
        className="inline-flex items-center gap-1 font-body text-sm font-semibold text-green hover:text-green-light"
      >
        <ArrowLeft size={16} /> Back to library
      </Link>

      <div className="mt-5">
        <YouTubeEmbed videoId={video.youtubeVideoId} title={video.title} />
      </div>

      {video.category && (
        <span className="mt-5 inline-block font-display text-xs font-bold uppercase tracking-wide text-gold-dark">
          {video.category}
        </span>
      )}
      <h1 className="mt-1 font-display text-2xl font-bold text-charcoal">
        {video.title}
      </h1>

      {video.description && (
        <p className="mt-3 whitespace-pre-wrap font-body text-grey-dark">
          {video.description}
        </p>
      )}

      {video.tags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {video.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-grey-light px-3 py-1 font-body text-xs text-grey-dark"
            >
              #{t}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
