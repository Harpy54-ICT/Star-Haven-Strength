'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Camera,
  Upload,
  Loader2,
  Lock,
  ArrowLeft,
  Grid3x3,
  ArrowLeftRight,
  ImageIcon,
} from 'lucide-react'
import { PhotoGrid, type ProgressPhoto } from '@/components/photos/PhotoGrid'
import { ComparisonView } from '@/components/photos/ComparisonView'

type View = 'grid' | 'compare'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function ProgressPhotosPage() {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>('grid')

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [takenAt, setTakenAt] = useState(todayISO())
  const [notes, setNotes] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/logs/progress-photos')
      if (res.ok) {
        const data = await res.json()
        setPhotos(data.photos || [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const selectFile = (f: File | null) => {
    setError(null)
    if (!f) return
    if (!f.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    setFile(f)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(URL.createObjectURL(f))
  }

  const upload = async () => {
    if (!file) {
      setError('Choose a photo to upload.')
      return
    }
    setError(null)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('takenAt', takenAt)
      if (notes.trim()) fd.append('notes', notes.trim())
      const res = await fetch('/api/logs/progress-photos', { method: 'POST', body: fd })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Upload failed')
      }
      // reset form
      setFile(null)
      if (preview) URL.revokeObjectURL(preview)
      setPreview(null)
      setNotes('')
      setTakenAt(todayISO())
      if (inputRef.current) inputRef.current.value = ''
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setUploading(false)
    }
  }

  const remove = async (id: string) => {
    const res = await fetch(`/api/logs/progress-photos?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      setPhotos((prev) => prev.filter((p) => p.id !== id))
    }
  }

  return (
    <div className="mx-auto max-w-5xl pb-20">
      <Link
        href="/dashboard/body-metrics"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-grey-mid hover:text-green"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Body Metrics
      </Link>

      <div className="mb-2 flex items-center gap-2">
        <Camera className="h-6 w-6 text-green" />
        <h1 className="font-display text-2xl font-bold text-charcoal">Progress Photos</h1>
      </div>
      <div className="mb-6 inline-flex items-center gap-1.5 rounded-lg bg-green/10 px-3 py-1.5 text-xs font-medium text-green-dark">
        <Lock className="h-3.5 w-3.5" />
        Your photos are private — only you and your coach can see them.
      </div>

      {/* Upload section */}
      <div className="mb-8 grid gap-4 rounded-xl border border-grey-light bg-white p-5 shadow-sm sm:grid-cols-[1fr_1.2fr]">
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            selectFile(e.dataTransfer.files?.[0] ?? null)
          }}
          onClick={() => inputRef.current?.click()}
          className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-colors ${
            dragging ? 'border-green bg-green/5' : 'border-grey-light hover:border-green'
          }`}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Preview" className="max-h-56 rounded-lg object-contain" />
          ) : (
            <>
              <ImageIcon className="mb-2 h-10 w-10 text-grey-mid" />
              <p className="text-sm font-medium text-charcoal">Drag &amp; drop a photo</p>
              <p className="text-xs text-grey-mid">or click to browse</p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => selectFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Date taken</label>
            <input
              type="date"
              value={takenAt}
              max={todayISO()}
              onChange={(e) => setTakenAt(e.target.value)}
              className="w-full rounded-lg border border-grey-light px-3 py-2.5 text-sm text-charcoal focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Front / side / back, lighting, etc."
              className="w-full rounded-lg border border-grey-light px-3 py-2 text-sm text-charcoal focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
            />
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <button
            type="button"
            onClick={upload}
            disabled={uploading || !file}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-dark disabled:opacity-60"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload Photo
          </button>
        </div>
      </div>

      {/* View toggle */}
      <div className="mb-5 inline-flex rounded-lg border border-grey-light bg-white p-1">
        <button
          type="button"
          onClick={() => setView('grid')}
          className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
            view === 'grid' ? 'bg-green text-white' : 'text-grey-mid hover:text-charcoal'
          }`}
        >
          <Grid3x3 className="h-4 w-4" /> Gallery
        </button>
        <button
          type="button"
          onClick={() => setView('compare')}
          className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
            view === 'compare' ? 'bg-green text-white' : 'text-grey-mid hover:text-charcoal'
          }`}
        >
          <ArrowLeftRight className="h-4 w-4" /> Compare
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-green" />
        </div>
      ) : photos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-grey-light bg-grey-light/20 p-12 text-center">
          <Camera className="mx-auto mb-3 h-10 w-10 text-grey-mid" />
          <h3 className="font-display text-lg font-semibold text-charcoal">No photos yet</h3>
          <p className="mt-1 text-sm text-grey-mid">
            Upload your first progress photo to start tracking visual changes over time.
          </p>
        </div>
      ) : view === 'grid' ? (
        <PhotoGrid photos={photos} onDelete={remove} />
      ) : (
        <ComparisonView photos={photos} />
      )}
    </div>
  )
}
