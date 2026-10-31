import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AlertTriangle, Info, Sparkles } from 'lucide-react'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db/client'
import {
  getUserSubscription,
  getInvoiceHistory,
  formatTierName,
  formatSubscriptionStatus,
  type InvoiceSummary,
} from '@/lib/stripe/billing'
import ManageBillingButton from '@/components/billing/ManageBillingButton'

export const metadata = {
  title: 'Billing | Star Haven Strength',
}

function formatDate(date: Date | null): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function formatMoney(cents: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}

export default async function BillingSettingsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/dashboard/settings/billing')
  }
  const userId = session.user.id

  const [user, { db: dbSub, stripe: stripeSub }, newbie] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true, militaryVerified: true },
    }),
    getUserSubscription(userId),
    db.newbieDesignation.findUnique({ where: { userId } }),
  ])

  const invoices: InvoiceSummary[] = user?.stripeCustomerId
    ? await getInvoiceHistory(user.stripeCustomerId)
    : []

  const hasSubscription = !!dbSub
  const status = dbSub ? formatSubscriptionStatus(dbSub.status) : null
  const cancelAtPeriodEnd =
    stripeSub?.cancel_at_period_end ?? dbSub?.cancelAtPeriodEnd ?? false

  return (
    <main className="min-h-screen bg-grey-light px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link
            href="/dashboard/settings"
            className="font-body text-sm text-green hover:underline"
          >
            ← Settings
          </Link>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-wide text-green">
            Billing
          </h1>
        </div>

        {/* Alerts */}
        {dbSub?.status === 'past_due' && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertTriangle className="mt-0.5 shrink-0 text-red-600" size={20} />
            <div>
              <p className="font-display font-bold text-red-700">
                Payment past due
              </p>
              <p className="font-body text-sm text-red-700/90">
                Your last payment failed. Please update your payment method to
                keep your membership active.
              </p>
            </div>
          </div>
        )}

        {cancelAtPeriodEnd && dbSub?.status !== 'canceled' && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-gold/40 bg-gold/10 p-4">
            <Info className="mt-0.5 shrink-0 text-gold-dark" size={20} />
            <div>
              <p className="font-display font-bold text-green">
                Subscription ending
              </p>
              <p className="font-body text-sm text-grey-dark">
                Your plan is set to cancel on{' '}
                {formatDate(dbSub?.currentPeriodEnd ?? null)}. You can resume it
                anytime from the billing portal.
              </p>
            </div>
          </div>
        )}

        {/* Current plan */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold text-charcoal">
            Current Plan
          </h2>

          {hasSubscription && dbSub ? (
            <div className="mt-4 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-display text-2xl font-bold text-green">
                  {formatTierName(dbSub.tier)}
                </span>
                {status && (
                  <span
                    className={`rounded-full px-3 py-1 font-body text-xs font-semibold ${status.className}`}
                  >
                    {status.label}
                  </span>
                )}
              </div>

              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="font-body text-sm text-grey-dark">
                    {cancelAtPeriodEnd ? 'Ends on' : 'Renews on'}
                  </dt>
                  <dd className="font-mono text-base text-charcoal">
                    {formatDate(dbSub.currentPeriodEnd)}
                  </dd>
                </div>
                <div>
                  <dt className="font-body text-sm text-grey-dark">
                    Member since
                  </dt>
                  <dd className="font-mono text-base text-charcoal">
                    {formatDate(dbSub.createdAt)}
                  </dd>
                </div>
              </dl>

              <ManageBillingButton />
            </div>
          ) : (
            <div className="mt-4">
              <p className="font-body text-grey-dark">
                You don’t have an active subscription.
              </p>
              <Link
                href="/pricing"
                className="mt-4 inline-block rounded-lg bg-green px-5 py-3 font-display font-semibold uppercase tracking-wide text-gold transition-colors hover:bg-green-light"
              >
                View Plans
              </Link>
            </div>
          )}
        </section>

        {/* Newbie discount status */}
        {newbie && newbie.discountActive && (
          <section className="mt-6 flex items-start gap-3 rounded-2xl border border-gold/40 bg-gold/5 p-6">
            <Sparkles className="mt-0.5 shrink-0 text-gold-dark" size={22} />
            <div>
              <h2 className="font-display text-lg font-bold text-green">
                New client discount active
              </h2>
              <p className="font-body text-sm text-grey-dark">
                You’re receiving $50 off each of your first 3 months. Enjoy your
                start with Star Haven!
              </p>
            </div>
          </section>
        )}

        {/* Invoice history */}
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold text-charcoal">
            Invoice History
          </h2>
          {invoices.length === 0 ? (
            <p className="mt-4 font-body text-grey-dark">No invoices yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-grey-mid">
                    <th className="pb-2 font-body text-sm font-semibold text-grey-dark">
                      Date
                    </th>
                    <th className="pb-2 font-body text-sm font-semibold text-grey-dark">
                      Invoice
                    </th>
                    <th className="pb-2 font-body text-sm font-semibold text-grey-dark">
                      Amount
                    </th>
                    <th className="pb-2 font-body text-sm font-semibold text-grey-dark">
                      Status
                    </th>
                    <th className="pb-2" />
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-grey-mid/60">
                      <td className="py-3 font-body text-sm text-charcoal">
                        {formatDate(inv.createdAt)}
                      </td>
                      <td className="py-3 font-mono text-sm text-charcoal">
                        {inv.number ?? '—'}
                      </td>
                      <td className="py-3 font-mono text-sm text-charcoal">
                        {formatMoney(inv.amountPaidCents, inv.currency)}
                      </td>
                      <td className="py-3 font-body text-sm capitalize text-grey-dark">
                        {inv.status ?? '—'}
                      </td>
                      <td className="py-3 text-right">
                        {inv.hostedInvoiceUrl && (
                          <a
                            href={inv.hostedInvoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-body text-sm text-green hover:underline"
                          >
                            View
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
