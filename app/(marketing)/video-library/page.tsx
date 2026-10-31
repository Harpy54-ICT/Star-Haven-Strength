'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, PlayCircle } from 'lucide-react'

interface VideoItem {
  id: string
  title: string
  description: string | null
  youtubeVideoId: string
  category: string | null
  tags: string[]
  durationSeconds: number | null
}

function formatDuration(seconds: number | null): string | null {
  if (!seconds || seconds <= 0) return null
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function VideoLibraryPage() {
  const [items, setItems] = useState<VideoItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [active, setActive] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (category: string | null) => {
    setLoading(true)
    try {
      const url = category
        ? `/api/video-library?category=${encodeURIComponent(category)}`
        : '/api/video-library'
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setItems(data.items ?? [])
        // Only set the full category list from the unfiltered call.
        if (!category) setCategories(data.categories ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(active)
  }, [active, load])

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-10">
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-green">
        Video Library
      </h1>
      <p className="mt-2 max-w-2xl font-body text-grey-dark">
        Form tutorials, coaching insights and training breakdowns from Star
        Haven Strength.
      </p>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setActive(null)}
            className={`rounded-full px-4 py-1.5 font-display text-xs font-bold uppercase tracking-wide transition-colors ${
              active === null
                ? 'bg-green text-gold'
                : 'border border-grey-mid text-grey-dark hover:bg-grey-light'
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`rounded-full px-4 py-1.5 font-display text-xs font-bold uppercase tracking-wide transition-colors ${
                active === c
                  ? 'bg-green text-gold'
                  : 'border border-grey-mid text-grey-dark hover:bg-grey-light'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="mt-10 flex items-center gap-2 font-body text-grey-dark">
          <Loader2 className="animate-spin" size={18} /> Loading videos…
        </div>
      ) : items.length === 0 ? (
        <p className="mt-10 rounded-xl border border-grey-mid bg-white p-8 text-center font-body text-grey-dark">
          No videos available yet. Check back soon!
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((v) => {
            const duration = formatDuration(v.durationSeconds)
            return (
              <Link
                key={v.id}
                href={`/video-library/${v.id}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-grey-mid bg-white transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://img.youtube.com/vi/${v.youtubeVideoId}/hqdefault.jpg`}
                    alt={v.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <PlayCircle
                    className="absolute inset-0 m-auto text-white/90 drop-shadow-lg"
                    size={48}
                  />
                  {duration && (
                    <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 font-mono text-xs text-white">
                      {duration}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  {v.category && (
                    <span className="mb-1 font-display text-[10px] font-bold uppercase tracking-wide text-gold-dark">
                      {v.category}
                    </span>
                  )}
                  <h2 className="font-display text-base font-bold text-charcoal">
                    {v.title}
                  </h2>
                  {v.description && (
                    <p className="mt-1 line-clamp-2 font-body text-sm text-grey-dark">
                      {v.description}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
