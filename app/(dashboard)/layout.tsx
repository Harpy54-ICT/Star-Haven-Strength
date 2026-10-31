import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db/client'
import DashboardSidebar, {
  type SidebarUser,
} from '@/components/layout/DashboardSidebar'
import MobileNav from '@/components/layout/MobileNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/dashboard')
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { firstName: true, lastName: true, email: true, image: true },
  })

  const sidebarUser: SidebarUser = {
    name:
      [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
      user?.email ||
      'Member',
    email: user?.email ?? '',
    image: user?.image ?? null,
  }

  return (
    <div className="min-h-screen bg-grey-light">
      {/* Fixed sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <DashboardSidebar user={sidebarUser} />
      </aside>

      {/* Mobile top bar + drawer */}
      <MobileNav user={sidebarUser} />

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  )
}
