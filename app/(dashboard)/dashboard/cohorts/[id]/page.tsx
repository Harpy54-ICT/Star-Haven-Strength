'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, RefreshCw, Send } from 'lucide-react'

interface Cohort {
  id: string
  name: string
  description: string | null
  durationWeeks: number
  priceCents: number
  maxClients: number | null
  startDate: string | null
  status: string
  enrolledCount: number
  isFull: boolean
  myStatus: string | null
}

interface Post {
  id: string
  content: string
  weekNumber: number | null
  createdAt: string
  user: { id: string; firstName: string | null; lastName: string | null }
}

function authorName(u: Post['user']): string {
  return [u.firstName, u.lastName].filter(Boolean).join(' ') || 'Member'
}

export default function CohortDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const [cohort, setCohort] = useState<Cohort | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [canDiscuss, setCanDiscuss] = useState(true)
  const [draft, setDraft] = useState('')
  const [posting, setPosting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const endRef = useRef<HTMLDivElement | null>(null)

  const loadCohort = useCallback(async () => {
    const res = await fetch(`/api/cohorts/${id}`)
    if (res.ok) {
      const data = await res.json()
      setCohort(data.cohort)
    }
  }, [id])

  const loadPosts = useCallback(async () => {
    const res = await fetch(`/api/cohorts/${id}/discussion`)
    if (res.status === 403) {
      setCanDiscuss(false)
      setPosts([])
      return
    }
    if (res.ok) {
      setCanDiscuss(true)
      const data = await res.json()
      setPosts(data.posts ?? [])
    }
  }, [id])

  useEffect(() => {
    ;(async () => {
      await Promise.all([loadCohort(), loadPosts()])
      setLoading(false)
    })()
  }, [loadCohort, loadPosts])

  // 30-second polling for new discussion posts.
  useEffect(() => {
    if (!canDiscuss) return
    const t = setInterval(() => {
      loadPosts()
    }, 30000)
    return () => clearInterval(t)
  }, [canDiscuss, loadPosts])

  async function refresh() {
    setRefreshing(true)
    await loadPosts()
    setRefreshing(false)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const content = draft.trim()
    if (!content) return
    setPosting(true)
    try {
      const res = await fetch(`/api/cohorts/${id}/discussion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (res.ok) {
        setDraft('')
        await loadPosts()
        endRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    } finally {
      setPosting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-6 font-body text-grey-dark lg:p-8">
        <Loader2 className="animate-spin" size={18} /> Loading…
      </div>
    )
  }

  if (!cohort) {
    return (
      <div className="p-6 lg:p-8">
        <p className="font-body text-grey-dark">Cohort not found.</p>
        <Link
          href="/dashboard/cohorts"
          className="mt-3 inline-block font-body text-sm font-semibold text-green"
        >
          ← Back to cohorts
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <Link
        href="/dashboard/cohorts"
        className="inline-flex items-center gap-1 font-body text-sm font-semibold text-green hover:text-green-light"
      >
        <ArrowLeft size={16} /> All cohorts
      </Link>

      <div className="mt-4 rounded-xl border border-grey-mid bg-white p-6">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal">
            {cohort.name}
          </h1>
          <span className="shrink-0 rounded-full bg-green/10 px-2 py-0.5 font-display text-[10px] font-bold uppercase text-green">
            {cohort.status}
          </span>
        </div>
        {cohort.description && (
          <p className="mt-2 font-body text-sm text-grey-dark">
            {cohort.description}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-grey-dark">
          <span>{cohort.durationWeeks} weeks</span>
          <span>
            {cohort.enrolledCount}
            {cohort.maxClients != null ? `/${cohort.maxClients}` : ''} enrolled
          </span>
          {cohort.startDate && (
            <span>
              Starts {new Date(cohort.startDate).toLocaleDateString()}
            </span>
          )}
          {cohort.myStatus && <span>Your status: {cohort.myStatus}</span>}
        </div>
      </div>

      {/* Discussion */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold uppercase tracking-wide text-charcoal">
            Discussion
          </h2>
          {canDiscuss && (
            <button
              onClick={refresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-grey-mid px-3 py-1.5 font-body text-xs font-semibold text-grey-dark hover:bg-grey-light disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={refreshing ? 'animate-spin' : ''}
              />
              Refresh
            </button>
          )}
        </div>

        {!canDiscuss ? (
          <p className="rounded-xl border border-grey-mid bg-white p-6 text-center font-body text-sm text-grey-dark">
            Enroll in this cohort to view and join the discussion.
          </p>
        ) : (
          <>
            <div className="space-y-3">
              {posts.length === 0 ? (
                <p className="rounded-xl border border-grey-mid bg-white p-6 text-center font-body text-sm text-grey-dark">
                  No posts yet. Start the conversation!
                </p>
              ) : (
                posts.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-grey-mid bg-white p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display text-sm font-bold text-green">
                        {authorName(p.user)}
                      </span>
                      <span className="font-mono text-xs text-grey-dark">
                        {new Date(p.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1.5 whitespace-pre-wrap font-body text-sm text-charcoal">
                      {p.content}
                    </p>
                  </div>
                ))
              )}
              <div ref={endRef} />
            </div>

            <form onSubmit={submit} className="mt-4">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                maxLength={5000}
                placeholder="Share an update or ask a question…"
                className="w-full rounded-xl border border-grey-mid p-3 font-body text-sm text-charcoal focus:border-green focus:outline-none"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={posting || !draft.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-green px-4 py-2 font-body text-sm font-semibold text-white transition-colors hover:bg-green-light disabled:opacity-50"
                >
                  <Send size={16} />
                  {posting ? 'Posting…' : 'Post'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
