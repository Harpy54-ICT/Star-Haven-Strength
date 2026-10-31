import { db } from '@/lib/db/client'
import { requireAdmin } from '@/lib/auth/guards'
import { ScrollText } from 'lucide-react'

export const dynamic = 'force-dynamic'

function fullName(firstName: string | null, lastName: string | null): string {
  return [firstName, lastName].filter(Boolean).join(' ') || '—'
}

export default async function AuditLogPage() {
  await requireAdmin()

  const entries = await db.adminAuditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      admin: { select: { firstName: true, lastName: true } },
      targetUser: { select: { firstName: true, lastName: true } },
    },
  })

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-3">
        <ScrollText className="text-gold" size={28} />
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal">
          Audit Log
        </h1>
      </div>

      <div className="overflow-hidden rounded-xl border border-grey-mid bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-grey-light">
              <tr className="font-body text-xs font-semibold uppercase tracking-wide text-grey-dark">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grey-mid">
              {entries.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center font-body text-sm text-grey-dark"
                  >
                    No audit log entries yet.
                  </td>
                </tr>
              ) : (
                entries.map((e) => (
                  <tr key={e.id} className="align-top font-body text-sm">
                    <td className="whitespace-nowrap px-4 py-3 text-grey-dark">
                      {e.createdAt.toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-charcoal">
                      {fullName(e.admin?.firstName, e.admin?.lastName)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-green/10 px-2 py-1 font-mono text-xs text-green-dark">
                        {e.action}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-charcoal">
                      {e.targetUser
                        ? fullName(e.targetUser.firstName, e.targetUser.lastName)
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-grey-dark">
                      {e.reason && <p className="mb-1">{e.reason}</p>}
                      {e.metadata != null && (
                        <pre className="max-w-xs overflow-x-auto whitespace-pre-wrap rounded bg-grey-light p-2 font-mono text-xs text-charcoal">
                          {JSON.stringify(e.metadata, null, 2)}
                        </pre>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
