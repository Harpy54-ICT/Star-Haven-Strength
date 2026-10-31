import { requireAdmin } from '@/lib/auth/guards'
import CohortProgramsManager from '@/components/admin/CohortProgramsManager'

export const dynamic = 'force-dynamic'

export default async function AdminProgramsPage() {
  await requireAdmin()
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
      <CohortProgramsManager />
    </div>
  )
}
