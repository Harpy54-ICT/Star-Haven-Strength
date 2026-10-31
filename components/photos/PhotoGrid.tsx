'use client'

import { useState } from 'react'
import { X, Trash2, Calendar, Loader2 } from 'lucide-react'

export interface ProgressPhoto {
  id: string
  blobUrl: string
  blobPathname: string
  notes: string | null
  takenAt: string
}

interface PhotoGridProps {
  photos: ProgressPhoto[]
  onDelete: (id: string) => Promise<void>
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function PhotoGrid({ photos, onDelete }: PhotoGridProps) {
  const [active, setActive] = useState<ProgressPhoto | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this photo? This cannot be undone.')) return
    setDeletingId(id)
    try {
      await onDelete(id)
      if (active?.id === id) setActive(null)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="group relative overflow-hidden rounded-xl border border-grey-light bg-grey-light/30"
          >
            <button
              type="button"
              onClick={() => setActive(photo)}
              className="block aspect-[3/4] w-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.blobUrl}
                alt={`Progress photo from ${formatDate(photo.takenAt)}`}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </button>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/80 to-transparent p-2">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-white">
                <Calendar className="h-3 w-3" /> {formatDate(photo.takenAt)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(photo.id)}
              disabled={deletingId === photo.id}
              aria-label="Delete photo"
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-charcoal/60 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
            >
              {deletingId === photo.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/90 p-4"
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setActive(null)}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="max-h-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.blobUrl}
              alt={`Progress photo from ${formatDate(active.takenAt)}`}
              className="mx-auto max-h-[80vh] rounded-xl object-contain"
            />
            <div className="mt-3 text-center text-white">
              <p className="inline-flex items-center gap-1.5 text-sm font-medium">
                <Calendar className="h-4 w-4" /> {formatDate(active.takenAt)}
              </p>
              {active.notes && <p className="mt-1 text-sm text-white/70">{active.notes}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
