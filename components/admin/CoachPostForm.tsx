'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { slugify } from '@/lib/utils/slug'
import { COACH_POST_TYPES, type CoachPostTypeValue } from '@/lib/coach/post-types'

export interface CoachPostFormValues {
  id?: string
  title: string
  slug: string
  postType: CoachPostTypeValue
  excerpt: string
  content: string
  sourceTitle: string
  sourceUrl: string
  sourceAuthors: string
  publishedYear: string
  tags: string
  status: 'draft' | 'published'
}

const EMPTY: CoachPostFormValues = {
  title: '',
  slug: '',
  postType: 'commentary',
  excerpt: '',
  content: '',
  sourceTitle: '',
  sourceUrl: '',
  sourceAuthors: '',
  publishedYear: '',
  tags: '',
  status: 'draft',
}

const inputClass =
  'w-full rounded-lg border border-grey-mid bg-white px-3 py-2 font-body text-sm text-charcoal focus:border-green focus:outline-none focus:ring-1 focus:ring-green'
const labelClass =
  'block font-display text-xs font-bold uppercase tracking-wide text-grey-dark'

export default function CoachPostForm({
  initial,
}: {
  initial?: Partial<CoachPostFormValues>
}) {
  const router = useRouter()
  const isEdit = !!initial?.id
  const [values, setValues] = useState<CoachPostFormValues>({
    ...EMPTY,
    ...initial,
  })
  // Track whether the user has manually edited the slug; until then, auto-sync
  // the slug from the title.
  const [slugTouched, setSlugTouched] = useState<boolean>(
    !!initial?.slug && initial.slug.length > 0
  )
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof CoachPostFormValues>(
    key: K,
    value: CoachPostFormValues[K]
  ) => setValues((v) => ({ ...v, [key]: value }))

  const onTitleChange = (title: string) => {
    setValues((v) => ({
      ...v,
      title,
      slug: slugTouched ? v.slug : slugify(title),
    }))
  }

  async function submit(status: 'draft' | 'published') {
    setError(null)
    if (!values.title.trim()) return setError('Title is required.')
    if (!values.content.trim()) return setError('Content is required.')

    setSaving(true)
    const payload = {
      title: values.title.trim(),
      slug: values.slug.trim() || undefined,
      postType: values.postType,
      content: values.content,
      excerpt: values.excerpt.trim() || null,
      sourceTitle: values.sourceTitle.trim() || null,
      sourceUrl: values.sourceUrl.trim() || null,
      sourceAuthors: values.sourceAuthors.trim() || null,
      publishedYear: values.publishedYear
        ? Number(values.publishedYear)
        : null,
      tags: values.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      status,
    }

    try {
      const url = isEdit
        ? `/api/admin/coach-posts/${initial!.id}`
        : '/api/admin/coach-posts'
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Failed to save post.')
      }
      router.push('/dashboard/admin/coaches-office')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save post.')
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit(values.status)
      }}
      className="space-y-6"
    >
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 font-body text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className={labelClass} htmlFor="title">
          Title
        </label>
        <input
          id="title"
          className={`${inputClass} mt-1`}
          value={values.title}
          onChange={(e) => onTitleChange(e.target.value)}
          maxLength={200}
          required
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="slug">
          Slug
        </label>
        <input
          id="slug"
          className={`${inputClass} mt-1 font-mono`}
          value={values.slug}
          onChange={(e) => {
            setSlugTouched(true)
            set('slug', slugify(e.target.value))
          }}
          placeholder="auto-generated-from-title"
          maxLength={80}
        />
        <p className="mt-1 font-body text-xs text-grey-dark">
          URL: /coaches-office/{values.slug || 'auto-generated'}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="postType">
            Type
          </label>
          <select
            id="postType"
            className={`${inputClass} mt-1`}
            value={values.postType}
            onChange={(e) =>
              set('postType', e.target.value as CoachPostTypeValue)
            }
          >
            {COACH_POST_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="tags">
            Tags (comma-separated)
          </label>
          <input
            id="tags"
            className={`${inputClass} mt-1`}
            value={values.tags}
            onChange={(e) => set('tags', e.target.value)}
            placeholder="strength, recovery, nutrition"
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="excerpt">
          Excerpt / Summary
        </label>
        <textarea
          id="excerpt"
          className={`${inputClass} mt-1`}
          rows={2}
          value={values.excerpt}
          onChange={(e) => set('excerpt', e.target.value)}
          maxLength={500}
          placeholder="A short teaser shown in the list view."
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="content">
          Body
        </label>
        <textarea
          id="content"
          className={`${inputClass} mt-1 font-body`}
          rows={14}
          value={values.content}
          onChange={(e) => set('content', e.target.value)}
          placeholder="Write the post here. Separate paragraphs with a blank line."
          required
        />
        <p className="mt-1 font-body text-xs text-grey-dark">
          Plain text. Separate paragraphs with a blank line.
        </p>
      </div>

      <fieldset className="rounded-xl border border-grey-mid p-4">
        <legend className="px-2 font-display text-xs font-bold uppercase tracking-wide text-gold-dark">
          Source / Citation (optional)
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="sourceTitle">
              Source title
            </label>
            <input
              id="sourceTitle"
              className={`${inputClass} mt-1`}
              value={values.sourceTitle}
              onChange={(e) => set('sourceTitle', e.target.value)}
              maxLength={300}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="sourceAuthors">
              Authors
            </label>
            <input
              id="sourceAuthors"
              className={`${inputClass} mt-1`}
              value={values.sourceAuthors}
              onChange={(e) => set('sourceAuthors', e.target.value)}
              maxLength={300}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="sourceUrl">
              Source URL
            </label>
            <input
              id="sourceUrl"
              type="url"
              className={`${inputClass} mt-1`}
              value={values.sourceUrl}
              onChange={(e) => set('sourceUrl', e.target.value)}
              placeholder="https://…"
              maxLength={500}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="publishedYear">
              Published year
            </label>
            <input
              id="publishedYear"
              type="number"
              className={`${inputClass} mt-1`}
              value={values.publishedYear}
              onChange={(e) => set('publishedYear', e.target.value)}
              min={1900}
              max={2100}
            />
          </div>
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3 border-t border-grey-mid pt-6">
        <button
          type="button"
          disabled={saving}
          onClick={() => submit('draft')}
          className="rounded-lg border border-green px-5 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-green transition-colors hover:bg-green hover:text-white disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save as Draft'}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => submit('published')}
          className="rounded-lg bg-gold px-5 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-charcoal transition-colors hover:bg-gold-dark disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Publish'}
        </button>
      </div>
    </form>
  )
}
