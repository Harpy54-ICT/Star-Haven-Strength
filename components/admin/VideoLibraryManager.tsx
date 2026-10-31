'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, Plus, X } from 'lucide-react'

interface VideoItem {
  id: string
  title: string
  description: string | null
  youtubeVideoId: string
  category: string | null
  tags: string[]
  durationSeconds: number | null
}

interface FormState {
  id?: string
  title: string
  description: string
  youtubeVideoId: string
  category: string
  tags: string
  durationSeconds: string
}

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  youtubeVideoId: '',
  category: '',
  tags: '',
  durationSeconds: '',
}

export default function VideoLibraryManager() {
  const [items, setItems] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<FormState | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/video-library')
    if (res.ok) {
      const data = await res.json()
      setItems(data.items ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function startCreate() {
    setForm({ ...EMPTY_FORM })
  }

  function startEdit(v: VideoItem) {
    setForm({
      id: v.id,
      title: v.title,
      description: v.description ?? '',
      youtubeVideoId: v.youtubeVideoId,
      category: v.category ?? '',
      tags: v.tags.join(', '),
      durationSeconds: v.durationSeconds != null ? String(v.durationSeconds) : '',
    })
  }

  async function save() {
    if (!form) return
    setSaving(true)
    try {
      const body = {
        title: form.title,
        description: form.description || null,
        youtubeVideoId: form.youtubeVideoId.trim(),
        category: form.category || null,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        durationSeconds: form.durationSeconds
          ? Number(form.durationSeconds)
          : null,
      }
      const res = form.id
        ? await fetch(`/api/admin/video-library/${form.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
        : await fetch('/api/admin/video-library', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
      if (res.ok) {
        setForm(null)
        await load()
      }
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this video? This cannot be undone.')) return
    const res = await fetch(`/api/admin/video-library/${id}`, {
      method: 'DELETE',
    })
    if (res.ok) await load()
  }

  const inputClass =
    'w-full rounded-lg border border-grey-mid px-3 py-2 font-body text-sm text-charcoal focus:border-green focus:outline-none'

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-green">
          Video Library
        </h1>
        <button
          onClick={startCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-green px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-gold hover:bg-green-light"
        >
          <Plus size={16} /> New Video
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 font-body text-grey-dark">
          <Loader2 className="animate-spin" size={18} /> Loading…
        </div>
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-grey-mid bg-white p-6 font-body text-sm text-grey-dark">
          No videos yet. Add your first one.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-grey-mid bg-white">
          <table className="w-full min-w-[680px] text-left">
            <thead className="border-b border-grey-mid bg-grey-light">
              <tr className="font-display text-xs uppercase tracking-wide text-grey-dark">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Video ID</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-grey-mid font-body text-sm text-charcoal">
              {items.map((v) => (
                <tr key={v.id}>
                  <td className="px-4 py-3 font-semibold">{v.title}</td>
                  <td className="px-4 py-3">{v.category ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {v.youtubeVideoId}
                  </td>
                  <td className="px-4 py-3 text-xs text-grey-dark">
                    {v.tags.length > 0 ? v.tags.join(', ') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => startEdit(v)}
                        className="rounded-md border border-grey-mid px-2.5 py-1.5 text-xs font-semibold text-green hover:bg-grey-light"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(v.id)}
                        className="rounded-md border border-grey-mid px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-grey-light"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-green">
                {form.id ? 'Edit Video' : 'New Video'}
              </h2>
              <button onClick={() => setForm(null)} aria-label="Close">
                <X size={20} className="text-grey-dark" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="font-body text-xs text-grey-dark">Title</label>
                <input
                  className={inputClass}
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => (f ? { ...f, title: e.target.value } : f))
                  }
                />
              </div>
              <div>
                <label className="font-body text-xs text-grey-dark">
                  Description
                </label>
                <textarea
                  className={inputClass}
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) =>
                      f ? { ...f, description: e.target.value } : f
                    )
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-body text-xs text-grey-dark">
                    YouTube Video ID
                  </label>
                  <input
                    className={inputClass}
                    placeholder="e.g. dQw4w9WgXcQ"
                    value={form.youtubeVideoId}
                    onChange={(e) =>
                      setForm((f) =>
                        f ? { ...f, youtubeVideoId: e.target.value } : f
                      )
                    }
                  />
                </div>
                <div>
                  <label className="font-body text-xs text-grey-dark">
                    Category
                  </label>
                  <input
                    className={inputClass}
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) =>
                        f ? { ...f, category: e.target.value } : f
                      )
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-body text-xs text-grey-dark">
                    Tags (comma-separated)
                  </label>
                  <input
                    className={inputClass}
                    placeholder="form, squat, beginner"
                    value={form.tags}
                    onChange={(e) =>
                      setForm((f) => (f ? { ...f, tags: e.target.value } : f))
                    }
                  />
                </div>
                <div>
                  <label className="font-body text-xs text-grey-dark">
                    Duration (seconds, optional)
                  </label>
                  <input
                    type="number"
                    className={inputClass}
                    value={form.durationSeconds}
                    onChange={(e) =>
                      setForm((f) =>
                        f ? { ...f, durationSeconds: e.target.value } : f
                      )
                    }
                  />
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setForm(null)}
                className="rounded-lg border border-grey-mid px-4 py-2 font-body text-sm font-semibold text-charcoal hover:bg-grey-light"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving || !form.title.trim() || !form.youtubeVideoId.trim()}
                className="rounded-lg bg-green px-4 py-2 font-body text-sm font-semibold text-gold hover:bg-green-light disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
