'use client'

import { useState } from 'react'
import { ArrowLeftRight } from 'lucide-react'
import type { ProgressPhoto } from './PhotoGrid'

interface ComparisonViewProps {
  photos: ProgressPhoto[]
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function PhotoPane({
  photos,
  selectedId,
  onSelect,
  label,
}: {
  photos: ProgressPhoto[]
  selectedId: string
  onSelect: (id: string) => void
  label: string
}) {
  const photo = photos.find((p) => p.id === selectedId)
  return (
    <div className="flex-1">
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-grey-mid">
        {label}
      </label>
      <select
        value={selectedId}
        onChange={(e) => onSelect(e.target.value)}
        className="mb-3 w-full rounded-lg border border-grey-light px-3 py-2 text-sm text-charcoal focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
      >
        {photos.map((p) => (
          <option key={p.id} value={p.id}>
            {formatDate(p.takenAt)}
          </option>
        ))}
      </select>
      <div className="overflow-hidden rounded-xl border border-grey-light bg-grey-light/30">
        {photo ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.blobUrl}
              alt={`Progress photo from ${formatDate(photo.takenAt)}`}
              className="aspect-[3/4] w-full object-cover"
            />
            <div className="p-2 text-center">
              <span className="text-xs font-medium text-charcoal">{formatDate(photo.takenAt)}</span>
              {photo.notes && <p className="mt-0.5 text-xs text-grey-mid">{photo.notes}</p>}
            </div>
          </>
        ) : (
          <div className="flex aspect-[3/4] items-center justify-center text-sm text-grey-mid">
            No photo
          </div>
        )}
      </div>
    </div>
  )
}

export function ComparisonView({ photos }: ComparisonViewProps) {
  // Default: oldest on the left, newest on the right. photos are desc by date.
  const [leftId, setLeftId] = useState(photos[photos.length - 1]?.id ?? '')
  const [rightId, setRightId] = useState(photos[0]?.id ?? '')

  if (photos.length < 2) {
    return (
      <div className="rounded-xl border border-dashed border-grey-light bg-grey-light/20 p-10 text-center">
        <ArrowLeftRight className="mx-auto mb-3 h-8 w-8 text-grey-mid" />
        <p className="text-sm text-grey-mid">
          Upload at least two photos to compare your progress side by side.
        </p>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-4">
      <PhotoPane photos={photos} selectedId={leftId} onSelect={setLeftId} label="Before" />
      <div className="hidden pt-16 sm:block">
        <ArrowLeftRight className="h-6 w-6 text-grey-mid" />
      </div>
      <PhotoPane photos={photos} selectedId={rightId} onSelect={setRightId} label="After" />
    </div>
  )
}
