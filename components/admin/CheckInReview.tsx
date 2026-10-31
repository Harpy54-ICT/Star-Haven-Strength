'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react'

interface CheckIn {
  id: string
  weekStart: string
  createdAt: string
  mood: number | null
  energy: number | null
  sleepHours: number | null
  sleepQuality: number | null
  stress: number | null
  soreness: number | null
  wentWell: string | null
  challenging: string | null
  nextWeekFocus: string | null
  coachNotes: string | null
  user: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
  }
}

function fullName(u: CheckIn['user']): string {
  return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email
}

function metric(label: string, value: number | null) {
  if (value == null) return null
  return (
    <span className="font-mono text-xs text-grey-dark">
      {label} {value}
    </span>
  )
}

export default function CheckInReview() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [replyId, setReplyId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/check-ins?page=${p}`)
      if (res.ok) {
        const data = await res.json()
        setCheckIns(data.checkIns ?? [])
        setTotalPages(data.totalPages ?? 1)
        setPage(data.page ?? p)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(1)
  }, [load])

  function openReply(c: CheckIn) {
    setReplyId(c.id)
    setDraft(c.coachNotes ?? '')
  }

  async function sendReply() {
    if (!replyId || !draft.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/check-ins/${replyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coachNotes: draft.trim() }),
      })
      if (res.ok) {
        setReplyId(null)
        setDraft('')
        await load(page)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 font-body text-grey-dark">
        <Loader2 className="animate-spin" size={18} /> Loading…
      </div>
    )
  }

  return (
    <div>
      {checkIns.length === 0 ? (
        <p className="rounded-xl border border-grey-mid bg-white p-6 font-body text-sm text-grey-dark">
          No check-ins submitted yet.
        </p>
      ) : (
        <div className="space-y-4">
          {checkIns.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-grey-mid bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-display text-sm font-bold uppercase tracking-wide text-green">
                    {fullName(c.user)}
                  </p>
                  <p className="font-mono text-xs text-grey-dark">
                    Week of {new Date(c.weekStart).toLocaleDateString()} ·
                    submitted {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => openReply(c)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-grey-mid px-3 py-1.5 font-body text-xs font-semibold text-green hover:bg-grey-light"
                >
                  <MessageSquare size={14} />
                  {c.coachNotes ? 'Edit Feedback' : 'Reply'}
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                {metric('Mood', c.mood)}
                {metric('Energy', c.energy)}
                {metric('Sleep hrs', c.sleepHours)}
                {metric('Sleep qual', c.sleepQuality)}
                {metric('Stress', c.stress)}
                {metric('Soreness', c.soreness)}
              </div>

              {(c.wentWell || c.challenging || c.nextWeekFocus) && (
                <div className="mt-3 space-y-1.5 font-body text-sm text-charcoal">
                  {c.wentWell && (
                    <p>
                      <span className="font-semibold">Went well:</span>{' '}
                      {c.wentWell}
                    </p>
                  )}
                  {c.challenging && (
                    <p>
                      <span className="font-semibold">Challenging:</span>{' '}
                      {c.challenging}
                    </p>
                  )}
                  {c.nextWeekFocus && (
                    <p>
                      <span className="font-semibold">Next-week focus:</span>{' '}
                      {c.nextWeekFocus}
                    </p>
                  )}
                </div>
              )}

              {c.coachNotes && replyId !== c.id && (
                <div className="mt-3 rounded-lg border border-green/30 bg-green/5 p-3">
                  <p className="font-display text-[10px] font-bold uppercase tracking-wide text-green">
                    Coach Feedback
                  </p>
                  <p className="mt-1 font-body text-sm text-charcoal">
                    {c.coachNotes}
                  </p>
                </div>
              )}

              {replyId === c.id && (
                <div className="mt-3">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={3}
                    maxLength={5000}
                    placeholder="Write feedback for this client…"
                    className="w-full rounded-lg border border-grey-mid p-3 font-body text-sm text-charcoal focus:border-green focus:outline-none"
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      onClick={() => setReplyId(null)}
                      className="rounded-lg border border-grey-mid px-4 py-2 font-body text-sm font-semibold text-charcoal hover:bg-grey-light"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={sendReply}
                      disabled={saving || !draft.trim()}
                      className="rounded-lg bg-green px-4 py-2 font-body text-sm font-semibold text-gold hover:bg-green-light disabled:opacity-50"
                    >
                      {saving ? 'Sending…' : 'Send Feedback'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => load(page - 1)}
            disabled={page <= 1}
            className="inline-flex items-center gap-1 rounded-lg border border-grey-mid px-3 py-2 font-body text-sm font-semibold text-charcoal disabled:opacity-40"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <span className="font-mono text-sm text-grey-dark">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => load(page + 1)}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1 rounded-lg border border-grey-mid px-3 py-2 font-body text-sm font-semibold text-charcoal disabled:opacity-40"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
