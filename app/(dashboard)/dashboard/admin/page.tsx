import Link from 'next/link'
import { format } from 'date-fns'
import { Users, CreditCard, ShieldCheck, UserPlus } from 'lucide-react'
import { requireAdmin } from '@/lib/auth/guards'
import { db } from '@/lib/db/client'
import { formatTierName } from '@/lib/stripe/billing'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Admin Overview | Star Haven Strength' }

const KPIS = [
  { key: 'clients', label: 'Total Clients', icon: Users },
  { key: 'active', label: 'Active Subscriptions', icon: CreditCard },
  { key: 'pending', label: 'Pending Verifications', icon: ShieldCheck },
  { key: 'newThisMonth', label: 'New This Month', icon: UserPlus },
] as const

export default async function AdminOverview() {
  await requireAdmin()

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000)

  const [totalClients, activeSubs, pendingVerifs, newThisMonth, recentClients] =
    await Promise.all([
      db.user.count({ where: { role: 'client' } }),
      db.subscription.count({ where: { status: 'active' } }),
      db.militaryVerification.count({ where: { status: 'pending' } }),
      db.user.count({
        where: { role: 'client', createdAt: { gte: thirtyDaysAgo } },
      }),
      db.user.findMany({
        where: { role: 'client' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          accountType: true,
          createdAt: true,
          subscriptions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { tier: true, status: true },
          },
        },
      }),
    ])

  const counts: Record<string, number> = {
    clients: totalClients,
    active: activeSubs,
    pending: pendingVerifs,
    newThisMonth,
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-green">
          Admin Overview
        </h1>

        {/* Pending verification alert */}
        {pendingVerifs > 0 && (
          <Link
            href="/dashboard/admin/military-verify"
            className="mt-6 block rounded-xl border border-gold/50 bg-gold/10 px-5 py-4 transition-colors hover:bg-gold/20"
          >
            <p className="font-display text-sm font-bold uppercase tracking-wide text-gold-dark">
              {pendingVerifs} client{pendingVerifs === 1 ? '' : 's'} awaiting
              military verification.
            </p>
            <p className="mt-0.5 font-body text-sm text-charcoal">
              Review the verification queue →
            </p>
          </Link>
        )}

        {/* KPI cards */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {KPIS.map((kpi) => {
            const Icon = kpi.icon
            return (
              <div
                key={kpi.key}
                className="rounded-xl border border-grey-mid border-t-4 border-t-green bg-white p-5 shadow-sm"
              >
                <Icon size={20} className="text-green" />
                <p className="mt-3 font-mono text-3xl font-bold text-charcoal">
                  {counts[kpi.key]}
                </p>
                <p className="mt-1 font-body text-sm text-grey-dark">
                  {kpi.label}
                </p>
              </div>
            )
          })}
        </div>

        {/* Recent clients */}
        <h2 className="mt-10 font-display text-xl font-bold text-charcoal">
          Recent Clients
        </h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-grey-mid bg-white">
          {recentClients.length === 0 ? (
            <p className="px-5 py-8 text-center font-body text-sm text-grey-dark">
              No clients yet.
            </p>
          ) : (
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-grey-mid font-display text-xs font-bold uppercase tracking-wide text-grey-dark">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Account Type</th>
                  <th className="px-5 py-3">Subscription</th>
                  <th className="px-5 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grey-mid">
                {recentClients.map((c) => (
                  <tr key={c.id} className="hover:bg-grey-light">
                    <td className="px-5 py-3">
                      <Link
                        href={`/dashboard/admin/clients/${c.id}`}
                        className="font-body text-sm font-semibold text-green hover:underline"
                      >
                        {[c.firstName, c.lastName].filter(Boolean).join(' ') ||
                          'Unnamed'}
                      </Link>
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-charcoal">
                      {c.email}
                    </td>
                    <td className="px-5 py-3 font-body text-sm capitalize text-charcoal">
                      {c.accountType}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-charcoal">
                      {c.subscriptions[0]
                        ? formatTierName(c.subscriptions[0].tier)
                        : 'Free'}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-grey-dark">
                      {format(c.createdAt, 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
