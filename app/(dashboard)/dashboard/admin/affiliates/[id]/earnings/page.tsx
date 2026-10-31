import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { requireAdmin } from '@/lib/auth/guards'
import { db } from '@/lib/db/client'

export const dynamic = 'force-dynamic'

export default async function AffiliateEarningsPage({
  params,
}: {
  params: { id: string }
}) {
  await requireAdmin()

  const partner = await db.affiliatePartner.findUnique({
    where: { id: params.id },
    include: {
      earnings: { orderBy: { month: 'desc' } },
    },
  })

  if (!partner) notFound()

  const totalEarned = partner.earnings.reduce(
    (sum, e) => sum + e.totalEarnedCents,
    0
  )

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-10">
      <Link
        href="/dashboard/admin/affiliates"
        className="inline-flex items-center gap-1 font-body text-sm font-semibold text-green hover:text-green-light"
      >
        <ArrowLeft size={16} /> All affiliates
      </Link>

      <h1 className="mt-4 font-display text-2xl font-bold uppercase tracking-wide text-green">
        {partner.name} — Earnings
      </h1>
      <p className="mt-1 font-body text-sm text-grey-dark">
        Commission rate {(Number(partner.commissionRate) * 100).toFixed(0)}% ·
        Total earned ${(totalEarned / 100).toFixed(2)}
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-grey-mid bg-white">
        {partner.earnings.length === 0 ? (
          <p className="px-5 py-8 text-center font-body text-sm text-grey-dark">
            No earnings recorded yet.
          </p>
        ) : (
          <table className="w-full min-w-[560px] text-left">
            <thead className="border-b border-grey-mid bg-grey-light">
              <tr className="font-display text-xs uppercase tracking-wide text-grey-dark">
                <th className="px-4 py-3">Month</th>
                <th className="px-4 py-3">Clicks</th>
                <th className="px-4 py-3">Conversions</th>
                <th className="px-4 py-3">Earned</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grey-mid font-body text-sm text-charcoal">
              {partner.earnings.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-3 font-mono">{e.month}</td>
                  <td className="px-4 py-3 font-mono">{e.totalClicks}</td>
                  <td className="px-4 py-3 font-mono">{e.totalConversions}</td>
                  <td className="px-4 py-3 font-mono">
                    ${(e.totalEarnedCents / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 capitalize">{e.status}</td>
                  <td className="px-4 py-3 font-mono text-xs text-grey-dark">
                    {e.paidAt ? new Date(e.paidAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/*
        TODO: Affiliate earnings are currently populated only by manual/seeded
        data. Wire real click + conversion tracking from checkout: on an order
        that carries an affiliate tracking param (AffiliatePartner.trackingParam)
        in its attribution, create an AffiliateClick (converted=true,
        orderValueCents) and roll it up into the AffiliateEarning row for the
        current month (commissionRate * orderValue). This public-facing tracking
        is intentionally deferred for now.
      */}
    </div>
  )
}
