import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'

/**
 * Admin-only layout. Non-admins are redirected to the dashboard. Renders a
 * secondary admin breadcrumb nav above the page content.
 */
const ADMIN_LINKS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Overview', href: '/dashboard/admin' },
  { label: 'All Clients', href: '/dashboard/admin/clients' },
  { label: 'Programs', href: '/dashboard/admin/programs' },
  { label: 'Military Verify', href: '/dashboard/admin/military-verify' },
  { label: 'Audit Log', href: '/dashboard/admin/audit-log' },
  { label: "Coach's Office", href: '/dashboard/admin/coaches-office' },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div>
      {/* Admin breadcrumb strip */}
      <nav className="bg-green">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-1 px-4 py-2.5 sm:px-6 lg:px-10">
          <span className="font-display text-xs font-bold uppercase tracking-widest text-gold">
            Admin
          </span>
          {ADMIN_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-body text-xs font-medium text-white/80 transition-colors hover:text-gold"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
      {children}
    </div>
  )
}
