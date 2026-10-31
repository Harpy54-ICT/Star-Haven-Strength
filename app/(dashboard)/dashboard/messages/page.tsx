'use client'

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useSearchParams } from 'next/navigation'
import { Send, MessageSquare } from 'lucide-react'

interface Sender {
  id: string
  firstName: string | null
  lastName: string | null
  image: string | null
}

interface Message {
  id: string
  senderId: string
  recipientId: string
  content: string
  readAt: string | null
  createdAt: string
  sender: Sender | null
}

interface Conversation {
  client: {
    id: string
    firstName: string | null
    lastName: string | null
    image: string | null
  }
  lastMessage: { content: string; createdAt: string; readAt: string | null }
  unreadCount: number
}

function nameOf(
  first: string | null | undefined,
  last: string | null | undefined
): string {
  return [first, last].filter(Boolean).join(' ') || 'Member'
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function MessagesInner() {
  const searchParams = useSearchParams()
  const toParam = searchParams.get('to')

  const [role, setRole] = useState<'admin' | 'client' | null>(null)
  const [selfId, setSelfId] = useState<string | null>(null)

  // Admin: list of conversations.
  const [conversations, setConversations] = useState<Conversation[]>([])
  // The other party of the active thread.
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingThread, setLoadingThread] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)

  // Load profile (role + id), then bootstrap the correct view.
  useEffect(() => {
    let cancelled = false
    async function init() {
      try {
        const res = await fetch('/api/user/profile')
        if (!res.ok) return
        const { user } = await res.json()
        if (cancelled) return
        setRole(user.role)
        setSelfId(user.id)

        if (user.role === 'admin') {
          // Pre-select a client if ?to= is provided.
          if (toParam) setActiveId(toParam)
        } else {
          // Client: resolve the coach and open that thread.
          const adminRes = await fetch('/api/messages/admin-id')
          if (adminRes.ok) {
            const { adminId } = await adminRes.json()
            if (!cancelled && adminId) setActiveId(adminId)
          }
        }
      } catch {
        /* ignore */
      }
    }
    void init()
    return () => {
      cancelled = true
    }
  }, [toParam])

  const loadConversations = useCallback(async () => {
    const res = await fetch('/api/messages/conversations')
    if (!res.ok) return
    const data = await res.json()
    setConversations(data.conversations ?? [])
  }, [])

  const loadThread = useCallback(
    async (withId: string, showSpinner = false) => {
      if (showSpinner) setLoadingThread(true)
      try {
        const res = await fetch(
          `/api/messages?with=${encodeURIComponent(withId)}`
        )
        if (!res.ok) {
          const d = await res.json().catch(() => ({}))
          setError(d.error ?? 'Failed to load messages')
          return
        }
        setError(null)
        const data = await res.json()
        const msgs: Message[] = data.messages ?? []
        setMessages(msgs)
        // Mark unread inbound messages as read.
        const unread = msgs.filter(
          (m) => m.recipientId === selfId && m.readAt === null
        )
        await Promise.all(
          unread.map((m) =>
            fetch(`/api/messages/${m.id}/read`, { method: 'PATCH' })
          )
        )
      } finally {
        if (showSpinner) setLoadingThread(false)
      }
    },
    [selfId]
  )

  // Admin: load conversation list (and poll).
  useEffect(() => {
    if (role !== 'admin') return
    void loadConversations()
    const t = setInterval(() => void loadConversations(), 30000)
    return () => clearInterval(t)
  }, [role, loadConversations])

  // Load + poll the active thread.
  useEffect(() => {
    if (!activeId || !selfId) return
    void loadThread(activeId, true)
    const t = setInterval(() => void loadThread(activeId), 30000)
    return () => clearInterval(t)
  }, [activeId, selfId, loadThread])

  // Auto-scroll on new messages.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const activeConversation = useMemo(
    () => conversations.find((c) => c.client.id === activeId) ?? null,
    [conversations, activeId]
  )

  async function send() {
    const content = draft.trim()
    if (!content || sending) return
    if (role === 'admin' && !activeId) return
    setSending(true)
    setError(null)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: activeId ?? '',
          content,
        }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error ?? 'Failed to send')
      }
      const { message } = await res.json()
      setMessages((prev) => [...prev, message])
      setDraft('')
      if (role === 'admin') void loadConversations()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send')
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send()
    }
  }

  const headerTitle =
    role === 'admin'
      ? activeConversation
        ? nameOf(
            activeConversation.client.firstName,
            activeConversation.client.lastName
          )
        : activeId
          ? 'Conversation'
          : 'Select a conversation'
      : 'Your Coach'

  return (
    <div className="flex h-[calc(100vh-0px)] flex-col p-4 lg:h-screen lg:p-6">
      <div className="mb-4 flex items-center gap-3">
        <MessageSquare className="text-gold" size={26} />
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal">
          Messages
        </h1>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden rounded-xl border border-grey-mid bg-white">
        {/* Admin conversation list */}
        {role === 'admin' && (
          <aside className="hidden w-72 shrink-0 flex-col border-r border-grey-mid md:flex">
            <div className="border-b border-grey-mid px-4 py-3 font-display text-sm font-bold uppercase tracking-wide text-grey-dark">
              Conversations
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <p className="p-4 font-body text-sm text-grey-dark">
                  No conversations yet.
                </p>
              ) : (
                conversations.map((c) => {
                  const active = c.client.id === activeId
                  return (
                    <button
                      key={c.client.id}
                      type="button"
                      onClick={() => setActiveId(c.client.id)}
                      className={[
                        'flex w-full items-center gap-3 border-b border-grey-mid px-4 py-3 text-left transition-colors',
                        active ? 'bg-green/10' : 'hover:bg-grey-light',
                      ].join(' ')}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold font-display text-sm font-bold text-charcoal">
                        {nameOf(c.client.firstName, c.client.lastName)[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-body text-sm font-semibold text-charcoal">
                          {nameOf(c.client.firstName, c.client.lastName)}
                        </p>
                        <p className="truncate font-body text-xs text-grey-dark">
                          {c.lastMessage.content}
                        </p>
                      </div>
                      {c.unreadCount > 0 && (
                        <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1 font-body text-xs font-bold text-white">
                          {c.unreadCount}
                        </span>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </aside>
        )}

        {/* Thread */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-b border-grey-mid px-5 py-3 font-display text-base font-bold text-charcoal">
            {headerTitle}
          </div>

          <div className="flex-1 overflow-y-auto bg-grey-light px-4 py-4">
            {loadingThread ? (
              <p className="text-center font-body text-sm text-grey-dark">
                Loading…
              </p>
            ) : role === 'admin' && !activeId ? (
              <p className="mt-8 text-center font-body text-sm text-grey-dark">
                Select a conversation to view messages.
              </p>
            ) : messages.length === 0 ? (
              <p className="mt-8 text-center font-body text-sm text-grey-dark">
                No messages yet. Say hello!
              </p>
            ) : (
              <div className="space-y-3">
                {messages.map((m) => {
                  const mine = m.senderId === selfId
                  return (
                    <div
                      key={m.id}
                      className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={[
                          'max-w-[75%] rounded-2xl px-4 py-2',
                          mine
                            ? 'bg-green text-white'
                            : 'border border-grey-mid bg-white text-charcoal',
                        ].join(' ')}
                      >
                        <p className="whitespace-pre-wrap break-words font-body text-sm">
                          {m.content}
                        </p>
                        <p
                          className={[
                            'mt-1 font-body text-[10px]',
                            mine ? 'text-white/70' : 'text-grey-dark/70',
                          ].join(' ')}
                        >
                          {formatTime(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Composer */}
          {(role === 'client' || (role === 'admin' && activeId)) && (
            <div className="border-t border-grey-mid p-3">
              {error && (
                <p className="mb-2 font-body text-xs text-red-600">{error}</p>
              )}
              <div className="flex items-end gap-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value.slice(0, 2000))}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  maxLength={2000}
                  placeholder="Type a message…"
                  className="flex-1 resize-none rounded-lg border border-grey-mid px-3 py-2 font-body text-sm text-charcoal focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={sending || draft.trim().length === 0}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-green px-4 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-green-dark disabled:opacity-50"
                >
                  <Send size={16} />
                  Send
                </button>
              </div>
              <p className="mt-1 text-right font-body text-[10px] text-grey-dark/60">
                {draft.length}/2000
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 font-body text-grey-dark">Loading messages…</div>
      }
    >
      <MessagesInner />
    </Suspense>
  )
}
