'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LogOut, Shield } from 'lucide-react'
import { NAV_ITEMS } from '@/components/layout/nav-items'
import NotificationBadge from '@/components/layout/NotificationBadge'

export interface SidebarUser {
  name: string
  email: string
  image?: string | null
  role?: 'admin' | 'client'
}

interface DashboardSidebarProps {
  user: SidebarUser
  /** Called after a nav link is clicked — used to close the mobile drawer. */
  onNavigate?: () => void
}

function isActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function DashboardSidebar({
  user,
  onNavigate,
}: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-green-dark">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-6">
        <Image
          src="/logo.png"
          alt="Star Haven Strength"
          width={40}
          height={50}
          className="h-10 w-auto"
        />
        <span className="font-display text-lg font-bold uppercase tracking-wider text-gold">
          Star Haven
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href)
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 font-body text-sm font-medium transition-colors',
                    active
                      ? 'bg-green text-gold'
                      : 'text-white/80 hover:bg-green-light/40 hover:text-white',
                  ].join(' ')}
                >
                  <span className="relative shrink-0">
                    <Icon size={19} className="shrink-0" />
                    {item.href === '/dashboard/notifications' && (
                      <NotificationBadge />
                    )}
                  </span>
                  {item.label}
                </Link>
              </li>
            )
          })}

          {user.role === 'admin' && (
            <li>
              <Link
                href="/dashboard/admin"
                onClick={onNavigate}
                aria-current={
                  isActive(pathname, '/dashboard/admin') ? 'page' : undefined
                }
                className={[
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 font-body text-sm font-medium transition-colors',
                  isActive(pathname, '/dashboard/admin')
                    ? 'bg-green text-gold'
                    : 'text-gold/90 hover:bg-green-light/40 hover:text-gold',
                ].join(' ')}
              >
                <Shield size={19} className="shrink-0" />
                Admin Panel
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* User + sign out */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gold font-display text-sm font-bold text-charcoal">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              (user.name?.[0] ?? 'U').toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-body text-sm font-semibold text-white">
              {user.name}
            </p>
            <p className="truncate font-body text-xs text-white/60">
              {user.email}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2 font-body text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  )
}
