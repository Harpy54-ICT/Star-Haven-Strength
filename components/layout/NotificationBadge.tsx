'use client'

import { useEffect, useState } from 'react'

/**
 * Small red unread-count badge rendered over the Notifications nav icon.
 * Fetches the unread count on mount; renders nothing when there are none.
 */
export default function NotificationBadge() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/notifications')
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) setCount(data.unreadCount ?? 0)
      } catch {
        /* ignore */
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  if (count <= 0) return null

  return (
    <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-600 px-1 font-body text-[10px] font-bold leading-none text-white">
      {count > 9 ? '9+' : count}
    </span>
  )
}
