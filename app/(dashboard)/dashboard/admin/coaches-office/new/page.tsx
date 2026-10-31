import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CoachPostForm from '@/components/admin/CoachPostForm'

export const dynamic = 'force-dynamic'

export default function NewCoachPostPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-10">
      <Link
        href="/dashboard/admin/coaches-office"
        className="inline-flex items-center gap-1.5 font-body text-sm font-medium text-green transition-colors hover:text-gold-dark"
      >
        <ArrowLeft size={16} />
        Back to all posts
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight text-charcoal">
        New Post
      </h1>
      <div className="mt-8">
        <CoachPostForm />
      </div>
    </div>
  )
}
