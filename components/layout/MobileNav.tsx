'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import DashboardSidebar, {
  type SidebarUser,
} from '@/components/layout/DashboardSidebar'

interface MobileNavProps {
  user: SidebarUser
}

/**
 * Mobile top bar with a hamburger that opens a slide-out drawer containing the
 * dashboard sidebar. Hidden on large screens (where the fixed sidebar shows).
 */
export default function MobileNav({ user }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-grey-mid bg-green-dark px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Star Haven Strength"
            width={32}
            height={40}
            className="h-8 w-auto"
          />
          <span className="font-display text-base font-bold uppercase tracking-wider text-gold">
            Star Haven
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="rounded-lg p-1.5 text-white hover:bg-white/10"
        >
          <Menu size={24} />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-charcoal/60"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] shadow-xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 z-10 rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <X size={22} />
            </button>
            <DashboardSidebar user={user} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
