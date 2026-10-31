import { requireAdmin } from '@/lib/auth/guards'
import AffiliatesManager from '@/components/admin/AffiliatesManager'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Affiliates | Star Haven Strength' }

export default async function AdminAffiliatesPage() {
  await requireAdmin()
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
      <AffiliatesManager />
    </div>
  )
}
