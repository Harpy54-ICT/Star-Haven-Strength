'use client'

import { useCallback, useEffect, useState } from 'react'
import { Bell, MessageSquare, TrendingUp, CheckCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  readAt: string | null
  createdAt: string
}

const ICONS: Record<string, LucideIcon> = {
  message: MessageSquare,
  phase_change: TrendingUp,
  general: Bell,
}

function iconFor(type: string): LucideIcon {
  return ICONS[type] ?? Bell
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.notifications ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id && n.readAt === null
          ? { ...n, readAt: new Date().toISOString() }
          : n
      )
    )
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: id }),
    })
  }

  async function markAllRead() {
    const now = new Date().toISOString()
    setNotifications((prev) =>
      prev.map((n) => (n.readAt === null ? { ...n, readAt: now } : n))
    )
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    })
  }

  const hasUnread = notifications.some((n) => n.readAt === null)

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Bell className="text-gold" size={28} />
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal">
            Notifications
          </h1>
        </div>
        {hasUnread && (
          <button
            type="button"
            onClick={markAllRead}
            className="inline-flex items-center gap-1.5 rounded-lg border border-grey-mid bg-white px-3 py-2 font-body text-sm font-medium text-grey-dark transition-colors hover:bg-grey-light"
          >
            <CheckCheck size={16} />
            Mark All Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl border border-grey-mid bg-white"
            />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border border-grey-mid bg-white p-10 text-center">
          <p className="font-body text-grey-dark">
            You&apos;re all caught up! No notifications.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => {
            const Icon = iconFor(n.type)
            const unread = n.readAt === null
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => unread && markRead(n.id)}
                  className={[
                    'flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors',
                    unread
                      ? 'border-gold/40 bg-gold/10 hover:bg-gold/20'
                      : 'border-grey-mid bg-white hover:bg-grey-light',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'mt-0.5 shrink-0',
                      unread ? 'text-gold-dark' : 'text-grey-dark',
                    ].join(' ')}
                  >
                    <Icon size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={[
                        'font-body text-sm text-charcoal',
                        unread ? 'font-bold' : 'font-medium',
                      ].join(' ')}
                    >
                      {n.title}
                    </p>
                    <p className="mt-0.5 font-body text-sm text-grey-dark">
                      {n.message}
                    </p>
                    <p className="mt-1 font-body text-xs text-grey-dark/70">
                      {formatDate(n.createdAt)}
                    </p>
                  </div>
                  {unread && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
