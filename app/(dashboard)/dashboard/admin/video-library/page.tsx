import { requireAdmin } from '@/lib/auth/guards'
import VideoLibraryManager from '@/components/admin/VideoLibraryManager'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Video Library | Star Haven Strength' }

export default async function AdminVideoLibraryPage() {
  await requireAdmin()
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
      <VideoLibraryManager />
    </div>
  )
}
