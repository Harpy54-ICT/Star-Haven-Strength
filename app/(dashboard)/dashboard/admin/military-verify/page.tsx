import { db } from '@/lib/db/client'
import { requireAdmin } from '@/lib/auth/guards'
import { ShieldCheck, FileText } from 'lucide-react'
import VerificationActions from '@/components/admin/VerificationActions'

export const dynamic = 'force-dynamic'

function fullName(firstName: string | null, lastName: string | null): string {
  return [firstName, lastName].filter(Boolean).join(' ') || 'Unknown member'
}

export default async function MilitaryVerifyPage() {
  await requireAdmin()

  const pending = await db.militaryVerification.findMany({
    where: { status: 'pending' },
    orderBy: { submittedAt: 'asc' },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          accountType: true,
          militaryBranch: true,
        },
      },
    },
  })

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-3">
        <ShieldCheck className="text-gold" size={28} />
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal">
          Military Verification
        </h1>
      </div>

      {pending.length === 0 ? (
        <div className="rounded-xl border border-grey-mid bg-white p-10 text-center">
          <p className="font-body text-grey-dark">
            No pending verifications. You&apos;re all caught up.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((v) => (
            <div
              key={v.id}
              className="flex flex-col gap-4 rounded-xl border border-grey-mid bg-white p-5 md:flex-row md:items-center md:justify-between"
            >
              <div className="min-w-0">
                <p className="font-display text-lg font-semibold text-charcoal">
                  {fullName(v.user.firstName, v.user.lastName)}
                </p>
                <p className="font-body text-sm text-grey-dark">
                  {v.user.email}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-body text-xs text-grey-dark">
                  <span>
                    <span className="font-semibold text-charcoal">Type:</span>{' '}
                    {v.user.accountType}
                  </span>
                  {v.user.militaryBranch && (
                    <span>
                      <span className="font-semibold text-charcoal">
                        Branch:
                      </span>{' '}
                      {v.user.militaryBranch}
                    </span>
                  )}
                  <span>
                    <span className="font-semibold text-charcoal">
                      Submitted:
                    </span>{' '}
                    {v.submittedAt.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                {v.documentUrl ? (
                  <a
                    href={v.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 font-body text-sm font-medium text-green hover:text-gold-dark"
                  >
                    <FileText size={16} />
                    View Document
                  </a>
                ) : (
                  <p className="mt-3 font-body text-sm italic text-grey-dark">
                    No document uploaded
                  </p>
                )}
              </div>

              <VerificationActions userId={v.user.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
