/**
 * Referral commission configuration.
 *
 * Andrew can change the commission rate here in one place. The rate is applied
 * to the amount a referred member actually pays on each successful invoice.
 */

/** Commission paid to the referrer, as a fraction of the referee's payment. */
export const REFERRAL_COMMISSION_RATE = 0.1 // 10%

/**
 * Compute the commission (in cents) owed to a referrer for a given payment.
 * Rounds to the nearest cent and never returns a negative value.
 */
export function computeCommissionCents(amountPaidCents: number): number {
  if (!amountPaidCents || amountPaidCents <= 0) return 0
  return Math.round(amountPaidCents * REFERRAL_COMMISSION_RATE)
}

/** Build the YYYY-MM key used for the per-month commission idempotency key. */
export function commissionMonthKey(date: Date = new Date()): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}
