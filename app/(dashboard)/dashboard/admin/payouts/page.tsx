import { format } from 'date-fns'
import { requireAdmin } from '@/lib/auth/guards'
import { db } from '@/lib/db/client'
import PayoutActions from '@/components/admin/PayoutActions'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Payouts | Star Haven Strength' }

function statusBadge(status: string): string {
  switch (status) {
    case 'approved':
      return 'bg-green/10 text-green'
    case 'rejected':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gold/20 text-gold-dark'
  }
}

export default async function AdminPayoutsPage() {
  await requireAdmin()

  const payouts = await db.payoutRequest.findMany({
    orderBy: { requestedAt: 'desc' },
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true },
      },
    },
  })

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10">
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-green">
        Payout Requests
      </h1>

      <div className="mt-6 overflow-x-auto rounded-xl border border-grey-mid bg-white">
        {payouts.length === 0 ? (
          <p className="px-5 py-8 text-center font-body text-sm text-grey-dark">
            No payout requests yet.
          </p>
        ) : (
          <table className="w-full min-w-[720px] text-left">
            <thead className="border-b border-grey-mid bg-grey-light">
              <tr className="font-display text-xs uppercase tracking-wide text-grey-dark">
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Requested</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-grey-mid font-body text-sm text-charcoal">
              {payouts.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-semibold">
                    {[p.user.firstName, p.user.lastName]
                      .filter(Boolean)
                      .join(' ') || 'Unnamed'}
                  </td>
                  <td className="px-4 py-3">{p.user.email}</td>
                  <td className="px-4 py-3 font-mono">
                    ${(p.amountCents / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 font-display text-[10px] font-bold uppercase ${statusBadge(
                        p.status
                      )}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-grey-dark">
                    {format(p.requestedAt, 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3">
                    {p.status === 'pending' ? (
                      <PayoutActions payoutId={p.id} />
                    ) : (
                      <span className="block text-right font-mono text-xs text-grey-dark">
                        {p.processedAt
                          ? format(p.processedAt, 'MMM d, yyyy')
                          : '—'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
