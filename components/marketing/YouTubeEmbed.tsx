import { Video } from 'lucide-react'

/**
 * Responsive 16:9 YouTube embed.
 *
 * Pass a `videoId` to embed. When empty, renders a branded "video coming soon"
 * placeholder so pages can ship before the real footage exists.
 */
export default function YouTubeEmbed({
  videoId,
  title = 'Video',
}: {
  videoId?: string | null
  title?: string
}) {
  if (!videoId) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl border border-grey-mid bg-grey-light text-center">
        <Video className="mb-2 text-green" size={36} />
        <p className="font-display text-sm font-bold uppercase tracking-wide text-green">
          Video coming soon
        </p>
        <p className="mt-1 font-body text-xs text-grey-dark">
          {title} will be available here shortly.
        </p>
      </div>
    )
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl border border-grey-mid bg-black">
      <iframe
        className="h-full w-full"
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
